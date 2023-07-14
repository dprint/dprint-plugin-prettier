use std::borrow::Cow;

use deno_core::anyhow::anyhow;
use deno_core::anyhow::Error;
use deno_core::serde_json;
use deno_core::serde_v8;
use deno_core::v8;
use deno_core::JsRuntime;
use dprint_core::plugins::FormatRequest;
use dprint_plugin_deno_base::channel::Formatter;
use dprint_plugin_deno_base::formatting::FormatterJsRuntime;
use dprint_plugin_deno_base::runtime::CreateRuntimeOptions;
use dprint_plugin_deno_base::util::set_v8_max_memory;
use once_cell::sync::Lazy;

use crate::config::PrettierConfig;
use crate::runtime::create_js_runtime;

// Copied from Deno's codebase:
// https://github.com/denoland/deno/blob/daa7c6d32ab5a4029f8084e174d621f5562256be/cli/tsc.rs#L55
static STARTUP_SNAPSHOT: Lazy<CompressedSnapshot> = Lazy::new(
  #[cold]
  #[inline(never)]
  || {
    set_v8_max_memory(512);
    static COMPRESSED_COMPILER_SNAPSHOT: &[u8] =
      include_bytes!(concat!(env!("OUT_DIR"), "/STARTUP_SNAPSHOT.bin"));

    CompressedSnapshot::deserialize(&COMPRESSED_COMPILER_SNAPSHOT).unwrap()
  },
);

pub struct PrettierFormatter {
  runtime: FormatterJsRuntime,
}

impl Default for PrettierFormatter {
  fn default() -> Self {
    let runtime = FormatterJsRuntime::new(CreateRuntimeOptions {
      extensions: Vec::new(),
      startup_snapshot: Some(&STARTUP_SNAPSHOT),
    });
    Self { runtime }
  }
}

impl Formatter<PrettierConfig> for PrettierFormatter {
  fn format_text(
    &mut self,
    request: FormatRequest<PrettierConfig>,
  ) -> Result<Option<String>, Error> {
    // todo: implement cancellation and range formatting
    let request_value = serde_json::Value::Object({
      let mut obj = serde_json::Map::new();
      obj.insert("filePath".to_string(), file_path.into());
      obj.insert("fileText".to_string(), file_text.into());
      obj
    });
    let file_path = request.file_path.to_string_lossy();
    let config = &request.config;
    let code = format!(
      "dprint.formatText({{ ...{}, config: {}, pluginsConfig: {} }})",
      request_value,
      serde_json::to_string(&resolve_config(&file_path, config)).unwrap(),
      serde_json::to_string(&config.plugins).unwrap(),
    );
    self.runtime.execute_format_script(code)
  }
}

fn resolve_config<'a>(
  file_path: &str,
  config: &'a PrettierConfig,
) -> Cow<'a, serde_json::Map<String, serde_json::Value>> {
  let ext = if let Some(index) = file_path.rfind('.') {
    file_path[index + 1..].to_lowercase()
  } else {
    return Cow::Borrowed(&config.main);
  };
  if let Some(override_config) = config.extension_overrides.get(&ext) {
    let mut new_config = config.main.clone();
    for (key, value) in override_config.as_object().unwrap().iter() {
      new_config.insert(key.to_string(), value.clone());
    }
    Cow::Owned(new_config)
  } else {
    Cow::Borrowed(&config.main)
  }
}
