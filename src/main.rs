use deno_core::serde_v8;
use deno_core::v8;

use crate::runtime::create_js_runtime;

mod runtime;


fn main() {
  let mut runtime = create_js_runtime();
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
