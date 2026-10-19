// Gives the packages in prettier/package.json the versions that prettier's own package.json has at a version, which
// are what its release is built with, so that the plugin formats as that release does:
//   node scripts/pin-dependencies.mjs <prettier version>
// Run `npm install --ignore-scripts` in ./prettier afterwards. A library in src/vendor that is a copy of one of the
// packages needs updating too when its version changes (see scripts/carry-types.mjs).
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const version = process.argv[2];
if (version == null) {
  throw new Error("Expected the version of prettier.");
}
const response = await fetch(`https://raw.githubusercontent.com/prettier/prettier/${version}/package.json`);
if (!response.ok) {
  throw new Error(`Could not get prettier's package.json at ${version}: ${response.status}`);
}
const upstream = await response.json();
const pinned = { ...upstream.devDependencies, ...upstream.dependencies };
const packagePath = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "../prettier/package.json");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
for (const name of Object.keys(pkg.dependencies)) {
  if (pinned[name] == null) {
    console.warn(`${name} is not in prettier's package.json at ${version}`);
  } else if (pinned[name] !== pkg.dependencies[name]) {
    console.log(`${name}: ${pkg.dependencies[name]} -> ${pinned[name]}`);
    pkg.dependencies[name] = pinned[name];
  }
}
pkg.version = version;
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");
