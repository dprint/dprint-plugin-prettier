use std::sync::Arc;

use dprint_core::async_runtime::async_trait;
use dprint_core::async_runtime::LocalBoxFuture;
use dprint_core::configuration::ConfigKeyMap;
use dprint_core::configuration::GlobalConfiguration;
use dprint_core::plugins::AsyncPluginHandler;
use dprint_core::plugins::FileMatchingInfo;
use dprint_core::plugins::FormatRequest;
use dprint_core::plugins::FormatResult;
use dprint_core::plugins::HostFormatRequest;
use dprint_core::plugins::PluginInfo;
use dprint_core::plugins::PluginResolveConfigurationResult;
use dprint_plugin_deno_base::channel::Channel;
use dprint_plugin_deno_base::channel::CreateChannelOptions;
use once_cell::sync::Lazy;

use crate::config::resolve_config;
use crate::config::PrettierConfig;
use crate::formatter::PrettierFormatter;

static SUPPORTED_EXTENSIONS: Lazy<Vec<String>> = Lazy::new(|| {
  let json_bytes = include_bytes!(concat!(env!("OUT_DIR"), "/SUPPORTED_EXTENSIONS.json"));

  deno_core::serde_json::from_slice(json_bytes).unwrap()
});

pub struct PrettierPluginHandler {
  channel: Arc<Channel<PrettierConfig>>,
}

impl Default for PrettierPluginHandler {
  fn default() -> Self {
    Self {
      channel: Arc::new(Channel::new(CreateChannelOptions {
        avg_isolate_memory_usage: 600_000, // 600MB guess
        create_formatter_cb: Arc::new(|| Box::<PrettierFormatter>::default()),
      })),
    }
  }
}

#[async_trait(?Send)]
impl AsyncPluginHandler for PrettierPluginHandler {
  type Configuration = PrettierConfig;

  fn plugin_info(&self) -> PluginInfo {
    PluginInfo {
      name: env!("CARGO_PKG_NAME").to_string(),
      version: env!("CARGO_PKG_VERSION").to_string(),
      config_key: "prettier".to_string(),
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

  async fn resolve_config(
    &self,
    config: ConfigKeyMap,
    global_config: GlobalConfiguration,
  ) -> PluginResolveConfigurationResult<Self::Configuration> {
    let result = resolve_config(config, global_config);

    let file_extensions = get_file_extensions(&result.config.extension_overrides);
    PluginResolveConfigurationResult {
      config: result.config,
      diagnostics: result.diagnostics,
      file_matching: FileMatchingInfo {
        file_extensions,
        file_names: vec![],
      },
    }
  }

  async fn format(
    &self,
    request: FormatRequest<Self::Configuration>,
    _format_with_host: impl FnMut(HostFormatRequest) -> LocalBoxFuture<'static, FormatResult> + 'static,
  ) -> FormatResult {
    if request.range.is_some() {
      // no support for range formatting
      return Ok(None);
    }

    self.channel.format(request).await
  }
}

fn get_file_extensions(
  extension_overrides: &serde_json::Map<String, serde_json::Value>,
) -> Vec<String> {
  let mut extension_parsers = extension_overrides
    .iter()
    .filter_map(|(key, value)| {
      if value.get("parser").is_some() {
        Some(key.clone())
      } else {
        None
      }
    })
    .collect::<Vec<_>>();
  extension_parsers.extend(SUPPORTED_EXTENSIONS.clone());
  extension_parsers
}
