use sysinfo::System;
use sysinfo::SystemExt;

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
  sys.refresh_memory();
  sys.available_memory()
}
