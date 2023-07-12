use deno_core::v8;
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;
use deno_core::Snapshot;
use once_cell::sync::Lazy;

pub fn create_js_runtime() -> JsRuntime {
  let snapshot = Snapshot::Static(&STARTUP_SNAPSHOT);
  let platform = v8::new_default_platform(1, false).make_shared();

  JsRuntime::new(RuntimeOptions {
    startup_snapshot: Some(snapshot),
    v8_platform: Some(platform),
    extensions: vec![
      deno_webidl::deno_webidl::init_ops(),
      deno_console::deno_console::init_ops(),
      deno_url::deno_url::init_ops(),
    ],
    ..Default::default()
  })
}

// Copied from Deno's codebase:
// https://github.com/denoland/deno/blob/daa7c6d32ab5a4029f8084e174d621f5562256be/cli/tsc.rs#L55
static STARTUP_SNAPSHOT: Lazy<Box<[u8]>> = Lazy::new(
  #[cold]
  #[inline(never)]
  || {
    set_v8_max_memory(512);
    static COMPRESSED_COMPILER_SNAPSHOT: &[u8] =
      include_bytes!(concat!(env!("OUT_DIR"), "/STARTUP_SNAPSHOT.bin"));

    zstd::bulk::decompress(
      &COMPRESSED_COMPILER_SNAPSHOT[4..],
      u32::from_le_bytes(COMPRESSED_COMPILER_SNAPSHOT[0..4].try_into().unwrap()) as usize,
    )
    .unwrap()
    .into_boxed_slice()
  },
);

pub fn set_v8_max_memory(max_memory: usize) {
  // todo: add as config option
  deno_core::v8_set_flags(vec![format!("--max-old-space-size={}", max_memory)]);
}