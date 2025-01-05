// Code in this file is largely copy and pasted from Deno's codebase
// https://github.com/denoland/deno/blob/main/cli/build.rs

use std::env;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

use deno_core::Extension;
use dprint_plugin_deno_base::runtime::CreateRuntimeOptions;
use dprint_plugin_deno_base::runtime::JsRuntime;
use dprint_plugin_deno_base::util::create_tokio_runtime;

fn main() {
  let crate_dir = PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").unwrap());
  let root_dir = crate_dir.parent().unwrap();
  let out_dir = PathBuf::from(env::var_os("OUT_DIR").unwrap());
  let startup_snapshot_path = out_dir.join("STARTUP_SNAPSHOT.bin");
  let js_dir = root_dir.join("js");
  let supported_extensions_path = out_dir.join("SUPPORTED_EXTENSIONS.json");

  eprintln!("Running JS build...");
  let build_result = Command::new(if cfg!(windows) { "npm.cmd" } else { "npm" })
    .args(["run", "build:script"])
    .current_dir(js_dir.join("node"))
    .status();
  match build_result {
    Ok(status) => {
      if status.code() != Some(0) {
        panic!("Error building.");
      }
    }
    Err(err) if err.kind() == std::io::ErrorKind::NotFound => {
      eprintln!("Skipping build because npm executable not found.");
    }
    Err(err) => panic!("Error building to script: {}", err),
  }

  // ensure the build is invalidated if any of these files change
  println!(
    "cargo:rerun-if-changed={}",
    js_dir.join("node/main.ts").display()
  );
  println!(
    "cargo:rerun-if-changed={}",
    js_dir.join("node/package.json").display()
  );
  println!(
    "cargo:rerun-if-changed={}",
    js_dir.join("node/package-lock.json").display()
  );
  println!(
    "cargo:rerun-if-changed={}",
    js_dir.join("node/shims/url.js").display()
  );

  let startup_code_path = js_dir.join("node/dist/main.js");
  if !startup_code_path.exists() {
    panic!("Run `cd js/node && npm run build:script` first.");
  }
  let snapshot = create_snapshot(startup_snapshot_path.clone(), &startup_code_path);
  let snapshot = Box::leak(snapshot);

  // serialize the supported extensions
  eprintln!("Creating runtime...");
  let tokio_runtime = create_tokio_runtime();
  JsRuntime::initialize_main_thread();
  let mut runtime = JsRuntime::new(CreateRuntimeOptions {
    extensions: vec![
      deno_webidl::deno_webidl::init_ops(),
      deno_console::deno_console::init_ops(),
      deno_url::deno_url::init_ops(),
      main::init_ops(),
    ],
    startup_snapshot: Some(snapshot),
  });

  eprintln!("Getting extensions...");
  let file_extensions: Vec<String> = tokio_runtime.block_on(async move {
    let startup_text = get_startup_text(&startup_code_path);
    runtime
      .execute_script("dprint:prettier.js", startup_text.clone())
      .unwrap();
    runtime
      .execute_async_fn::<Vec<String>>("deno:get_extensions.js", "dprint.getExtensions".to_string())
      .await
      .unwrap()
  });
  std::fs::write(
    supported_extensions_path,
    deno_core::serde_json::to_string(&file_extensions).unwrap(),
  )
  .unwrap();
  eprintln!("Done");
}

fn create_snapshot(snapshot_path: PathBuf, startup_code_path: &Path) -> Box<[u8]> {
  let startup_text = get_startup_text(startup_code_path);
  dprint_plugin_deno_base::build::create_snapshot(
    dprint_plugin_deno_base::build::CreateSnapshotOptions {
      cargo_manifest_dir: env!("CARGO_MANIFEST_DIR"),
      snapshot_path,
      extensions: extensions(),
      with_runtime_cb: Some(Box::new(move |runtime| {
        runtime
          .execute_script("dprint:prettier.js", startup_text.clone())
          .unwrap();
      })),
      warmup_script: None,
    },
  )
}

fn get_startup_text(startup_code_path: &Path) -> String {
  std::fs::read_to_string(startup_code_path).unwrap()
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
