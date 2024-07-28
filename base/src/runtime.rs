use deno_core::anyhow::anyhow;
use deno_core::anyhow::Error;
use deno_core::anyhow::Result;
use deno_core::serde_v8;
use deno_core::v8;
use deno_core::v8::Platform;
use deno_core::v8::SharedRef;
use deno_core::Extension;
use deno_core::PollEventLoopOptions;
use deno_core::RuntimeOptions;
use once_cell::sync::Lazy;
use serde::Deserialize;

static PLATFORM: Lazy<SharedRef<Platform>> =
  Lazy::new(|| v8::new_default_platform(1, false).make_shared());

pub struct CreateRuntimeOptions {
  pub extensions: Vec<Extension>,
  pub startup_snapshot: Option<&'static [u8]>,
}

pub struct JsRuntime {
  inner: deno_core::JsRuntime,
}

impl JsRuntime {
  pub fn new(options: CreateRuntimeOptions) -> JsRuntime {
    JsRuntime {
      inner: deno_core::JsRuntime::new(RuntimeOptions {
        startup_snapshot: options.startup_snapshot,
        v8_platform: Some(PLATFORM.clone()),
        extensions: options.extensions,
        ..Default::default()
      }),
    }
  }

  /// Call this once on the main thread.
  pub fn initialize_main_thread() {
    deno_core::JsRuntime::init_platform(Some(PLATFORM.clone()))
  }

  pub async fn execute_format_script(&mut self, code: String) -> Result<Option<String>, Error> {
    let global = self.inner.execute_script("format.js", code)?;
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

  pub fn execute_script(&mut self, script_name: &'static str, code: String) -> Result<(), Error> {
    self.inner.execute_script(script_name, code).map(|_| ())
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
    let fn_value = inner.execute_script(script_name, fn_name)?;
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
