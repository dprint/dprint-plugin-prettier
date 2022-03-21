use dprint_core::plugins::process::get_parent_process_id_from_cli_args;
use dprint_core::plugins::process::handle_process_stdio_messages;
use dprint_core::plugins::process::start_parent_process_checker_task;
use handler::PrettierPluginHandler;

use crate::utils::create_tokio_runtime;

mod formatter;
mod handler;
mod runtime;
mod utils;

fn main() {
  let runtime = create_tokio_runtime();
  runtime.block_on(async {
    if let Some(parent_process_id) = get_parent_process_id_from_cli_args() {
      start_parent_process_checker_task(parent_process_id);
    }

    handle_process_stdio_messages(PrettierPluginHandler::new()).await
  });
}
