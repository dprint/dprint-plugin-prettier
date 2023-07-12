#!/usr/bin/env -S deno run -A
import $ from "dax";
import { compress } from "https://deno.land/x/zip@v1.2.5/mod.ts";

const currentDir = $.path(import.meta).parentOrThrow();
const rootDir = currentDir.join("../").resolve();
const distDir = rootDir.join("./dist").resolve();

$.logStep("Building...");
await $`npm run build`;

$.logStep("Compressing...");
await compress(
  [
    distDir.join("main.mjs").toString(),
    distDir.join("package.json").toString(),
    distDir.join("package-lock.json").toString(),
  ],
  distDir.join("plugin.zip").toString(),
  { overwrite: true, flags: [] },
);
$.logStep("Creating plugin file...");
await $`./create_plugin_file.ts --test`.cwd(currentDir);
