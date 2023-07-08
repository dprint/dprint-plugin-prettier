/**
 * This script checks for any prettier updates and then automatically
 * publishes a new version of the plugin if so.
 */
import * as semver from "https://deno.land/std@0.153.0/semver/mod.ts";
import $ from "https://deno.land/x/dax@0.33.0/mod.ts";

const rootDirPath = $.path(import.meta).parentOrThrow().parentOrThrow();

$.logStep("Upgrading prettier...");
await $`npm install`.cwd(rootDirPath);
await $`npm install --save prettier`.cwd(rootDirPath);
await $`npm install --save prettier-plugin-astro`.cwd(rootDirPath);
await $`npm install --save prettier-plugin-jsdoc`.cwd(rootDirPath);
await $`npm install --save prettier-plugin-svelte`.cwd(rootDirPath);

if (!await hasFileChanged("./package.json")) {
  $.log("No changes.");
  Deno.exit(0);
}

$.log("Found changes.");
$.logStep("Bumping version...");
const newVersion = await bumpMinorVersion();

// run the tests
$.logStep("Running tests...");
await $`cargo test`;

// release
$.logStep(`Committing and publishing ${newVersion}...`);
await $`git add .`;
await $`git commit -m ${newVersion}`;
await $`git push origin main`;
await $`git tag ${newVersion}`;
await $`git push origin ${newVersion}`;

async function bumpMinorVersion() {
  const projectFile = rootDirPath.join("./package.json");
  const data = await projectFile.readJson();
  const newVersion = semver.parse(data.version)!.inc("minor").toString();
  data.version = newVersion;
  await projectFile.writeJsonPretty(data);
  return newVersion;
}

async function hasFileChanged(file: string) {
  try {
    await $`git diff --exit-code ${file}`.cwd(rootDirPath);
    return false;
  } catch {
    return true;
  }
}
