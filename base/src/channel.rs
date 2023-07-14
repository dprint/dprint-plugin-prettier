use std::sync::Arc;
use std::time::Duration;

use deno_core::anyhow::Error;
use deno_core::parking_lot::Mutex;
use dprint_core::plugins::FormatRequest;
use dprint_core::plugins::FormatResult;
use tokio::sync::oneshot;

use crate::util::create_tokio_runtime;
use crate::util::system_available_memory;

pub trait Formatter<TConfiguration> {
  fn format_text(
    &mut self,
    request: FormatRequest<TConfiguration>,
  ) -> Result<Option<String>, Error>;
}

pub type CreateFormatterCb<TConfiguration> =
  dyn Fn() -> Box<dyn Formatter<TConfiguration>> + Send + Sync;

pub struct CreateChannelOptions<TConfiguration> {
  /// The amount of memory that a single isolate might use. You can approximate
  /// this value out by launching the plugin with DPRINT_MAX_THREADS=1 and seeing
  /// how much memory is used when formatting some large files.
  ///
  /// This provides some protection against using too much memory on the system,
  /// but is not perfect. It is better than nothing.
  pub avg_isolate_memory_usage: usize,
  pub create_formatter_cb: Arc<CreateFormatterCb<TConfiguration>>,
}

type Request<TConfiguration> = (FormatRequest<TConfiguration>, oneshot::Sender<FormatResult>);

struct Stats {
  pending_runtimes: usize,
  total_runtimes: usize,
}

pub struct Channel<TConfiguration: Send + Sync + 'static> {
  stats: Arc<Mutex<Stats>>,
  sender: async_channel::Sender<Request<TConfiguration>>,
  receiver: async_channel::Receiver<Request<TConfiguration>>,
  options: CreateChannelOptions<TConfiguration>,
}

impl<TConfiguration: Send + Sync + 'static> Channel<TConfiguration> {
  pub fn new(options: CreateChannelOptions<TConfiguration>) -> Self {
    let (sender, receiver) = async_channel::unbounded();
    Self {
      stats: Arc::new(Mutex::new(Stats {
        pending_runtimes: 0,
        total_runtimes: 0,
      })),
      sender,
      receiver,
      options,
    }
  }

  pub async fn format(&self, request: FormatRequest<TConfiguration>) -> FormatResult {
    let (send, recv) = oneshot::channel::<FormatResult>();
    let mut should_inc_pending_runtimes = false;
    {
      let mut stats = self.stats.lock();
      if stats.pending_runtimes == 0 && (stats.total_runtimes == 0 || self.has_memory_available()) {
        stats.total_runtimes += 1;
        stats.pending_runtimes += 1;
        drop(stats);
        self.create_js_runtime();
      } else if stats.pending_runtimes > 0 {
        stats.pending_runtimes -= 1;
        should_inc_pending_runtimes = true;
      }
    }

    self.sender.send((request, send)).await?;

    let result = recv.await?;
    if should_inc_pending_runtimes {
      self.stats.lock().pending_runtimes += 1;
    }
    result
  }

  fn has_memory_available(&self) -> bool {
    // Only allow creating another instance if the amount of available
    // memory on the system is greater than a comfortable amount
    let available_memory = system_available_memory();
    // I chose 2x because that would maybe prevent at least two plugins
    // from potentially creating an isolate at the same time and going over the
    // memory limit. It's definitely not perfect.
    available_memory > (self.options.avg_isolate_memory_usage as f64 * 2.2) as u64
  }

  fn create_js_runtime(&self) {
    let stats = self.stats.clone();
    let receiver = self.receiver.clone();
    let create_formatter_cb = self.options.create_formatter_cb.clone();
    std::thread::spawn(move || {
      let tokio_runtime = create_tokio_runtime();
      tokio_runtime.block_on(async move {
        let mut formatter = (create_formatter_cb)();
        loop {
          tokio::select! {
            // automatically shut down after a certain amount of time to save memory
            // in an editor scenario
            _ = tokio::time::sleep(Duration::from_secs(30)) => {
              // only shut down if we're not the last pending runtime
              let mut stats = stats.lock();
              if stats.total_runtimes > 1 && stats.pending_runtimes > 1 {
                stats.total_runtimes -= 1;
                stats.pending_runtimes -= 1;
                return;
              }
            }
            request = receiver.recv() => {
              let (request, response) = match request {
                Ok(result) => result,
                Err(_) => {
                  // receiver dropped, so exit
                  return;
                }
              };
              let result = formatter.format_text(request);
              let _ = response.send(result);
            }
          }
        }
      });
    });
  }
}
