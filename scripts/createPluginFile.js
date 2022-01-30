const fs = require("fs");
const crypto = require("crypto");

const hasTestArg = process.argv.slice(2).some(arg => arg === "--test");
const packageJson = JSON.parse(fs.readFileSync("package.json", { encoding: "utf8" }));
const version = packageJson.version;

ensureCodeHasVersion();

const outputFile = {
  schemaVersion: 1,
  name: "dprint-plugin-prettier",
  version,
  "mac-x86_64": getPlatformObject("dprint-plugin-prettier-x86_64-apple-darwin.zip"),
  "linux-x86_64": getPlatformObject("dprint-plugin-prettier-x86_64-unknown-linux-gnu.zip"),
  "windows-x86_64": getPlatformObject("dprint-plugin-prettier-x86_64-pc-windows-msvc.zip"),
};
fs.writeFileSync("plugin.exe-plugin", JSON.stringify(outputFile, undefined, 2), { encoding: "utf8" });

function getPlatformObject(zipFileName) {
  const fileBytes = fs.readFileSync(zipFileName);
  const hash = crypto.createHash("sha256");
  hash.update(fileBytes);
  const checksum = hash.digest("hex");
  console.log(zipFileName + ": " + checksum);
  return {
    "reference": hasTestArg
      ? `./${zipFileName}`
      : `https://github.com/dprint/dprint-plugin-prettier/releases/download/${version}/${zipFileName}`,
    "checksum": checksum,
  };
}

function ensureCodeHasVersion() {
  // just in case...
  const fileText = fs.readFileSync("./src/messageProcessor.ts", { encoding: "utf8" });
  if (!fileText.includes(`"${version}"`)) {
    throw new Error(`Could not find version (${version}) in messageProcessor.ts`);
  }
}
