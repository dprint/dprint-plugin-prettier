import { startMessageProcessor } from "./messageProcessor";
import { startParentProcessChecker } from "./parentProcessChecker";
import { parseCliArgs } from "./parseCliArgs";

const cliArgs = parseCliArgs();

startParentProcessChecker(cliArgs.parentProcessId);
startMessageProcessor();
