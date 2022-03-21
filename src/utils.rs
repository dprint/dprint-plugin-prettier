pub fn create_tokio_runtime() -> tokio::runtime::Runtime {
  // use a single thread for tasks because we need that for deno_core
  tokio::runtime::Builder::new_current_thread()
    .enable_time()
    .build()
    .unwrap()
}
