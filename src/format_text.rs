use super::config::Configuration;
use quick_js::{Context, JsValue};

pub fn format_text(text: &str, config: &Configuration) -> Result<String, String> {
    let context = Context::new().unwrap();
    let value = context.eval("1 + 2").unwrap();
    Ok(format!("{:?}", value))
}
