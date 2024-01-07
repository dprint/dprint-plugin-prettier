/**
 * This script checks for any prettier updates and then automatically
 * publishes a new version of the plugin if so.
 */
import $ from "dax";
import * as semver from "https://deno.land/std@0.192.0/semver/mod.ts";

const rootDirPath = $.path(import.meta).parentOrThrow().parentOrThrow();

$.logStep("Upgrading prettier...");
const jsNodePath = rootDirPath.join("./js/node");
await $`npm install`.cwd(jsNodePath);
await $`npm install --save prettier`.cwd(jsNodePath);
// await $`npm install --save prettier-plugin-astro`.cwd(jsNodePath);
await $`npm install --save prettier-plugin-jsdoc`.cwd(jsNodePath);
await $`npm install --save prettier-plugin-svelte`.cwd(jsNodePath);

if (!await hasFileChanged("./js/node/package.json")) {
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
  const projectFile = rootDirPath.join("./plugin/Cargo.toml");
  const text = await projectFile.readText();
  const versionRegex = /^version = "([0-9]+\.[0-9]+\.[0-9]+)"$/m;
  const currentVersion = text.match(versionRegex)?.[1];
  if (currentVersion == null) {
    throw new Error("Could not find version.");
  }
  const newVersion = semver.format(semver.increment(semver.parse(currentVersion), "minor"));
  const newText = text.replace(versionRegex, `version = "${newVersion}"`);
  await projectFile.writeText(newText);
  return newVersion;
}

async function hasFileChanged(file: string) {
  try {
    await $`git diff --exit-code ${file}`;
    return false;
  } catch {
    return true;
  }
}
