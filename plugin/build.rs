// Code in this file is largely copy and pasted from Deno's codebase
// https://github.com/denoland/deno/blob/main/cli/build.rs

use std::env;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

use deno_core::ascii_str;
use deno_core::serde_v8;
use deno_core::snapshot_util::CreateSnapshotOutput;
use deno_core::v8;
use deno_core::v8::Platform;
use deno_core::v8::SharedRef;
use deno_core::Extension;
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;
use deno_core::Snapshot;

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

  let _output = create_snapshot(startup_snapshot_path.clone(), &js_dir);
  // for path in output.files_loaded_during_snapshot {
  //   println!("cargo:rerun-if-changed={}", path.display());
  // }

  // serialize the supported extensions
  eprintln!("Creating runtime...");
  let mut js_runtime = JsRuntime::new(runtime_options(&startup_snapshot_path));
  let global = js_runtime
    .execute_script(
      "deno:get_extensions.js",
      ascii_str!("dprint.getExtensions()"),
    )
    .unwrap();
  let scope = &mut js_runtime.handle_scope();
  let local = v8::Local::new(scope, global);
  let deserialized_value = serde_v8::from_v8::<Vec<String>>(scope, local).unwrap();
  std::fs::write(
    supported_extensions_path,
    deno_core::serde_json::to_string(&deserialized_value).unwrap(),
  )
  .unwrap();
}

fn create_snapshot(snapshot_path: PathBuf, js_dir: &Path) -> CreateSnapshotOutput {
  let startup_code_path = js_dir.join("startup.js");
  deno_core::snapshot_util::create_snapshot(deno_core::snapshot_util::CreateSnapshotOptions {
    cargo_manifest_dir: env!("CARGO_MANIFEST_DIR"),
    snapshot_path,
    startup_snapshot: None,
    extensions: extensions(),
    compression_cb: Some(Box::new(|vec, snapshot_slice| {
      eprintln!("Compressing snapshot...");
      vec.extend_from_slice(
        &zstd::bulk::compress(snapshot_slice, 22).expect("snapshot compression failed"),
      );
    })),
    snapshot_module_load_cb: None,
    with_runtime_cb: Some(Box::new(move |runtime| {
      runtime
        .execute_script(
          "dprint:prettier.js",
          std::fs::read_to_string(&startup_code_path).unwrap().into(),
        )
        .unwrap();
    })),
  })
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

fn runtime_options(snapshot_path: &Path) -> RuntimeOptions {
  let snapshot_bytes = std::fs::read(snapshot_path).unwrap();

  let snapshot = Snapshot::Boxed(
    zstd::bulk::decompress(
      &snapshot_bytes[4..],
      u32::from_le_bytes(snapshot_bytes[0..4].try_into().unwrap()) as usize,
    )
    .unwrap()
    .into_boxed_slice(),
  );

  RuntimeOptions {
    v8_platform: Some(platform()),
    extensions: Vec::new(),
    startup_snapshot: Some(snapshot),
    ..Default::default()
  }
}

fn platform() -> SharedRef<Platform> {
  v8::new_default_platform(1, false).make_shared()
}
