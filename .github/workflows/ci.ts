#!/usr/bin/env -S deno run -A
import { conditions, step, workflow } from "@david/gagen";

// the version of prettier whose typed source is in ./prettier
const prettierVersion = "3.9.10";
const wasiSdkVersion = "29";
const wasiSdkDir = `wasi-sdk-${wasiSdkVersion}.0-x86_64-linux`;
const binaryenVersion = "version_133";
// for wasm2c, which makes C of Flow's parser
const wabtVersion = "1.0.42";

const isTag = conditions.isTag();

const getTagVersion = step({
  id: "get_tag_version",
  name: "Get tag version",
  if: isTag,
  run: "echo TAG_VERSION=${GITHUB_REF/refs\\/tags\\//} >> $GITHUB_OUTPUT",
  outputs: ["TAG_VERSION"],
});

workflow({
  name: "CI",
  on: {
    pull_request: { branches: ["main"] },
    push: { branches: ["main"], tags: ["*"] },
  },
  concurrency: {
    // https://stackoverflow.com/a/72408109/188246
    group: "${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}",
    cancelInProgress: true,
  },
  jobs: [{
    id: "build",
    name: "build",
    // the NativeAOT-LLVM compiler is only published for Linux and Windows hosts
    runsOn: "ubuntu-latest",
    // id-token: write is required for npm --provenance
    permissions: { contents: "write", "id-token": "write" },
    steps: [
      { name: "Checkout", uses: "actions/checkout@v6" },
      {
        // the plugin is compiled with nts, which is expected beside this repository
        name: "Checkout nts",
        run: "git clone --depth 1 https://github.com/dsherret/nts ../nts",
      },
      { uses: "denoland/setup-deno@v2" },
      {
        uses: "actions/setup-dotnet@v5",
        with: { "dotnet-version": "10.0.x" },
      },
      {
        uses: "actions/setup-node@v6",
        with: { "node-version": "24.x", "registry-url": "https://registry.npmjs.org" },
      },
      {
        name: "Install WASI SDK, Binaryen and WABT",
        run: [
          `curl -sSfL https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${wasiSdkVersion}/${wasiSdkDir}.tar.gz | tar xz -C "$RUNNER_TEMP"`,
          `echo "WASI_SDK_PATH=$RUNNER_TEMP/${wasiSdkDir}" >> "$GITHUB_ENV"`,
          `curl -sSfL https://github.com/WebAssembly/binaryen/releases/download/${binaryenVersion}/binaryen-${binaryenVersion}-x86_64-linux.tar.gz | tar xz -C "$RUNNER_TEMP"`,
          `echo "BINARYEN=$RUNNER_TEMP/binaryen-${binaryenVersion}/bin" >> "$GITHUB_ENV"`,
          `curl -sSfL https://github.com/WebAssembly/wabt/releases/download/${wabtVersion}/wabt-${wabtVersion}-linux-x64.tar.gz | tar xz -C "$RUNNER_TEMP"`,
          `echo "WABT=$RUNNER_TEMP/wabt-${wabtVersion}" >> "$GITHUB_ENV"`,
        ],
      },
      {
        name: "Lint workflow generation",
        if: isTag.not(),
        run: [
          "./.github/workflows/ci.ts --lint",
          "./.github/workflows/release.ts --lint",
        ],
      },
      { name: "Install prettier's and the prettier plugins' dependencies", run: "deno task setup" },
      { name: "Build", run: "deno task build" },
      { name: "Test", run: "deno task test" },
      {
        // formats the tests of prettier's repository with the plugin and with prettier, which must come out the same
        name: "Test prettier's tests",
        run: "deno task test:prettier",
      },
      {
        // formats the tests of the prettier plugins that the plugin includes, and prettier's tests of javascript with
        // prettier-plugin-jsdoc, with the plugin and with prettier, which must come out the same
        name: "Test the prettier plugins' tests",
        run: "deno task test:plugins",
      },
      {
        name: "Setup and test npm deployment",
        run: [
          "cd deployment/npm",
          "npm install",
          "node setup.js",
          "npm run test",
        ],
      },
      getTagVersion,
      {
        name: "Pre-release",
        if: isTag,
        run: [
          "# update config schema to have version",
          `sed -i 's/dprint-plugin-prettier\\/0.0.0/dprint-plugin-prettier\\/${getTagVersion.outputs.TAG_VERSION}/' deployment/schema.json`,
          "# update the npm package to have version",
          "(cd deployment/npm && node setup.js sync-version)",
          "# create release notes",
          `deno run -A ./scripts/generate_release_notes.ts ${prettierVersion} > \${{ github.workspace }}-CHANGELOG.txt`,
        ],
      },
      {
        name: "Release",
        if: isTag,
        uses: "softprops/action-gh-release@v2",
        env: { GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}" },
        with: {
          files: [
            "deployment/npm/plugin.wasm",
            "deployment/schema.json",
          ].join("\n"),
          body_path: "${{ github.workspace }}-CHANGELOG.txt",
          draft: false,
        },
      },
      {
        // npm trusted publishing (OIDC) requires npm >= 11.5.1.
        name: "Upgrade npm",
        if: isTag,
        run: "npm install --global npm@latest",
      },
      {
        name: "Publish npm package",
        if: isTag,
        // publish from within the directory because npm treats a path
        // like "deployment/npm" as a GitHub repository
        run: [
          "cd deployment/npm",
          "npm publish --access public --provenance",
        ],
      },
    ],
  }],
}).writeOrLint({
  filePath: new URL("./ci.generated.yml", import.meta.url),
  header: "# GENERATED BY ./ci.ts -- DO NOT DIRECTLY EDIT",
  pinDeps: true,
});
