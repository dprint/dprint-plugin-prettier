use std::borrow::Cow;

use deno_core::anyhow::anyhow;
use deno_core::anyhow::Error;
use deno_core::serde_json;
use deno_core::serde_v8;
use deno_core::v8;
use deno_core::JsRuntime;

use crate::config::PrettierConfig;
use crate::runtime::create_js_runtime;

pub struct Formatter {
  runtime: JsRuntime,
}

impl Formatter {
  pub fn new() -> Self {
    let runtime = create_js_runtime();
    Self { runtime }
  }

  pub fn format_text(
    &mut self,
    file_path: &str,
    file_text: String,
    config: &PrettierConfig,
  ) -> Result<Option<String>, Error> {
    let request_value = serde_json::Value::Object({
      let mut obj = serde_json::Map::new();
      obj.insert("filePath".to_string(), file_path.into());
      obj.insert("fileText".to_string(), file_text.into());
      obj
    });
    let code = format!(
      "dprint.formatText({{ ...{}, config: {}, pluginsConfig: {} }})",
      request_value.to_string(),
      serde_json::to_string(&resolve_config(file_path, config)).unwrap(),
      serde_json::to_string(&config.plugins).unwrap(),
    );
    let global = self.runtime.execute_script("format.js", code.into())?;
    let scope = &mut self.runtime.handle_scope();
    let local = v8::Local::new(scope, global);
    if local.is_undefined() {
      Ok(None)
    } else {
      let deserialized_value = serde_v8::from_v8::<String>(scope, local);
      match deserialized_value {
        Ok(value) => Ok(Some(value)),
        Err(err) => Err(anyhow!("Cannot deserialize serde_v8 value: {:?}", err)),
      }
    }
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
