import $ from "dax";
import { getChecksum } from "https://raw.githubusercontent.com/dprint/automation/0.8.1/hash.ts";

await $`./scripts/create_for_testing.ts`;
const checksum = await getChecksum($.path("./target/release/plugin.json").readBytesSync());
const dprintConfig = $.path("dprint.json");
const data = dprintConfig.readJsonSync<{ plugins: string[] }>();
const index = data.plugins.findIndex(d => d.startsWith("./target") || d.includes("prettier"));
data.plugins[index] = `./target/release/plugin.json@${checksum}`;
dprintConfig.writeJsonPrettySync(data);
await $`dprint fmt`;
