#!/usr/bin/env -S deno run -A
import $ from "dax";

const manifestPath = $.path(import.meta.dirname!).join("../npm-dist/publish-manifest.json");
const manifest = JSON.parse(await manifestPath.readText()) as {
  subPackageTarballs: string[];
  mainPackageTarball: string;
};

// publish the per-platform sub-package tarballs first so the main package's
// `optionalDependencies` resolve. Publishing the tarballs directly (rather
// than the directories) guarantees npm uploads the exact bytes whose
// sha256 dprint will verify against the checksum in plugin.json.
for (const tgz of manifest.subPackageTarballs) {
  $.logStep("Publishing sub-package tarball", tgz);
  await $`npm publish --access public --provenance ${tgz}`;
}
$.logStep("Publishing main package tarball", manifest.mainPackageTarball);
await $`npm publish --access public --provenance ${manifest.mainPackageTarball}`;
