use dprint_core::configuration::get_nullable_value;
use dprint_core::configuration::get_value;
use dprint_core::configuration::ConfigKeyMap;
use dprint_core::configuration::ConfigKeyValue;
use dprint_core::configuration::GlobalConfiguration;
use dprint_core::configuration::NewLineKind;
use dprint_core::configuration::ResolveConfigurationResult;
use serde_json;

pub fn resolve_config(
  mut config: ConfigKeyMap,
  global_config: GlobalConfiguration,
) -> ResolveConfigurationResult<serde_json::Value> {
  let mut diagnostics = Vec::new();
  let mut map: serde_json::Map<String, serde_json::Value> = Default::default();

  let dprint_line_width = get_value(
    &mut config,
    "lineWidth",
    global_config.line_width.unwrap_or(80),
    &mut diagnostics,
  );
  map.insert(
    "printWidth".to_string(),
    get_value(
      &mut config,
      "printWidth",
      dprint_line_width,
      &mut diagnostics,
    )
    .into(),
  );
  let dprint_tab_width = get_value(
    &mut config,
    "indentWidth",
    global_config.indent_width.unwrap_or(2),
    &mut diagnostics,
  );
  map.insert(
    "tabWidth".to_string(),
    get_value(&mut config, "tabWidth", dprint_tab_width, &mut diagnostics).into(),
  );
  map.insert(
    "useTabs".to_string(),
    get_value(
      &mut config,
      "useTabs",
      global_config.use_tabs.unwrap_or(false),
      &mut diagnostics,
    )
    .into(),
  );
  let dprint_newline_kind: NewLineKind = get_value(
    &mut config,
    "newLineKind",
    global_config.new_line_kind.unwrap_or(NewLineKind::LineFeed),
    &mut diagnostics,
  );
  let prettier_end_of_line: Option<String> =
    get_nullable_value(&mut config, "endOfLine", &mut diagnostics);
  if let Some(prettier_end_of_line) = prettier_end_of_line {
    map.insert("endOfLine".to_string(), prettier_end_of_line.into());
  } else {
    map.insert(
      "endOfLine".to_string(),
      match dprint_newline_kind {
        NewLineKind::Auto => "auto",
        NewLineKind::CarriageReturnLineFeed => "cflf",
        NewLineKind::LineFeed => "lf",
        NewLineKind::System => {
          if cfg!(windows) {
            "crlf"
          } else {
            "lf"
          }
        }
      }
      .into(),
    );
  }

  for (key, value) in config {
    map.insert(key, config_key_value_to_json(value));
  }

  ResolveConfigurationResult {
    config: serde_json::Value::Object(map),
    diagnostics,
  }
}

fn config_key_value_to_json(value: ConfigKeyValue) -> serde_json::Value {
  match value {
    ConfigKeyValue::Bool(value) => value.into(),
    ConfigKeyValue::String(value) => value.into(),
    ConfigKeyValue::Number(value) => value.into(),
    ConfigKeyValue::Object(value) => {
      let mut values = serde_json::Map::new();
      for (key, value) in value.into_iter() {
        values.insert(key, config_key_value_to_json(value));
      }
      serde_json::Value::Object(values)
    }
    ConfigKeyValue::Array(value) => {
      serde_json::Value::Array(value.into_iter().map(config_key_value_to_json).collect())
    }
    ConfigKeyValue::Null => serde_json::Value::Null,
  }
}
