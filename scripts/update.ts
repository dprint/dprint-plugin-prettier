/**
 * This script checks for any prettier updates and then automatically
 * publishes a new version of the plugin if so.
 */
import * as path from "https://deno.land/std@0.146.0/path/mod.ts";
import * as semver from "https://deno.land/x/semver@v1.4.0/mod.ts";

const rootDirPath = path.dirname(path.dirname(path.fromFileUrl(import.meta.url)));

console.log("Upgrading prettier...");
await runCommand("npm install --save prettier".split(" "), {
  cwd: path.join(rootDirPath, "./js/node"),
});

if (!hasFileChanged("./js/node/package.json")) {
  console.log("No changes.");
  Deno.exit(0);
}

console.log("Found changes. Bumping version...");
const newVersion = await bumpMinorVersion();

// run the tests
console.log("Running tests...");
await runCommand("cargo test".split(" "));

// release
console.log(`Committing and publishing ${newVersion}...`);
await runCommand("git add .".split(" "));
await runCommand(`git commit -m ${newVersion}`.split(" "));
await runCommand(`git push origin main`.split(" "));
await runCommand(`git tag ${newVersion}`.split(" "));
await runCommand(`git push origin ${newVersion}`.split(" "));

async function bumpMinorVersion() {
  const projectFile = path.join(rootDirPath, "./Cargo.toml");
  const text = await Deno.readTextFile(projectFile);
  const versionRegex = /^version = "([0-9]+\.[0-9]+\.[0-9]+)"/m;
  const currentVersion = text.match(versionRegex)?.[1];
  if (currentVersion == null) {
    throw new Error("Could not find version.");
  }
  const newVersion = semver.parse(currentVersion)!.inc("minor").toString();
  const newText = text.replace(versionRegex, `version = "${newVersion}"`);
  await Deno.writeTextFile(projectFile, newText);
  return newVersion;
}

async function hasFileChanged(file: string) {
  try {
    await runCommand(["git", "diff", "--exit-code", file]);
    return false;
  } catch {
    return true;
  }
}

async function runCommand(cmd: string[], opts?: {
  cwd?: string;
}) {
  const p = Deno.run({
    cmd,
    cwd: opts?.cwd ?? rootDirPath,
  });
  const status = await p.status();
  p.close();
  if (status.code !== 0) {
    throw new Error("Failed.");
  }
}
