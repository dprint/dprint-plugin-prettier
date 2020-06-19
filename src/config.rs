use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use dprint_core::configuration::{GlobalConfiguration, ResolveConfigurationResult, NewLineKind, ConfigurationDiagnostic};

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Configuration {
    // add configuration properties here
}

pub fn resolve_config(
    config: HashMap<String, String>,
    global_config: &GlobalConfiguration,
) -> ResolveConfigurationResult<Configuration> {
    let mut diagnostics = Vec::new();
    ResolveConfigurationResult {
        diagnostics,
        config: Configuration { },
    }
}
