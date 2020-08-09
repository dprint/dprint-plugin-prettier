import { startMessageProcessor } from "./messageProcessor";
import { parseCliArgs } from "./parseCliArgs";
import { startParentProcessChecker } from "./parentProcessChecker";

const cliArgs = parseCliArgs();

startParentProcessChecker(cliArgs.parentProcessId);
startMessageProcessor();
