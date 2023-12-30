use std::path::PathBuf;
use std::sync::Arc;

use deno_core::futures::FutureExt;
use dprint_core::configuration::ConfigKeyMap;
use dprint_core::plugins::AsyncPluginHandler;
use dprint_core::plugins::FormatConfigId;
use dprint_core::plugins::FormatRequest;
use dprint_core::plugins::NullCancellationToken;
use dprint_development::*;
use dprint_plugin_deno_base::util::create_tokio_runtime;
use dprint_plugin_prettier::config::resolve_config;
use dprint_plugin_prettier::PrettierPluginHandler;

use pretty_assertions::assert_eq;

#[test]
fn test_specs() {
  let runtime = create_tokio_runtime();
  let handle = runtime.handle().clone();

  let mut tests_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
  tests_dir.push("tests");
  run_specs(
    &PathBuf::from("./tests/specs"),
    &ParseSpecOptions {
      default_file_name: "default.ts",
    },
    &RunSpecsOptions {
      fix_failures: false,
      format_twice: true,
    },
    {
      let handler = PrettierPluginHandler::default();
      move |file_name, file_text, spec_config| {
        let spec_config: ConfigKeyMap = serde_json::from_value(spec_config.clone().into()).unwrap();
        let config_result = resolve_config(spec_config, Default::default());
        ensure_no_diagnostics(&config_result.diagnostics);

        let result = handle.block_on(async {
          handler
            .format(
              FormatRequest {
                config_id: FormatConfigId::from_raw(0),
                file_path: file_name.to_path_buf(),
                file_bytes: file_text.to_string().into_bytes(),
                config: Arc::new(config_result.config),
                range: None,
                token: Arc::new(NullCancellationToken),
              },
              |_| std::future::ready(Ok(None)).boxed_local(),
            )
            .await
        });
        result.map(|r| r.map(|r| String::from_utf8(r).unwrap()))
      }
    },
    move |_file_name, _file_text, _spec_config| panic!("Not supported."),
  );
}

#[test]
fn handle_syntax_error() {
  let runtime = create_tokio_runtime();

  runtime.block_on(async move {
    let handler = PrettierPluginHandler::default();
    let err = handler
      .format(
        FormatRequest {
          config_id: FormatConfigId::from_raw(0),
          file_path: PathBuf::from("file.js"),
          file_bytes: "const v =".to_string().into_bytes(),
          config: Arc::new(Default::default()),
          range: None,
          token: Arc::new(NullCancellationToken),
        },
        |_| std::future::ready(Ok(None)).boxed_local(),
      )
      .await
      .err()
      .unwrap();
    let expected = "SyntaxError: Unexpected token (1:10)";
    assert_eq!(&err.to_string()[..expected.len()], expected);
  });
}

#[test]
fn handle_invalid_file() {
  let runtime = create_tokio_runtime();

  runtime.block_on(async move {
    let handler = PrettierPluginHandler::default();
    let err = handler
      .format(
        FormatRequest {
          config_id: FormatConfigId::from_raw(0),
          file_path: PathBuf::from("file.txt"),
          file_bytes: "const v =".to_string().into_bytes(),
          config: Arc::new(Default::default()),
          range: None,
          token: Arc::new(NullCancellationToken),
        },
        |_| std::future::ready(Ok(None)).boxed_local(),
      )
      .await
      .err()
      .unwrap();
    let expected = "UndefinedParserError: No parser could be inferred for file \"file.txt\"";
    assert_eq!(&err.to_string()[..expected.len()], expected);
  });
}
