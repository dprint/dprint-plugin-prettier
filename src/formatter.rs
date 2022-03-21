use deno_core::anyhow::anyhow;
use deno_core::anyhow::Error;
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

  pub fn format_text(&mut self, file_path: &str, file_text: &str) -> Result<String, Error> {
    // todo: improve... just doing simple for now
    let code = format!(
      "dprint.formatText(\"{}\", \"{}\", 1, {{}})",
      sanitize_string(file_path),
      sanitize_string(file_text)
    );
    let global = self.runtime.execute_script("format.js", &code).unwrap();
    let scope = &mut self.runtime.handle_scope();
    let local = v8::Local::new(scope, global);
    let deserialized_value = serde_v8::from_v8::<String>(scope, local);

    match deserialized_value {
      Ok(value) => Ok(value),
      Err(err) => Err(anyhow!("Cannot deserialize value: {:?}", err)),
    }
  }
}

fn sanitize_string(text: &str) -> String {
  text
    .replace("\r\n", "\\r\\n")
    .replace("\n", "\\n")
    .replace("\"", "\\\"")
}
