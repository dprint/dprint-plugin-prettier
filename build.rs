// Code in this file is largely copy and pasted from Deno's codebase
// https://github.com/denoland/deno/blob/main/cli/build.rs

use std::env;
use std::path::Path;
use std::path::PathBuf;

use deno_core::anyhow::Error;
use deno_core::op;
use deno_core::serde_v8;
use deno_core::v8;
use deno_core::Extension;
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;

fn main() {
  let c = PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").unwrap());
  let o = PathBuf::from(env::var_os("OUT_DIR").unwrap());
  let startup_snapshot_path = o.join("STARTUP_SNAPSHOT.bin");
  let startup_code_path = c.join("js").join("startup.js");
  let supported_extensions_path = o.join("SUPPORTED_EXTENSIONS.json");

  // ensure the build is invalidated if the startup file changes
  println!("cargo:rerun-if-changed={}", startup_code_path.display());
  let mut js_runtime = get_runtime(&startup_code_path, true);
  let snapshot = js_runtime.snapshot();
  let snapshot_slice: &[u8] = &*snapshot;
  println!("Snapshot size: {}", snapshot_slice.len());

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

  println!(
    "Snapshot compressed size: {}",
    compressed_snapshot_with_size.len()
  );

  std::fs::write(&startup_snapshot_path, compressed_snapshot_with_size).unwrap();
  println!("Snapshot written to: {} ", startup_snapshot_path.display());

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
  let mut js_runtime = JsRuntime::new(RuntimeOptions {
    will_snapshot,
    extensions: vec![Extension::builder()
      .ops(vec![op_is_windows::decl()])
      .build()],
    ..Default::default()
  });

  js_runtime
    .execute_script(
      &"deno:startup.js",
      &std::fs::read_to_string(startup_code_path).unwrap(),
    )
    .unwrap();

  js_runtime
}

#[op]
pub fn op_is_windows() -> Result<bool, Error> {
  Ok(if cfg!(windows) { true } else { false })
}
