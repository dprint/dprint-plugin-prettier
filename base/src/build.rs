use std::path::PathBuf;

use deno_core::snapshot_util::CreateSnapshotOutput;
use deno_core::Extension;
use deno_core::JsRuntimeForSnapshot;

pub type WithRuntimeCb = dyn Fn(&mut JsRuntimeForSnapshot);

pub struct CreateSnapshotOptions {
  pub cargo_manifest_dir: &'static str,
  pub snapshot_path: PathBuf,
  pub extensions: Vec<Extension>,
  pub with_runtime_cb: Option<Box<WithRuntimeCb>>,
}

pub fn create_snapshot(options: CreateSnapshotOptions) -> CreateSnapshotOutput {
  deno_core::snapshot_util::create_snapshot(deno_core::snapshot_util::CreateSnapshotOptions {
    cargo_manifest_dir: options.cargo_manifest_dir,
    snapshot_path: options.snapshot_path,
    startup_snapshot: None,
    extensions: options.extensions,
    skip_op_registration: false,
    #[cfg(debug_assertions)]
    compression_cb: None,
    #[cfg(not(debug_assertions))]
    compression_cb: Some(Box::new(|vec, snapshot_slice| {
      eprintln!("Compressing snapshot...");
      vec.extend_from_slice(
        &zstd::bulk::compress(snapshot_slice, 22).expect("snapshot compression failed"),
      );
    })),
    with_runtime_cb: options.with_runtime_cb,
  })
}
