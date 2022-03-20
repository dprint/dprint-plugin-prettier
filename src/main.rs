use deno_core::anyhow::Error;
use deno_core::op;
use deno_core::Extension;
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;
use deno_core::serde_v8;
use deno_core::v8;

#[op]
fn op_is_windows() -> Result<bool, Error> {
  Ok(if cfg!(windows) {
    true
  } else {
    false
  })
}

const STARTUP_CODE: &str = include_str!("../js/startup.js");

fn main() {
  let ext = Extension::builder()
    .ops(vec![
      op_is_windows::decl(),
    ])
    .build();

  // todo: snapshot?
  let mut runtime = JsRuntime::new(RuntimeOptions {
    extensions: vec![ext],
    ..Default::default()
  });

  runtime.execute_script("startup", STARTUP_CODE).unwrap();

  let global = runtime.execute_script("/file.js", "dprint.formatText('test.ts', 'const t   = {   }', 1, {})").unwrap();
  let scope = &mut runtime.handle_scope();
  let local = v8::Local::new(scope, global);
  let deserialized_value =
    serde_v8::from_v8::<String>(scope, local);

  let result = match deserialized_value {
    Ok(value) => Ok(value),
    Err(err) => Err(format!("Cannot deserialize value: {:?}", err)),
  };
  eprint!("{:?}", result);
}
