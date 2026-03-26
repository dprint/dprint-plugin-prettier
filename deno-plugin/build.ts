// builds the zip archive and plugin.json manifest for testing
import { crypto } from "jsr:@std/crypto@1";
import { encodeHex } from "jsr:@std/encoding@1/hex";
import { dirname, fromFileUrl, join } from "jsr:@std/path@1";
const thisDir = dirname(fromFileUrl(import.meta.url));
const outDir = join(thisDir, "..", "out");

// clean output
try {
  await Deno.remove(outDir, { recursive: true });
} catch {
  // ignore
}
await Deno.mkdir(outDir, { recursive: true });

// create zip using powershell on windows
const zipPath = join(outDir, "archive.zip");
const filesToZip = ["main.ts", "deno.json", "deno.lock"];
const fullPaths = filesToZip.map(f => join(thisDir, f).replaceAll("/", "\\"));
const zipPathWin = zipPath.replaceAll("/", "\\");

const cmd = new Deno.Command("powershell", {
  args: [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path ${fullPaths.map(p => `'${p}'`).join(",")} -DestinationPath '${zipPathWin}' -Force`,
  ],
});
const result = await cmd.output();
if (!result.success) {
  console.error("Failed to create zip:", new TextDecoder().decode(result.stderr));
  Deno.exit(1);
}

// compute checksum
const zipBytes = await Deno.readFile(zipPath);
const hashBuffer = await crypto.subtle.digest("SHA-256", zipBytes);
const checksum = encodeHex(new Uint8Array(hashBuffer));

// create plugin.json manifest
const manifest = {
  schemaVersion: 3,
  kind: "deno",
  name: "dprint-plugin-prettier",
  version: "0.68.0",
  archive: {
    reference: `./archive.zip`,
    checksum,
  },
  permissions: {
    env: true,
    read: true,
    sys: true,
  },
};

const manifestPath = join(outDir, "plugin.json");
await Deno.writeTextFile(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Built plugin archive: ${zipPath}`);
console.log(`Archive checksum: ${checksum}`);
console.log(`Plugin manifest: ${manifestPath}`);
