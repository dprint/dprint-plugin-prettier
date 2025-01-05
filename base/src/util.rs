use sysinfo::MemoryRefreshKind;
use sysinfo::System;

/// Creates a single threaded tokio runtime that can be used
/// with deno_core.
pub fn create_tokio_runtime() -> tokio::runtime::Runtime {
  create_tokio_runtime_builder().build().unwrap()
}

pub fn create_tokio_runtime_builder() -> tokio::runtime::Builder {
  // use a single thread for the communication and for
  // each of the isolates
  let mut builder = tokio::runtime::Builder::new_current_thread();
  builder.enable_time();
  builder
}

pub fn system_available_memory() -> u64 {
  let mut sys = System::new();
  sys.refresh_memory_specifics(MemoryRefreshKind::nothing().with_ram());
  sys.available_memory()
}

pub fn set_v8_max_memory(max_memory: usize) {
  deno_core::v8_set_flags(vec![format!("--max-old-space-size={}", max_memory)]);
}
