use sysinfo::System;
use sysinfo::SystemExt;

pub fn create_tokio_runtime() -> tokio::runtime::Runtime {
  // use a single thread for the communication and for
  // each of the isolates
  tokio::runtime::Builder::new_current_thread()
    .enable_time()
    .build()
    .unwrap()
}

pub fn get_system_available_memory() -> u64 {
  let mut sys = System::new();
  sys.refresh_memory();
  sys.available_memory()
}
