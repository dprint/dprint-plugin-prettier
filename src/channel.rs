use std::sync::Arc;
use std::time::Duration;

use deno_core::anyhow::Result;
use deno_core::parking_lot::Mutex;
use deno_core::serde_json;
use dprint_core::plugins::FormatRequest;
use dprint_core::plugins::FormatResult;
use tokio::sync::oneshot;
use tokio_util::sync::CancellationToken;

use crate::formatter::Formatter;
use crate::utils::create_tokio_runtime;
use crate::utils::get_system_available_memory;

type Request = (FormatRequest<serde_json::Value>, oneshot::Sender<FormatResult>);

struct Stats {
  pending_runtimes: usize,
  total_runtimes: usize,
}

#[derive(Clone)]
pub struct Channel {
  stats: Arc<Mutex<Stats>>,
  sender: async_channel::Sender<Request>,
  receiver: async_channel::Receiver<Request>,
  dispose_token: Arc<CancellationToken>,
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
      dispose_token: Default::default(),
    }
  }

  pub fn dispose(&self) {
    self.dispose_token.cancel()
  }

  pub async fn format(&self, request: FormatRequest<serde_json::Value>) -> FormatResult {
    let (send, recv) = oneshot::channel::<FormatResult>();
    {
      let mut stats = self.stats.lock();
      if stats.pending_runtimes == 0 && (stats.total_runtimes == 0 || has_memory_available()) {
        stats.total_runtimes += 1;
        create_js_runtime(self.clone());
      }
    }
    self.sender.send((request, send)).await?;

    recv.await?
  }

  async fn recv(&self) -> Result<Request> {
    self.stats.lock().pending_runtimes += 1;
    let result = self.receiver.recv().await;
    self.stats.lock().pending_runtimes -= 1;
    Ok(result?)
  }

  /// Attempts to decrement the runtime count.
  ///
  /// Returns false if the runtime should stay alive
  /// because it's the last one. This is done to prevent
  /// a `send` occurring at the exact moment that a runtime
  /// exits and so nothing will be around to receive a message.
  fn try_decrement_runtime_count(&self) -> bool {
    let mut stats = self.stats.lock();
    if stats.total_runtimes == 1 {
      false
    } else {
      stats.total_runtimes -= 1;
      true
    }
  }
}

fn has_memory_available() -> bool {
  let available_memory = get_system_available_memory();
  // Only allow creating another instance if the amount of available
  // memory on the system is greater than 500MB (comfortable amount)
  available_memory > 500_000
}

fn create_js_runtime(channel: Channel) {
  std::thread::spawn(|| {
    let tokio_runtime = create_tokio_runtime();
    tokio_runtime.block_on(async move {
      let mut formatter = Formatter::new();
      loop {
        tokio::select! {
          // exit when dispose
          _ = channel.dispose_token.cancelled() => {
            return;
          }
          // automatically shut down after a certain amount of time
          _ = tokio::time::sleep(Duration::from_secs(30)) => {
            // only shut down if we're not the last one
            if channel.try_decrement_runtime_count() {
              return;
            }
          }
          request = channel.recv() => {
            // todo: implement cancellation
            // todo: implement configuration
            let (request, response) = request.unwrap();
            let result = formatter.format_text(&request.file_path.to_string_lossy(), &request.file_text, &request.config);
            let _ = response.send(result);
          }
        }
      }
    });
  });
}
