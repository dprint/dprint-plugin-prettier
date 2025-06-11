import * as yaml from "@std/yaml";
import $ from "dax";

enum Runner {
  Mac13 = "macos-13",
  MacLatest = "macos-latest",
  Windows = "windows-latest",
  // uses an older version of ubuntu because of issue dprint/#483
  Linux = "ubuntu-22.04",
  LinuxArm =
    "${{ (github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/')) && 'buildjet-2vcpu-ubuntu-2204-arm' || 'ubuntu-latest' }}",
}

interface ProfileData {
  runner: Runner;
  target: string;
  runTests?: boolean;
  // currently not used
  cross?: boolean;
}

function withCondition(
  step: Record<string, unknown>,
  condition: string,
): Record<string, unknown> {
  return {
    ...step,
    if: "if" in step ? `(${condition}) && (${step.if})` : condition,
  };
}

const profileDataItems: ProfileData[] = [{
  runner: Runner.Mac13,
  target: "x86_64-apple-darwin",
  runTests: true,
}, {
  runner: Runner.MacLatest,
  target: "aarch64-apple-darwin",
  runTests: true,
}, {
  runner: Runner.Windows,
  target: "x86_64-pc-windows-msvc",
  runTests: true,
}, {
  runner: Runner.Linux,
  target: "x86_64-unknown-linux-gnu",
  runTests: true,
}, {
  runner: Runner.LinuxArm,
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

const ci = {
  name: "CI",
  on: {
    pull_request: { branches: ["main"] },
    push: { branches: ["main"], tags: ["*"] },
  },
  concurrency: {
    // https://stackoverflow.com/a/72408109/188246
    group: "${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}",
    "cancel-in-progress": true,
  },
  jobs: {
    build: {
      name: "${{ matrix.config.target }}",
      "runs-on": "${{ matrix.config.os }}",
      strategy: {
        matrix: {
          config: profiles.map((profile) => ({
            os: profile.runner,
            run_tests: (profile.runTests ?? false).toString(),
            cross: (profile.cross ?? false).toString(),
            target: profile.target,
          })),
        },
      },
      outputs: Object.fromEntries(
        profiles.map((profile) => [
          profile.zipChecksumEnvVarName,
          "${{steps.pre_release_" + profile.target.replaceAll("-", "_")
          + ".outputs.ZIP_CHECKSUM}}",
        ]),
      ),
      env: {
        // disabled to reduce ./target size and generally it's slower enabled
        CARGO_INCREMENTAL: 0,
        RUST_BACKTRACE: "full",
      },
      steps: [
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
          if: `matrix.config.target == 'aarch64-apple-darwin'`,
          run: "rustup target add aarch64-apple-darwin",
        },
        { uses: "denoland/setup-deno@v2" },
        {
          uses: "actions/setup-node@v4",
          with: {
            "node-version": 21,
          },
        },
        {
          name: "npm install",
          run: "cd js/node && npm ci",
        },
        {
          name: "Setup cross",
          if: "matrix.config.cross == 'true'",
          run: [
            "cd js/node && npm run build:script",
            "cargo install cross --locked --git https://github.com/cross-rs/cross --rev 4090beca3cfffa44371a5bba524de3a578aa46c3",
          ].join("\n"),
        },
        {
          name: "Build (Debug)",
          if: "matrix.config.cross != 'true' && !startsWith(github.ref, 'refs/tags/')",
          run: "cargo build --locked --all-targets --target ${{matrix.config.target}}",
        },
        {
          name: "Build release",
          if: "matrix.config.cross != 'true' && startsWith(github.ref, 'refs/tags/')",
          run: "cargo build --locked --all-targets --target ${{matrix.config.target}} --release",
        },
        {
          name: "Build cross (Debug)",
          if: "matrix.config.cross == 'true' && !startsWith(github.ref, 'refs/tags/')",
          run: [
            "cross build --locked --target ${{matrix.config.target}}",
          ].join("\n"),
        },
        {
          name: "Build cross (Release)",
          if: "matrix.config.cross == 'true' && startsWith(github.ref, 'refs/tags/')",
          run: [
            "cross build --locked --target ${{matrix.config.target}} --release",
          ].join("\n"),
        },
        {
          name: "Lint",
          if: "!startsWith(github.ref, 'refs/tags/') && matrix.config.target == 'x86_64-unknown-linux-gnu'",
          run: "cargo clippy",
        },
        {
          name: "Test (Debug)",
          if: "matrix.config.run_tests == 'true' && !startsWith(github.ref, 'refs/tags/')",
          run: "cargo test --locked --all-features",
        },
        {
          name: "Test (Release)",
          if: "matrix.config.run_tests == 'true' && startsWith(github.ref, 'refs/tags/')",
          run: "cargo test --locked --all-features --release",
        },
        // zip files
        ...profiles.map((profile) => {
          function getRunSteps() {
            switch (profile.runner) {
              case Runner.Mac13:
              case Runner.MacLatest:
                return [
                  `cd target/${profile.target}/release`,
                  `zip -r ${profile.zipFileName} dprint-plugin-prettier`,
                  `echo \"ZIP_CHECKSUM=$(shasum -a 256 ${profile.zipFileName} | awk '{print $1}')\" >> $GITHUB_OUTPUT`,
                ];
              case Runner.Linux:
              case Runner.LinuxArm:
                return [
                  `cd target/${profile.target}/release`,
                  `zip -r ${profile.zipFileName} dprint-plugin-prettier`,
                  `echo \"ZIP_CHECKSUM=$(shasum -a 256 ${profile.zipFileName} | awk '{print $1}')\" >> $GITHUB_OUTPUT`,
                ];
              case Runner.Windows:
                return [
                  `Compress-Archive -CompressionLevel Optimal -Force -Path target/${profile.target}/release/dprint-plugin-prettier.exe -DestinationPath target/${profile.target}/release/${profile.zipFileName}`,
                  `echo "ZIP_CHECKSUM=$(shasum -a 256 target/${profile.target}/release/${profile.zipFileName} | awk '{print $1}')" >> $GITHUB_OUTPUT`,
                ];
            }
          }
          return {
            name: `Pre-release (${profile.target})`,
            id: `pre_release_${profile.target.replaceAll("-", "_")}`,
            if: `matrix.config.target == '${profile.target}' && startsWith(github.ref, 'refs/tags/')`,
            run: getRunSteps().join("\n"),
          };
        }),
        // upload artifacts
        ...profiles.map((profile) => {
          return {
            name: `Upload artifacts (${profile.target})`,
            if: `matrix.config.target == '${profile.target}' && startsWith(github.ref, 'refs/tags/')`,
            uses: "actions/upload-artifact@v4",
            with: {
              name: profile.artifactsName,
              path: `target/${profile.target}/release/${profile.zipFileName}`,
            },
          };
        }),
      ].map((step) =>
        withCondition(
          step,
          // only run arm64 linux on main or tags
          "matrix.config.target != 'aarch64-unknown-linux-gnu' || github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/')",
        )
      ),
    },
    draft_release: {
      name: "draft_release",
      if: "startsWith(github.ref, 'refs/tags/')",
      needs: "build",
      "runs-on": "ubuntu-latest",
      steps: [
        { name: "Checkout", uses: "actions/checkout@v4" },
        { name: "Download artifacts", uses: "actions/download-artifact@v4" },
        { uses: "denoland/setup-deno@v2" },
        {
          name: "Move downloaded artifacts to root directory",
          run: profiles.map((profile) => {
            return `mv ${profile.artifactsName}/${profile.zipFileName} .`;
          }).join("\n"),
        },
        {
          name: "Output checksums",
          run: profiles.map((profile) => {
            return `echo "${profile.zipFileName}: \${{needs.build.outputs.${profile.zipChecksumEnvVarName}}}"`;
          }).join("\n"),
        },
        {
          name: "Create plugin file",
          run: "deno run -A scripts/create_plugin_file.ts",
        },
        {
          name: "Get prettier version",
          id: "get_prettier_version",
          run: "echo PRETTIER_VERSION=$(deno run --allow-read scripts/output_prettier_version.ts) >> $GITHUB_OUTPUT",
        },
        {
          name: "Get tag version",
          id: "get_tag_version",
          run: "echo TAG_VERSION=${GITHUB_REF/refs\\/tags\\//} >> $GITHUB_OUTPUT",
        },
        {
          name: "Get plugin file checksum",
          id: "get_plugin_file_checksum",
          run: "echo \"CHECKSUM=$(shasum -a 256 plugin.json | awk '{print $1}')\" >> $GITHUB_OUTPUT",
        },
        // todo: implement this
        // {
        //   name: "Update Config Schema Version",
        //   run:
        //     "sed -i 's/prettier\\/0.0.0/prettier\\/${{ steps.get_tag_version.outputs.TAG_VERSION }}/' deployment/schema.json",
        // },
        {
          name: "Release",
          uses: "softprops/action-gh-release@v2",
          env: { GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}" },
          with: {
            files: [
              ...profiles.map((profile) => profile.zipFileName),
              "plugin.json",
              // todo: add this
              // "deployment/schema.json",
            ].join("\n"),
            body: `Prettier \${{ steps.get_prettier_version.outputs.PRETTIER_VERSION }}
## Install

Dependencies:

- Install dprint's CLI >= 0.40.0

In a dprint configuration file:

1. Specify the plugin url and checksum in the \`"plugins"\` array or run \`dprint config add prettier\`:

   \`\`\`jsonc
   {
     // etc...
     "plugins": [
       // ...add other dprint plugins here that you want to take precedence over prettier...
       "https://plugins.dprint.dev/prettier-\${{ steps.get_tag_version.outputs.TAG_VERSION }}.json@\${{ steps.get_plugin_file_checksum.outputs.CHECKSUM }}"
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
    },
  },
};

let finalText = `# GENERATED BY ./ci.generate.ts -- DO NOT DIRECTLY EDIT\n\n`;
finalText += yaml.stringify(ci, {
  lineWidth: 10_000,
  compatMode: false,
});

Deno.writeTextFileSync(new URL("./ci.yml", import.meta.url), finalText);
await $`dprint fmt`;
