# Script for quickly creating the plugin for testing purposes on Windows
# To run:
# 1. Change the one line to `reference": `./${zipFileName}`,` in scripts/createPluginFile.js
# 2. Run `./scripts/createForTesting.ps1`
# 3. Update .dprintrc.json to point at ./prettier.exe-plugin then update checksum
#    as shown when initially run.

$ErrorActionPreference = "Stop"

npm run build
mv index-macos dprint-plugin-prettier
Compress-Archive -Force -Path dprint-plugin-prettier -DestinationPath dprint-plugin-prettier-x86_64-apple-darwin.zip
rm dprint-plugin-prettier
mv index-linux dprint-plugin-prettier
Compress-Archive -Force -Path dprint-plugin-prettier -DestinationPath dprint-plugin-prettier-x86_64-unknown-linux-gnu.zip
rm dprint-plugin-prettier
mv index-win.exe dprint-plugin-prettier.exe
Compress-Archive -Force -Path dprint-plugin-prettier.exe -DestinationPath dprint-plugin-prettier-x86_64-pc-windows-msvc.zip
rm dprint-plugin-prettier.exe
node ./scripts/createPluginFile.js --test
