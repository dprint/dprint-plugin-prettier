use std::path::PathBuf;

use deno_core::Extension;
use deno_core::JsRuntimeForSnapshot;

pub type WithRuntimeCb = dyn Fn(&mut JsRuntimeForSnapshot);

pub struct CreateSnapshotOptions {
  pub cargo_manifest_dir: &'static str,
  pub snapshot_path: PathBuf,
  pub extensions: Vec<Extension>,
  pub with_runtime_cb: Option<Box<WithRuntimeCb>>,
  pub warmup_script: Option<&'static str>,
}

/// Creates a snapshot, returning the uncompressed bytes.
pub fn create_snapshot(options: CreateSnapshotOptions) -> Box<[u8]> {
  let snapshot_output = deno_core::snapshot::create_snapshot(
    deno_core::snapshot::CreateSnapshotOptions {
      cargo_manifest_dir: options.cargo_manifest_dir,
      startup_snapshot: None,
      extensions: options.extensions,
      skip_op_registration: false,
      with_runtime_cb: options.with_runtime_cb,
      extension_transpiler: None,
    },
    options.warmup_script,
  )
  .unwrap();

  let mut output = snapshot_output.output.clone();
  if !cfg!(debug_assertions) {
    eprintln!("Compressing snapshot...");
    let mut vec = Vec::with_capacity(output.len());
    vec.extend((output.len() as u32).to_le_bytes());
    vec.extend_from_slice(&zstd::bulk::compress(&output, 22).expect("snapshot compression failed"));
    output = vec.into();
  }
  std::fs::write(&options.snapshot_path, output).unwrap();

  for file in snapshot_output.files_loaded_during_snapshot {
    println!("cargo:rerun-if-changed={}", file.display());
  }

  snapshot_output.output
}
