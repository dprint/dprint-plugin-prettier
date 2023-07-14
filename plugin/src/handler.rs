use std::sync::Arc;

use deno_core::futures::future;
use dprint_core::configuration::ConfigKeyMap;
use dprint_core::configuration::GlobalConfiguration;
use dprint_core::configuration::ResolveConfigurationResult;
use dprint_core::plugins::AsyncPluginHandler;
use dprint_core::plugins::BoxFuture;
use dprint_core::plugins::FormatRequest;
use dprint_core::plugins::FormatResult;
use dprint_core::plugins::Host;
use dprint_core::plugins::PluginInfo;
use dprint_plugin_deno_base::channel::Channel;
use dprint_plugin_deno_base::channel::CreateChannelOptions;
use once_cell::sync::Lazy;

use crate::channel::Channel;
use crate::config::resolve_config;
use crate::config::PrettierConfig;
use crate::formatter::PrettierFormatter;

static SUPPORTED_EXTENSIONS: Lazy<Vec<String>> = Lazy::new(|| {
  let json_bytes = include_bytes!(concat!(env!("OUT_DIR"), "/SUPPORTED_EXTENSIONS.json"));

  deno_core::serde_json::from_slice(json_bytes).unwrap()
});

pub struct PrettierPluginHandler {
  channel: Channel<PrettierConfig>,
}

impl Default for PrettierPluginHandler {
  fn default() -> Self {
    Self {
      channel: Channel::new(CreateChannelOptions {
        avg_isolate_memory_usage: 600_000, // 600MB guess
        create_formatter_cb: Box::new(|| PrettierFormatter::default()),
      }),
    }
  }
}

impl AsyncPluginHandler for PrettierPluginHandler {
  type Configuration = PrettierConfig;

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
    include_str!("../../LICENSE").to_string()
  }

  fn resolve_config(
    &self,
    config: ConfigKeyMap,
    global_config: GlobalConfiguration,
  ) -> ResolveConfigurationResult<Self::Configuration> {
    resolve_config(config, global_config)
  }

  fn format(
    &self,
    request: FormatRequest<Self::Configuration>,
    _host: Arc<dyn Host>,
  ) -> BoxFuture<FormatResult> {
    if request.range.is_some() {
      // no support for range formatting
      return Box::pin(future::ready(Ok(None)));
    }

    let channel = self.channel.clone();
    Box::pin(async move { channel.format(request).await })
  }
}
