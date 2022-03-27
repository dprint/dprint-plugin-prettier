use std::sync::Arc;
use std::time::Duration;

use deno_core::parking_lot::Mutex;
use deno_core::serde_json;
use dprint_core::plugins::FormatRequest;
use dprint_core::plugins::FormatResult;
use tokio::sync::oneshot;

use crate::formatter::Formatter;
use crate::utils::create_tokio_runtime;
use crate::utils::get_system_available_memory;

type Request = (
  FormatRequest<serde_json::Value>,
  oneshot::Sender<FormatResult>,
);

struct Stats {
  pending_runtimes: usize,
  total_runtimes: usize,
}

#[derive(Clone)]
pub struct Channel {
  stats: Arc<Mutex<Stats>>,
  sender: async_channel::Sender<Request>,
  receiver: async_channel::Receiver<Request>,
}

impl Channel {
  pub fn new() -> Self {
    let (sender, receiver) = async_channel::unbounded();
    Self {
      stats: Arc::new(Mutex::new(Stats {
        pending_runtimes: 0,
        total_runtimes: 0,
      })),
      sender,
      receiver,
    }
  }

  pub async fn format(&self, request: FormatRequest<serde_json::Value>) -> FormatResult {
    let (send, recv) = oneshot::channel::<FormatResult>();
    let mut should_inc_pending_runtimes = false;
    {
      let mut stats = self.stats.lock();
      if stats.pending_runtimes == 0 && (stats.total_runtimes == 0 || has_memory_available()) {
        stats.total_runtimes += 1;
        stats.pending_runtimes += 1;
        drop(stats);
        create_js_runtime(self.stats.clone(), self.receiver.clone());
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
}

fn has_memory_available() -> bool {
  let available_memory = get_system_available_memory();
  // Only allow creating another instance if the amount of available
  // memory on the system is greater than 500MB (comfortable amount)
  available_memory > 500_000
}

fn create_js_runtime(stats: Arc<Mutex<Stats>>, receiver: async_channel::Receiver<Request>) {
  std::thread::spawn(move || {
    let tokio_runtime = create_tokio_runtime();
    tokio_runtime.block_on(async move {
      let mut formatter = Formatter::new();
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
            // todo: possible to implement cancellation?
            let (request, response) = match request {
              Ok(result) => result,
              Err(_) => {
                // receiver dropped, so exit
                return;
              }
            };
            let result = formatter.format_text(
              &request.file_path.to_string_lossy(),
              request.file_text,
              &request.config,
            );
            let _ = response.send(result);
          }
        }
      }
    });
  });
}
