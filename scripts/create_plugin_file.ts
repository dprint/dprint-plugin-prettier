import * as path from "https://deno.land/std@0.130.0/path/mod.ts";
import { extractCargoVersion, processPlugin } from "https://raw.githubusercontent.com/dprint/automation/0.1.0/mod.ts";

const currentDirPath = path.dirname(path.fromFileUrl(import.meta.url));
const cargoFilePath = path.join(currentDirPath, "../", "Cargo.toml");
const pluginName = "dprint-plugin-prettier";

const builder = new processPlugin.PluginFileBuilder({
  name: "dprint-plugin-prettier",
  version: await extractCargoVersion(cargoFilePath),
});

if (Deno.args.some(a => a == "--test")) {
  const platform = processPlugin.getCurrentPlatform();
  const zipFileName = processPlugin.getStandardZipFileName(builder.pluginName, platform);
  await builder.addPlatform({
    platform,
    zipFilePath: zipFileName,
    zipUrl: zipFileName,
  });
} else {
  await addPlatform("darwin-x86_64");
  await addPlatform("linux-x86_64");
  await addPlatform("windows-x86_64");
}

await builder.writeToPath("plugin.exe-plugin");

async function addPlatform(platform: processPlugin.Platform) {
  const zipFileName = processPlugin.getStandardZipFileName(builder.pluginName, platform);
  const zipUrl = `https://github.com/dprint/${pluginName}/releases/download/${builder.version}/${zipFileName}`;
  await builder.addPlatform({
    platform,
    zipFilePath: zipFileName,
    zipUrl,
  });
}
