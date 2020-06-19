use std::path::PathBuf;
use dprint_core::generate_plugin_code;
use super::config::{Configuration, resolve_config};

fn get_plugin_config_key() -> String {
    String::from("prettier")
}

fn get_plugin_file_extensions() -> Vec<String> {
    vec![String::from("js", "ts")]
}

fn format_text(_: &PathBuf, file_text: &str, config: &Configuration) -> Result<String, String> {
    super::format_text(file_text, config)
}

fn get_plugin_help_url() -> String {
    String::from("https://dprint.dev/plugins/prettier")
}

fn get_plugin_config_schema_url() -> String {
    String::new() // none until https://github.com/microsoft/vscode/issues/98443 is resolved
}

fn get_plugin_license_text() -> String {
    std::str::from_utf8(include_bytes!("../LICENSE")).unwrap().into()
}

generate_plugin_code!();
