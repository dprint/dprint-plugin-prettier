use deno_core::anyhow::anyhow;
use deno_core::anyhow::Error;
use deno_core::serde_json;
use deno_core::serde_v8;
use deno_core::v8;
use deno_core::JsRuntime;

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
    config: &serde_json::Value,
  ) -> Result<Option<String>, Error> {
    let request_value = serde_json::Value::Object({
      let mut obj = serde_json::Map::new();
      obj.insert("filePath".to_string(), file_path.into());
      obj.insert("fileText".to_string(), file_text.into());
      obj
    });
    let code = format!(
      "dprint.formatText({}, {})",
      request_value.to_string(),
      if config.is_null() {
        "{}".to_string()
      } else {
        config.to_string()
      }
    );
    let global = self.runtime.execute_script("format.js", &code)?;
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
