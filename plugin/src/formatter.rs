use std::borrow::Cow;
use std::sync::OnceLock;

use deno_core::anyhow::Error;
use deno_core::serde_json;
use dprint_core::async_runtime::async_trait;
use dprint_core::plugins::FormatRequest;
use dprint_plugin_deno_base::channel::Formatter;
use dprint_plugin_deno_base::runtime::CreateRuntimeOptions;
use dprint_plugin_deno_base::runtime::JsRuntime;
use dprint_plugin_deno_base::snapshot::deserialize_snapshot;
use dprint_plugin_deno_base::util::set_v8_max_memory;

use crate::config::PrettierConfig;

fn get_startup_snapshot() -> &'static [u8] {
  // Copied from Deno's codebase:
  // https://github.com/denoland/deno/blob/daa7c6d32ab5a4029f8084e174d621f5562256be/cli/tsc.rs#L55
  static STARTUP_SNAPSHOT: OnceLock<Box<[u8]>> = OnceLock::new();

  STARTUP_SNAPSHOT.get_or_init(
    #[cold]
    #[inline(never)]
    || {
      // Also set the v8 max memory at the same time. This was added because
      // on the DefinitelyTyped repo there would be some OOM errors after formatting
      // for a while and this solved that for some reason.
      set_v8_max_memory(512);

      static COMPRESSED_COMPILER_SNAPSHOT: &[u8] =
        include_bytes!(concat!(env!("OUT_DIR"), "/STARTUP_SNAPSHOT.bin"));

      deserialize_snapshot(COMPRESSED_COMPILER_SNAPSHOT).unwrap()
    },
  )
}

pub struct PrettierFormatter {
  runtime: JsRuntime,
}

impl Default for PrettierFormatter {
  fn default() -> Self {
    let runtime = JsRuntime::new(CreateRuntimeOptions {
      extensions: vec![
        deno_webidl::deno_webidl::init_ops(),
        deno_console::deno_console::init_ops(),
        deno_url::deno_url::init_ops(),
      ],
      startup_snapshot: Some(&get_startup_snapshot()),
    });
    Self { runtime }
  }
}

#[async_trait(?Send)]
impl Formatter<PrettierConfig> for PrettierFormatter {
  async fn format_text(
    &mut self,
    request: FormatRequest<PrettierConfig>,
  ) -> Result<Option<Vec<u8>>, Error> {
    // todo: implement cancellation and range formatting
    let request_value = serde_json::Value::Object({
      let mut obj = serde_json::Map::new();
      obj.insert(
        "filePath".to_string(),
        request.file_path.to_string_lossy().into(),
      );
      obj.insert(
        "fileText".to_string(),
        String::from_utf8(request.file_bytes)?.into(),
      );
      obj
    });
    let file_path = request.file_path.to_string_lossy();
    let config = &request.config;
    let code = format!(
      "(async () => {{ return await dprint.formatText({{ ...{}, config: {}, pluginsConfig: {} }}); }})()",
      request_value,
      serde_json::to_string(&resolve_config(&file_path, config)).unwrap(),
      serde_json::to_string(&config.plugins).unwrap(),
    );
    self
      .runtime
      .execute_format_script(code)
      .await
      .map(|s| s.map(|s| s.into_bytes()))
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
