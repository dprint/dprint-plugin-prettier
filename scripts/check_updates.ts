#!/usr/bin/env -S deno run -A
/**
 * Fails when npm has a newer Prettier or Prettier plugin than the plugin is
 * compiled from, so that the scheduled workflow that runs this sends an email.
 *
 * Upgrading is done by hand, following docs/upgrading.md, because Prettier's
 * new source needs to be merged with the types that make the compiled code fast.
 */
import $ from "dax";

// the packages whose source the plugin is compiled from (svelte is left out,
// since it is only what prettier-plugin-svelte parses with and changes often)
const packageNames = ["prettier", "prettier-plugin-jsdoc", "prettier-plugin-svelte"];

const rootDirPath = $.path(import.meta.dirname!).parentOrThrow();
const dependencies: Record<string, string> = rootDirPath.join("plugins/package.json").readJsonSync<
  { dependencies: Record<string, string> }
>().dependencies;

const outdated = [];
for (const name of packageNames) {
  const current = dependencies[name];
  const latest = await getLatestVersion(name);
  $.log(`${name}: ${current} (latest ${latest})`);
  if (current !== latest) {
    outdated.push(`${name} ${current} -> ${latest}`);
  }
}

if (outdated.length > 0) {
  $.logError("Out of date", `${outdated.join(", ")}. See docs/upgrading.md.`);
  Deno.exit(1);
}

async function getLatestVersion(name: string): Promise<string> {
  const response = await fetch(`https://registry.npmjs.org/${name}/latest`);
  if (!response.ok) {
    throw new Error(`Could not get the latest version of ${name}: ${response.status}`);
  }
  return (await response.json()).version;
}
