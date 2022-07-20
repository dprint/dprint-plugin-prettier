// Code in this file is largely copy and pasted from Deno's codebase
// https://github.com/denoland/deno/blob/main/cli/build.rs

use std::env;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

use deno_core::include_js_files;
use deno_core::serde_v8;
use deno_core::v8;
use deno_core::Extension;
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;

fn main() {
  let c = PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").unwrap());
  let o = PathBuf::from(env::var_os("OUT_DIR").unwrap());
  let startup_snapshot_path = o.join("STARTUP_SNAPSHOT.bin");
  let js_dir = c.join("js");
  let js_src_dir = js_dir.join("src");
  let startup_code_path = js_dir.join("startup.js");
  let supported_extensions_path = o.join("SUPPORTED_EXTENSIONS.json");

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

  let mut js_runtime = get_runtime(&startup_code_path, true);
  let snapshot = js_runtime.snapshot();
  let snapshot_slice: &[u8] = &*snapshot;

  let compressed_snapshot_with_size = {
    let mut vec = vec![];

    vec.extend_from_slice(
      &u32::try_from(snapshot.len())
        .expect("snapshot larger than 4gb")
        .to_le_bytes(),
    );

    vec.extend_from_slice(
      &zstd::block::compress(snapshot_slice, 22).expect("snapshot compression failed"),
    );

    vec
  };

  std::fs::write(&startup_snapshot_path, compressed_snapshot_with_size).unwrap();

  // serialize the supported extensions
  let mut js_runtime = get_runtime(&startup_code_path, false); // panics otherwise
  let global = js_runtime
    .execute_script(&"deno:get_extensions.js", "dprint.getExtensions()")
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

fn get_runtime(startup_code_path: &Path, will_snapshot: bool) -> JsRuntime {
  let platform = v8::new_default_platform(1, false).make_shared();
  let mut js_runtime = JsRuntime::new(RuntimeOptions {
    will_snapshot,
    v8_platform: Some(platform),
    extensions: vec![
      deno_webidl::init(),
      deno_console::init(),
      deno_url::init(),
      Extension::builder()
        .js(include_js_files!(
          prefix "deno:main",
          "src/main.js",
        ))
        .build(),
    ],
    ..Default::default()
  });

  js_runtime
    .execute_script(
      &"dprint:prettier.js",
      &std::fs::read_to_string(startup_code_path).unwrap(),
    )
    .unwrap();

  js_runtime
}
