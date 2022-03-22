import * as path from "https://deno.land/std@0.130.0/path/mod.ts";

const currentDirPath = path.dirname(path.fromFileUrl(import.meta.url));
const cargoFilePath = path.join(currentDirPath, "../", "Cargo.toml");
const packageText = Deno.readTextFileSync(cargoFilePath);
// version = "x.x.x"
const version = packageText.match(/version\s*=\s*\"(\d+\.\d+\.\d+)\"/)![1];
const pluginName = "dprint-plugin-prettier";

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error("Error extracting version.");
}

const outputFile = {
  schemaVersion: 2,
  name: pluginName,
  version,
  ...getPlatformSpecificProperties(),
};
Deno.writeTextFile("plugin.exe-plugin", JSON.stringify(outputFile, undefined, 2) + "\n");

async function getPlatformSpecificProperties() {
  if (Deno.args.some(a => a == "--test")) {
    return Object.fromEntries([await platformToKeyValue(Deno.build.os)]);
  } else {
    return Object.fromEntries([
      await platformToKeyValue("darwin"),
      await platformToKeyValue("linux"),
      await platformToKeyValue("windows"),
    ]);
  }

  async function platformToKeyValue(platform: "windows" | "linux" | "darwin") {
    return [`${platform}-x86_64`, await getPlatformObject(getOsPluginFile(platform))];
  }
}

async function getPlatformObject(zipFileName: string) {
  const fileBytes = Deno.readFileSync(zipFileName);
  const checksum = await getChecksum(fileBytes);
  console.log(zipFileName + ": " + checksum);
  return {
    "reference": getPlatformReferenceUrl(zipFileName),
    "checksum": checksum,
  };
}

function getOsPluginFile(os: "windows" | "darwin" | "linux") {
  switch (os) {
    case "windows":
      return `${pluginName}-x86_64-pc-windows-msvc.zip`;
    case "darwin":
      return `${pluginName}-x86_64-apple-darwin.zip`;
    case "linux":
      return `${pluginName}-x86_64-unknown-linux-gnu.zip`
  }
}

async function getChecksum(bytes: Uint8Array) {
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

function getPlatformReferenceUrl(zipFileName: string) {
  if (Deno.args.some(arg => arg === "--test")) {
    return zipFileName;
  } else {
    return `https://github.com/dprint/${pluginName}/releases/download/${version}/${zipFileName}`;
  }
}
