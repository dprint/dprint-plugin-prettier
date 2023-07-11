import $ from "dax";
import { compress } from "https://deno.land/x/zip@v1.2.5/mod.ts";

$.logStep("Building...");
await $`npm run build`;

$.logStep("Compressing...");
const currentDir = $.path(import.meta).parentOrThrow();
const distDir = currentDir.join("../dist").resolve();
await compress(
  distDir.join("index.mjs").toString(),
  distDir.join("plugin.zip").toString(),
  { overwrite: true, flags: [] },
);
$.logStep("Creating plugin file...");
await $`deno run -A create_plugin_file.ts --test`.cwd(currentDir);
