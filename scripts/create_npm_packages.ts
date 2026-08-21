#!/usr/bin/env -S deno run -A
import { CargoToml, getChecksum, processPlugin } from "@dprint/automation";
import $ from "dax";

const pluginName = "dprint-plugin-prettier";
const mainPackageName = "@dprint/prettier";
const outDir = "npm-dist";
// where the platform zips are extracted before being repacked as npm sub-packages.
const extractDir = "npm-binaries";

const platforms: processPlugin.Platform[] = [
  "darwin-x86_64",
  "darwin-aarch64",
  "linux-x86_64",
  "linux-aarch64",
  "windows-x86_64",
];

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const version = new CargoToml(rootDir.join("plugin/Cargo.toml")).version();

const extractRoot = rootDir.join(extractDir);
extractRoot.mkdirSync({ recursive: true });

const platformInputs = await Promise.all(platforms.map(async (platform) => {
  const zipPath = rootDir.join(
    processPlugin.getStandardZipFileName(pluginName, platform),
  );
  const platformDir = extractRoot.join(platform);
  platformDir.mkdirSync({ recursive: true });
  await $`unzip -o ${zipPath.toString()} -d ${platformDir.toString()}`.quiet();
  const binaryName = platform.startsWith("windows-") ? `${pluginName}.exe` : pluginName;
  return {
    platform,
    binaryPath: platformDir.join(binaryName).toString(),
  };
}));

const result = await processPlugin.createDprintOrgNpmPackages({
  pluginName,
  mainPackageName,
  version,
  outDir: rootDir.join(outDir).toString(),
  platforms: platformInputs,
  packageJsonExtra: {
    description: "Use Prettier as a dprint plugin to format code.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/dprint/dprint-plugin-prettier.git",
    },
    homepage: "https://github.com/dprint/dprint-plugin-prettier",
  },
});

// hash the main tarball so the release-notes step can embed it in the
// `npm:@dprint/prettier@<version>/plugin.json@<hash>` reference users paste
// into dprint.json. This is the hash dprint verifies before extracting.
const mainPackageChecksum = await getChecksum(await Deno.readFile(result.mainPackageTarball));

// emit a manifest so publish_npm_packages.ts knows the order and which
// tarballs to publish without having to re-derive it from the directory.
await Deno.writeTextFile(
  rootDir.join(outDir, "publish-manifest.json").toString(),
  JSON.stringify(
    {
      mainPackageName,
      version,
      subPackageTarballs: result.subPackageTarballs,
      mainPackageTarball: result.mainPackageTarball,
      mainPackageChecksum,
    },
    undefined,
    2,
  ) + "\n",
);

console.log("Main package tarball:", result.mainPackageTarball);
console.log("Sub-package tarballs:");
for (const tgz of result.subPackageTarballs) {
  console.log("  " + tgz);
}
