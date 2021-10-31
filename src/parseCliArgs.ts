export interface CliArgs {
  parentProcessId: number;
}

export function parseCliArgs(): CliArgs {
  // simple for now
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--parent-pid" && i + 1 < args.length) {
      return {
        parentProcessId: parseInt(args[i + 1], 10),
      };
    }
  }
  throw new Error("Please provide a --parent-pid <pid> flag.");
}
