/**
 * Bumps the version of the plugin in wasm/Plugin.csproj then commits, tags, and pushes it, which
 * causes the CI workflow to publish the release.
 */
import $ from "dax";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const csprojPath = rootDir.join("wasm/Plugin.csproj");
const versionRegex = /<Version>(\d+)\.(\d+)\.(\d+)<\/Version>/;

const newVersion = bumpVersion(getReleaseKind());
$.logStep(`Committing and publishing ${newVersion}...`);
await $`git add .`.cwd(rootDir);
await $`git commit -m ${newVersion}`.cwd(rootDir);
await $`git push origin main`.cwd(rootDir);
await $`git tag ${newVersion}`.cwd(rootDir);
await $`git push origin ${newVersion}`.cwd(rootDir);

/** Bumps the version in the project file and returns the new version. */
function bumpVersion(kind: "patch" | "minor") {
  const text = csprojPath.readTextSync();
  const match = text.match(versionRegex);
  if (match == null) {
    throw new Error("Could not find <Version>X.Y.Z</Version> in the project file.");
  }
  const [major, minor, patch] = match.slice(1).map(value => parseInt(value, 10));
  const newVersion = kind === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
  csprojPath.writeTextSync(text.replace(versionRegex, `<Version>${newVersion}</Version>`));
  return newVersion;
}

function getReleaseKind() {
  if (Deno.args.includes("--patch")) {
    return "patch";
  } else if (Deno.args.includes("--minor")) {
    return "minor";
  } else {
    throw new Error("Expected a --patch or --minor argument.");
  }
}
