// Code in this file is largely copy and pasted from Deno's codebase
// https://github.com/denoland/deno/blob/main/cli/build.rs

use std::env;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

use deno_core::Extension;
use dprint_plugin_deno_base::runtime::CreateRuntimeOptions;
use dprint_plugin_deno_base::runtime::JsRuntime;
use dprint_plugin_deno_base::runtime::StartupSnapshot;
use dprint_plugin_deno_base::snapshot::Snapshot;
use dprint_plugin_deno_base::util::create_tokio_runtime;

fn main() {
  let crate_dir = PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").unwrap());
  let root_dir = crate_dir.parent().unwrap();
  let out_dir = PathBuf::from(env::var_os("OUT_DIR").unwrap());
  let startup_snapshot_path = out_dir.join("STARTUP_SNAPSHOT.bin");
  let js_dir = root_dir.join("js");
  let js_src_dir = js_dir.join("node").join("src");
  let supported_extensions_path = out_dir.join("SUPPORTED_EXTENSIONS.json");

  let status = Command::new("deno")
    .args(["task", "build"])
    .status()
    .unwrap();
  if status.code() != Some(0) {
    panic!("Error building.");
  }

  // ensure the build is invalidated if any of these files change
  println!(
    "cargo:rerun-if-changed={}",
    js_src_dir.join("main.ts").display()
  );
  println!(
    "cargo:rerun-if-changed={}",
    js_src_dir.join("package.json").display()
  );
  println!(
    "cargo:rerun-if-changed={}",
    js_src_dir.join("package-lock.json").display()
  );
  println!(
    "cargo:rerun-if-changed={}",
    js_src_dir.join("shims/url.js").display()
  );

  create_snapshot(startup_snapshot_path.clone(), &js_dir);

  // serialize the supported extensions
  eprintln!("Creating runtime...");
  let tokio_runtime = create_tokio_runtime();
  let snapshot = Snapshot::from_path(&startup_snapshot_path).unwrap();
  let mut runtime = JsRuntime::new(CreateRuntimeOptions {
    extensions: Vec::new(),
    startup_snapshot: Some(StartupSnapshot::Boxed(snapshot)),
  });
  let file_extensions = tokio_runtime
    .block_on(runtime.execute_async_fn::<Vec<String>>(
      "deno:get_extensions.js",
      "dprint.getExtensions".to_string(),
    ))
    .unwrap();
  std::fs::write(
    supported_extensions_path,
    deno_core::serde_json::to_string(&file_extensions).unwrap(),
  )
  .unwrap();
}

fn create_snapshot(snapshot_path: PathBuf, js_dir: &Path) {
  let startup_code_path = js_dir.join("node/dist/main.js");
  let startup_text = std::fs::read_to_string(startup_code_path).unwrap();
  dprint_plugin_deno_base::build::create_snapshot(
    dprint_plugin_deno_base::build::CreateSnapshotOptions {
      cargo_manifest_dir: env!("CARGO_MANIFEST_DIR"),
      snapshot_path,
      extensions: extensions(),
      with_runtime_cb: Some(Box::new(move |runtime| {
        runtime
          .execute_script("dprint:prettier.js", startup_text.clone().into())
          .unwrap();
      })),
    },
  );
}

deno_core::extension!(
  main,
  esm_entry_point = "ext:main/main.js",
  esm = [
    dir "../js",
    "main.js",
  ]
);

fn extensions() -> Vec<Extension> {
  vec![
    deno_webidl::deno_webidl::init_ops_and_esm(),
    deno_console::deno_console::init_ops_and_esm(),
    deno_url::deno_url::init_ops_and_esm(),
    main::init_ops_and_esm(),
  ]
}
