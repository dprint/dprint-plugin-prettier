use dprint_core::plugins::process::get_parent_process_id_from_cli_args;
use dprint_core::plugins::process::handle_process_stdio_messages;
use dprint_core::plugins::process::start_parent_process_checker_task;
use dprint_plugin_deno_base::util::create_tokio_runtime;
use handler::PrettierPluginHandler;

mod config;
mod formatter;
mod handler;

fn main() {
  let runtime = create_tokio_runtime();
  let result = runtime.block_on(async {
    if let Some(parent_process_id) = get_parent_process_id_from_cli_args() {
      start_parent_process_checker_task(parent_process_id);
    }

    handle_process_stdio_messages(PrettierPluginHandler::default()).await
  });

  if let Err(err) = result {
    eprintln!("Shutting down due to error: {}", err);
    std::process::exit(1);
  }
}
