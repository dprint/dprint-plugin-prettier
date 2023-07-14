use deno_core::anyhow::anyhow;
use deno_core::anyhow::Error;
use deno_core::serde_v8;
use deno_core::v8;
use deno_core::Extension;
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;
use deno_core::Snapshot;

use super::snapshot::CompressedSnapshot;

pub struct CreateRuntimeOptions {
  pub extensions: Vec<Extension>,
  pub startup_snapshot: Option<&'static CompressedSnapshot>,
}

pub struct FormatterJsRuntime {
  inner: JsRuntime,
}

impl FormatterJsRuntime {
  pub fn new(options: CreateRuntimeOptions) -> FormatterJsRuntime {
    let maybe_snapshot = options
      .startup_snapshot
      .map(|s| Snapshot::Static(s.inner()));
    let platform = v8::new_default_platform(1, false).make_shared();
    FormatterJsRuntime {
      inner: JsRuntime::new(RuntimeOptions {
        startup_snapshot: maybe_snapshot,
        v8_platform: Some(platform),
        extensions: options.extensions,
        ..Default::default()
      }),
    }
  }

  pub fn execute_format_script(&mut self, code: String) -> Result<Option<String>, Error> {
    let global = self.inner.execute_script("format.js", code.into())?;
    let scope = &mut self.inner.handle_scope();
    let local = v8::Local::new(scope, global);
    if local.is_undefined() {
      Ok(None)
    } else {
      let deserialized_value = serde_v8::from_v8::<String>(scope, local);
      match deserialized_value {
        Ok(value) => Ok(Some(value)),
        Err(err) => Err(anyhow!("Cannot deserialize serde_v8 value: {:#}", err)),
      }
    }
  }
}
