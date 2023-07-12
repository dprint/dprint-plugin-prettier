# Script for quickly creating the plugin for testing purposes on Windows
# To run:
# 1. Change the one line to `reference": `./${zipFileName}`,` in scripts/createPluginFile.js
# 2. Run `./scripts/createForTesting.ps1`
# 3. Update dprint.json to point at ./plugin.json then update checksum
#    as shown when initially run.

$ErrorActionPreference = "Stop"

deno task build

# todo: support more operating systems
cargo build --release
Compress-Archive -Force -Path target/release/dprint-plugin-prettier.exe -DestinationPath target/release/dprint-plugin-prettier-x86_64-pc-windows-msvc.zip
pwsh -Command { cd target/release && deno run --allow-read=../../ --allow-write=. --allow-env ../../scripts/create_plugin_file.ts --test }
