use deno_core::v8;
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;
use deno_core::Snapshot;
use once_cell::sync::Lazy;

pub fn create_js_runtime() -> JsRuntime {
  let snapshot = Snapshot::Static(&*STARTUP_SNAPSHOT);
  let platform = v8::new_default_platform(1, false).make_shared();

  JsRuntime::new(RuntimeOptions {
    startup_snapshot: Some(snapshot),
    v8_platform: Some(platform),
    ..Default::default()
  })
}

// Copied from Deno's codebase:
// https://github.com/denoland/deno/blob/daa7c6d32ab5a4029f8084e174d621f5562256be/cli/tsc.rs#L55
static STARTUP_SNAPSHOT: Lazy<Box<[u8]>> = Lazy::new(
  #[cold]
  #[inline(never)]
  || {
    static COMPRESSED_COMPILER_SNAPSHOT: &[u8] =
      include_bytes!(concat!(env!("OUT_DIR"), "/STARTUP_SNAPSHOT.bin"));

    zstd::block::decompress(
      &COMPRESSED_COMPILER_SNAPSHOT[4..],
      u32::from_le_bytes(COMPRESSED_COMPILER_SNAPSHOT[0..4].try_into().unwrap()) as usize,
    )
    .unwrap()
    .into_boxed_slice()
  },
);
