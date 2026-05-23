#!/usr/bin/env -S deno run -A
import { conditions, expr, job, step, workflow } from "@david/gagen";

enum OperatingSystem {
  Macx86 = "macos-15-intel",
  MacArm = "macos-latest",
  Windows = "windows-latest",
  // uses an older version of ubuntu because of issue dprint/#483
  Linux = "ubuntu-22.04",
  LinuxArm = "ubuntu-24.04-arm",
}

interface ProfileData {
  os: OperatingSystem;
  target: string;
  runTests?: boolean;
  cross?: boolean;
}

const profileDataItems: ProfileData[] = [{
  os: OperatingSystem.Macx86,
  target: "x86_64-apple-darwin",
  runTests: true,
}, {
  os: OperatingSystem.MacArm,
  target: "aarch64-apple-darwin",
  runTests: true,
}, {
  os: OperatingSystem.Windows,
  target: "x86_64-pc-windows-msvc",
  runTests: true,
}, {
  os: OperatingSystem.Linux,
  target: "x86_64-unknown-linux-gnu",
  runTests: true,
}, {
  os: OperatingSystem.LinuxArm,
  target: "aarch64-unknown-linux-gnu",
  runTests: true,
}];

const profiles = profileDataItems.map((profile) => {
  return {
    ...profile,
    artifactsName: `${profile.target}-artifacts`,
    zipFileName: `dprint-plugin-prettier-${profile.target}.zip`,
    zipChecksumEnvVarName: `ZIP_CHECKSUM_${profile.target.toUpperCase().replaceAll("-", "_")}`,
  };
});

const matrix = {
  config: profiles.map((profile) => ({
    os: profile.os,
    run_tests: (profile.runTests ?? false).toString(),
    cross: (profile.cross ?? false).toString(),
    target: profile.target,
  })),
};

const target = expr("matrix.config.target");
const os = expr("matrix.config.os");
const cross = expr("matrix.config.cross");
const runTests = expr("matrix.config.run_tests");

const isTag = conditions.isTag();
const isNotTag = isTag.not();
const isMain = conditions.isBranch("main");
const isCross = cross.equals("true");
const isNotCross = cross.notEquals("true");
// only run aarch64 linux on main or tags to save CI time
const runsOnThisRef = target.notEquals("aarch64-unknown-linux-gnu").or(isMain)
  .or(isTag);

function getPreReleaseRunSteps(profile: typeof profiles[number]) {
  switch (profile.os) {
    case OperatingSystem.MacArm:
    case OperatingSystem.Macx86:
    case OperatingSystem.Linux:
    case OperatingSystem.LinuxArm:
      return [
        `cd target/${profile.target}/release`,
        `zip -r ${profile.zipFileName} dprint-plugin-prettier`,
        `echo "ZIP_CHECKSUM=$(shasum -a 256 ${profile.zipFileName} | awk '{print $1}')" >> $GITHUB_OUTPUT`,
      ];
    case OperatingSystem.Windows:
      return [
        `Compress-Archive -CompressionLevel Optimal -Force -Path target/${profile.target}/release/dprint-plugin-prettier.exe -DestinationPath target/${profile.target}/release/${profile.zipFileName}`,
        `echo "ZIP_CHECKSUM=$(shasum -a 256 target/${profile.target}/release/${profile.zipFileName} | awk '{print $1}')" >> $GITHUB_OUTPUT`,
      ];
  }
}

const preReleaseStepIds = profiles.map((profile) => `pre_release_${profile.target.replaceAll("-", "_")}`);

const preReleaseSteps = profiles.map((profile, i) => ({
  id: preReleaseStepIds[i],
  name: `Pre-release (${profile.target})`,
  if: target.equals(profile.target).and(isTag),
  run: getPreReleaseRunSteps(profile).join("\n"),
}));

// deno-lint-ignore no-explicit-any
const buildSteps: any[] = [
  { uses: "actions/checkout@v4" },
  { uses: "dsherret/rust-toolchain-file@v1" },
  {
    name: "Cache cargo",
    uses: "Swatinem/rust-cache@v2",
    with: {
      "prefix-key": "v3-${{matrix.config.target}}",
      "save-if": "${{ github.ref == 'refs/heads/main' }}",
    },
  },
  {
    name: "Setup Rust (aarch64-apple-darwin)",
    if: target.equals("aarch64-apple-darwin"),
    run: "rustup target add aarch64-apple-darwin",
  },
  { uses: "denoland/setup-deno@v2" },
  {
    uses: "actions/setup-node@v4",
    with: { "node-version": 21 },
  },
  {
    name: "npm install",
    run: "cd js/node && npm ci",
  },
  {
    name: "Setup cross",
    if: isCross,
    run: [
      "cd js/node && npm run build:script",
      "cargo install cross --locked --git https://github.com/cross-rs/cross --rev 4090beca3cfffa44371a5bba524de3a578aa46c3",
    ],
  },
  {
    name: "Build (Debug)",
    if: isNotCross.and(isNotTag),
    run: "cargo build --locked --all-targets --target ${{matrix.config.target}}",
  },
  {
    name: "Build release",
    if: isNotCross.and(isTag),
    run: "cargo build --locked --all-targets --target ${{matrix.config.target}} --release",
  },
  {
    name: "Build cross (Debug)",
    if: isCross.and(isNotTag),
    run: "cross build --locked --target ${{matrix.config.target}}",
  },
  {
    name: "Build cross (Release)",
    if: isCross.and(isTag),
    run: "cross build --locked --target ${{matrix.config.target}} --release",
  },
  {
    name: "Lint",
    if: isNotTag.and(target.equals("x86_64-unknown-linux-gnu")),
    run: "cargo clippy",
  },
  {
    name: "Lint workflow generation",
    if: isNotTag.and(target.equals("x86_64-unknown-linux-gnu")),
    run: [
      "./.github/workflows/ci.ts --lint",
      "./.github/workflows/release.ts --lint",
    ],
  },
  {
    name: "Test (Debug)",
    if: runTests.equals("true").and(isNotTag),
    run: "cargo test --locked --all-features",
  },
  {
    name: "Test (Release)",
    if: runTests.equals("true").and(isTag),
    run: "cargo test --locked --all-features --release",
  },
  ...preReleaseSteps,
  ...profiles.map((profile) => ({
    name: `Upload artifacts (${profile.target})`,
    if: target.equals(profile.target).and(isTag),
    uses: "actions/upload-artifact@v4",
    with: {
      name: profile.artifactsName,
      path: `target/${profile.target}/release/${profile.zipFileName}`,
    },
  })),
];

function withRunsOnThisRef<T extends { if?: unknown }>(s: T): T {
  if (s.if != null) {
    // deno-lint-ignore no-explicit-any
    return { ...s, if: runsOnThisRef.and(s.if as any) };
  }
  return { ...s, if: runsOnThisRef };
}

const buildJob = job("build", {
  name: target,
  runsOn: os,
  strategy: { matrix },
  outputs: Object.fromEntries(
    profiles.map((profile, i) => [
      profile.zipChecksumEnvVarName,
      expr(`steps.${preReleaseStepIds[i]}.outputs.ZIP_CHECKSUM`),
    ]),
  ),
  env: {
    // disabled to reduce ./target size and generally it's slower enabled
    CARGO_INCREMENTAL: 0,
    RUST_BACKTRACE: "full",
  },
  steps: buildSteps.map(withRunsOnThisRef),
});

const getPrettierVersion = step({
  id: "get_prettier_version",
  name: "Get prettier version",
  run: "echo PRETTIER_VERSION=$(deno run --allow-read scripts/output_prettier_version.ts) >> $GITHUB_OUTPUT",
  outputs: ["PRETTIER_VERSION"],
});

const getTagVersion = step({
  id: "get_tag_version",
  name: "Get tag version",
  run: "echo TAG_VERSION=${GITHUB_REF/refs\\/tags\\//} >> $GITHUB_OUTPUT",
  outputs: ["TAG_VERSION"],
});

const getPluginFileChecksum = step({
  id: "get_plugin_file_checksum",
  name: "Get plugin file checksum",
  run: `echo "CHECKSUM=$(shasum -a 256 plugin.json | awk '{print $1}')" >> $GITHUB_OUTPUT`,
  outputs: ["CHECKSUM"],
});

const draftReleaseJob = job("draft_release", {
  name: "draft_release",
  if: isTag,
  needs: [buildJob],
  runsOn: "ubuntu-latest",
  steps: [
    { name: "Checkout", uses: "actions/checkout@v4" },
    { name: "Download artifacts", uses: "actions/download-artifact@v4" },
    { uses: "denoland/setup-deno@v2" },
    {
      name: "Move downloaded artifacts to root directory",
      run: profiles.map((profile) => `mv ${profile.artifactsName}/${profile.zipFileName} .`),
    },
    {
      name: "Output checksums",
      run: profiles.map((profile) =>
        `echo "${profile.zipFileName}: ${buildJob.outputs[profile.zipChecksumEnvVarName]}"`
      ),
    },
    {
      name: "Create plugin file",
      run: "deno run -A scripts/create_plugin_file.ts",
    },
    getPrettierVersion,
    getTagVersion,
    getPluginFileChecksum,
    {
      name: "Release",
      uses: "softprops/action-gh-release@v2",
      env: { GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}" },
      with: {
        files: [
          ...profiles.map((profile) => profile.zipFileName),
          "plugin.json",
        ].join("\n"),
        body: `Prettier ${getPrettierVersion.outputs.PRETTIER_VERSION}
## Install

Dependencies:

- Install dprint's CLI >= 0.40.0
- Create a config file via \`dprint init\`

Then:

1. Run \`dprint add prettier\`, which will update the config file like so:

   \`\`\`jsonc
   {
     // etc...
     "plugins": [
       // ...add other dprint plugins here that you want to take precedence over prettier...
       "https://plugins.dprint.dev/prettier-${getTagVersion.outputs.TAG_VERSION}.json@${getPluginFileChecksum.outputs.CHECKSUM}"
     ]
   }
   \`\`\`
2. Add a \`"prettier"\` configuration property if desired.

   \`\`\`jsonc
   {
     // ...etc...
     "prettier": {
       "trailingComma": "all",
       "singleQuote": true,
       "proseWrap": "always"
     }
   }
   \`\`\`
`,
        draft: false,
      },
    },
  ],
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
  jobs: [buildJob, draftReleaseJob],
}).writeOrLint({
  filePath: new URL("./ci.generated.yml", import.meta.url),
  header: "# GENERATED BY ./ci.ts -- DO NOT DIRECTLY EDIT",
  pinDeps: true,
});
