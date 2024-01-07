use deno_core::anyhow::anyhow;
use deno_core::anyhow::Error;
use deno_core::anyhow::Result;
use deno_core::serde_v8;
use deno_core::v8;
use deno_core::Extension;
use deno_core::PollEventLoopOptions;
use deno_core::RuntimeOptions;
use serde::Deserialize;

use super::snapshot::Snapshot;

pub enum StartupSnapshot {
  Static(&'static Snapshot),
  Boxed(Snapshot),
}

pub struct CreateRuntimeOptions {
  pub extensions: Vec<Extension>,
  pub startup_snapshot: Option<StartupSnapshot>,
}

pub struct JsRuntime {
  inner: deno_core::JsRuntime,
}

impl JsRuntime {
  pub fn new(options: CreateRuntimeOptions) -> JsRuntime {
    let maybe_snapshot = options.startup_snapshot.map(|s| match s {
      StartupSnapshot::Static(s) => deno_core::Snapshot::Static(s.inner()),
      StartupSnapshot::Boxed(s) => deno_core::Snapshot::Boxed(s.into_inner()),
    });
    let platform = v8::new_default_platform(1, false).make_shared();
    JsRuntime {
      inner: deno_core::JsRuntime::new(RuntimeOptions {
        startup_snapshot: maybe_snapshot,
        v8_platform: Some(platform),
        extensions: options.extensions,
        ..Default::default()
      }),
    }
  }

  /// Call this once on the main thread.
  pub fn initialize_main_thread() {
    deno_core::JsRuntime::init_platform(None)
  }

  pub async fn execute_format_script(&mut self, code: String) -> Result<Option<String>, Error> {
    let global = self.inner.execute_script("format.js", code.into())?;
    let resolve = self.inner.resolve(global);
    let global = self
      .inner
      .with_event_loop_promise(resolve, PollEventLoopOptions::default())
      .await?;
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

  pub async fn execute_async_fn<'de, T>(
    &mut self,
    script_name: &'static str,
    fn_name: String,
  ) -> Result<T>
  where
    T: Deserialize<'de>,
  {
    let inner = &mut self.inner;
    let fn_value = inner.execute_script(script_name, fn_name.into())?;
    let fn_value = inner.resolve(fn_value).await?;
    let mut scope = inner.handle_scope();
    let fn_func: v8::Local<v8::Function> = v8::Local::new(&mut scope, fn_value).try_into()?;
    let fn_func = v8::Global::new(&mut scope, fn_func);
    drop(scope);
    let call = inner.call(&fn_func);
    let result = inner
      .with_event_loop_promise(call, PollEventLoopOptions::default())
      .await?;
    let mut scope = inner.handle_scope();
    let local = v8::Local::new(&mut scope, result);
    Ok(serde_v8::from_v8::<T>(&mut scope, local)?)
  }
}
