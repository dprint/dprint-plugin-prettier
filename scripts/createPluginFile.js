const fs = require("fs");
const crypto = require("crypto");

const packageJson = JSON.parse(fs.readFileSync("package.json", { encoding: "utf8" }));
const version = packageJson.version;
const outputFile = {
    schemaVersion: 1,
    name: "dprint-plugin-prettier",
    version,
    "mac-x86_64": getPlatformObject("dprint-plugin-prettier-x86_64-apple-darwin.zip"),
    "linux-x86_64": getPlatformObject("dprint-plugin-prettier-x86_64-unknown-linux-gnu.zip"),
    "windows-x86_64": getPlatformObject("dprint-plugin-prettier-x86_64-pc-windows-msvc.zip"),
};
fs.writeFileSync("prettier.plugin", JSON.stringify(outputFile, undefined, 2), { encoding: "utf8" });

function getPlatformObject(zipFileName) {
    const fileBytes = fs.readFileSync(zipFileName);
    const hash = crypto.createHash("sha256");
    hash.update(fileBytes);
    return {
        "reference": `https://github.com/dprint/dprint-plugin-prettier/releases/download/${version}/${zipFileName}`,
        "checksum": hash.digest("hex"),
    };
}
