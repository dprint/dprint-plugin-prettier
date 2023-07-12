use std::path::PathBuf;
use std::sync::Arc;

use dprint_core::configuration::parse_config_key_map;
use dprint_core::plugins::AsyncPluginHandler;
use dprint_core::plugins::FormatRequest;
use dprint_core::plugins::NoopHost;
use dprint_core::plugins::NullCancellationToken;
use dprint_development::*;
use dprint_plugin_prettier::config::resolve_config;
use dprint_plugin_prettier::create_tokio_runtime;
use dprint_plugin_prettier::PrettierPluginHandler;

use pretty_assertions::assert_eq;

#[test]
fn test_specs() {
  let runtime = create_tokio_runtime();
  let handle = runtime.handle().clone();

  runtime.block_on(async move {
    tokio::task::spawn_blocking(move || {
      let handler = PrettierPluginHandler::default();
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
          let handler = handler.clone();
          move |file_name, file_text, spec_config| {
            let config_result =
              resolve_config(parse_config_key_map(spec_config), Default::default());
            ensure_no_diagnostics(&config_result.diagnostics);

            handle.block_on(async {
              handler
                .format(
                  FormatRequest {
                    file_path: file_name.to_path_buf(),
                    file_text: file_text.to_string(),
                    config: Arc::new(config_result.config),
                    range: None,
                    token: Arc::new(NullCancellationToken),
                  },
                  Arc::new(NoopHost),
                )
                .await
            })
          }
        },
        move |_file_name, _file_text, _spec_config| panic!("Not supported."),
      );
    })
    .await
    .unwrap();
  });
}

#[test]
fn handle_syntax_error() {
  let runtime = create_tokio_runtime();

  runtime.block_on(async move {
    let handler = PrettierPluginHandler::default();
    let err = handler
      .format(
        FormatRequest {
          file_path: PathBuf::from("file.js"),
          file_text: "const v =".to_string(),
          config: Arc::new(Default::default()),
          range: None,
          token: Arc::new(NullCancellationToken),
        },
        Arc::new(NoopHost),
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
          file_path: PathBuf::from("file.txt"),
          file_text: "const v =".to_string(),
          config: Arc::new(Default::default()),
          range: None,
          token: Arc::new(NullCancellationToken),
        },
        Arc::new(NoopHost),
      )
      .await
      .err()
      .unwrap();
    let expected = "Error: No parser could be inferred for file: file.txt";
    assert_eq!(&err.to_string()[..expected.len()], expected);
  });
}
