use dprint_core::configuration::get_nullable_value;
use dprint_core::configuration::get_value;
use dprint_core::configuration::ConfigKeyMap;
use dprint_core::configuration::ConfigKeyValue;
use dprint_core::configuration::GlobalConfiguration;
use dprint_core::configuration::NewLineKind;
use dprint_core::configuration::ResolveConfigurationResult;
use serde::Serialize;
use serde_json;

#[derive(Clone, Serialize, Default)]
pub struct PrettierConfig {
  pub main: serde_json::Map<String, serde_json::Value>,
  pub extension_overrides: serde_json::Map<String, serde_json::Value>,
}

pub fn resolve_config(
  mut config: ConfigKeyMap,
  global_config: GlobalConfiguration,
) -> ResolveConfigurationResult<PrettierConfig> {
  let mut diagnostics = Vec::new();
  let mut main: serde_json::Map<String, serde_json::Value> = Default::default();
  let mut extension_overrides: serde_json::Map<String, serde_json::Value> = Default::default();

  let dprint_line_width = get_value(
    &mut config,
    "lineWidth",
    global_config.line_width.unwrap_or(80),
    &mut diagnostics,
  );
  main.insert(
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
  main.insert(
    "tabWidth".to_string(),
    get_value(&mut config, "tabWidth", dprint_tab_width, &mut diagnostics).into(),
  );
  main.insert(
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
    main.insert("endOfLine".to_string(), prettier_end_of_line.into());
  } else {
    main.insert(
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
    let value = config_key_value_to_json(value);
    if let Some(index) = key.rfind('.') {
      let extension = key[..index].to_lowercase();
      let key = &key[index + 1..];
      extension_overrides
        .entry(extension)
        .or_insert_with(|| serde_json::Value::Object(Default::default()))
        .as_object_mut()
        .unwrap()
        .insert(key.to_string(), value);
    } else {
      main.insert(key, value);
    }
  }

  ResolveConfigurationResult {
    config: PrettierConfig {
      main,
      extension_overrides,
    },
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
