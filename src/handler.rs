use std::sync::Arc;
use std::time::Duration;

use deno_core::serde::Serialize;
use dprint_core::configuration::ConfigKeyMap;
use dprint_core::configuration::GlobalConfiguration;
use dprint_core::configuration::ResolveConfigurationResult;
use dprint_core::plugins::AsyncPluginHandler;
use dprint_core::plugins::BoxFuture;
use dprint_core::plugins::FormatRequest;
use dprint_core::plugins::FormatResult;
use dprint_core::plugins::Host;
use dprint_core::plugins::PluginInfo;
use once_cell::sync::Lazy;
use tokio::sync::oneshot;

use crate::formatter::Formatter;
use crate::utils::create_tokio_runtime;

static SUPPORTED_EXTENSIONS: Lazy<Vec<String>> = Lazy::new(|| {
  let json_bytes = include_bytes!(concat!(env!("OUT_DIR"), "/SUPPORTED_EXTENSIONS.json"));

  deno_core::serde_json::from_slice(json_bytes).unwrap()
});

#[derive(Clone, Serialize)]
pub struct Configuration(ConfigKeyMap, GlobalConfiguration);

type Request = (FormatRequest<Configuration>, oneshot::Sender<FormatResult>);

pub struct PrettierPluginHandler {
  // todo: monitor the number of receivers and increase them when the queue starts filling up
  sender: async_channel::Sender<Request>,
  receiver: async_channel::Receiver<Request>,
}

impl PrettierPluginHandler {
  pub fn new() -> Self {
    let (sender, receiver) = async_channel::unbounded();
    Self { sender, receiver }
  }
}

impl AsyncPluginHandler for PrettierPluginHandler {
  type Configuration = Configuration;

  fn plugin_info(&self) -> PluginInfo {
    PluginInfo {
      name: env!("CARGO_PKG_NAME").to_string(),
      version: env!("CARGO_PKG_VERSION").to_string(),
      config_key: "prettier".to_string(),
      file_extensions: SUPPORTED_EXTENSIONS.clone(),
      file_names: vec![],
      help_url: "https://dprint.dev/plugins/prettier".to_string(),
      config_schema_url: "".to_string(),
      update_url: Some(
        "https://plugins.dprint.dev/dprint/dprint-plugin-prettier/latest.json".to_string(),
      ),
    }
  }

  fn license_text(&self) -> String {
    include_str!("../LICENSE").to_string()
  }

  fn resolve_config(
    &self,
    config: ConfigKeyMap,
    global_config: GlobalConfiguration,
  ) -> ResolveConfigurationResult<Configuration> {
    ResolveConfigurationResult {
      config: Configuration(config, global_config),
      diagnostics: Vec::new(),
    }
  }

  fn format(
    &self,
    request: FormatRequest<Self::Configuration>,
    _host: Arc<dyn Host>,
  ) -> BoxFuture<FormatResult> {
    // todo
    let (s, r) = oneshot::channel();
    Box::pin(async move {})
  }
}

fn create_js_runtime(receiver: async_channel::Receiver<Request>) {
  std::thread::spawn(|| {
    let tokio_runtime = create_tokio_runtime();
    tokio_runtime.block_on(async move {
      let mut formatter = Formatter::new();
      loop {
        tokio::select! {
          // automatically shut down after a certain amount of time
          _ = tokio::time::sleep(Duration::from_secs(30)) => {
            return;
          }
          request = receiver.recv() => {
            // todo: implement cancellation
            // todo: implement this
          }
        }
      }
    });
  });
}
