import * as yaml from "https://deno.land/std@0.170.0/encoding/yaml.ts";
import $ from "https://deno.land/x/dax@0.35.0/mod.ts";

enum OperatingSystem {
  Mac = "macOS-latest",
  Windows = "windows-latest",
  //  uses an older version of ubuntu because of issue dprint/#483
  Linux = "ubuntu-20.04",
}

interface ProfileData {
  os: OperatingSystem;
  target: string;
  runTests?: boolean;
  cross?: boolean;
}

const profileDataItems: ProfileData[] = [{
  os: OperatingSystem.Mac,
  target: "x86_64-apple-darwin",
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
  os: OperatingSystem.Linux,
  target: "aarch64-unknown-linux-gnu",
  runTests: false,
  cross: true,
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
            os: profile.os,
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
        { uses: "actions/checkout@v2" },
        { uses: "dsherret/rust-toolchain-file@v1" },
        {
          name: "Cache cargo",
          uses: "Swatinem/rust-cache@v2",
          with: {
            "prefix-key": "v3-rust",
            "save-if": "${{ github.ref == 'refs/heads/main' }}",
          },
        },
        { uses: "denoland/setup-deno@v1" },
        {
          uses: "actions/setup-node@v3",
          with: {
            "node-version": 18,
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
            "deno task build",
            "cargo install cross --git https://github.com/cross-rs/cross --rev 44011c8854cb2eaac83b173cc323220ccdff18ea",
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
            switch (profile.os) {
              case OperatingSystem.Mac:
                return [
                  `cd target/${profile.target}/release`,
                  `zip -r ${profile.zipFileName} dprint-plugin-prettier`,
                  `echo \"::set-output name=ZIP_CHECKSUM::$(shasum -a 256 ${profile.zipFileName} | awk '{print $1}')\"`,
                ];
              case OperatingSystem.Linux:
                return [
                  `cd target/${profile.target}/release`,
                  `zip -r ${profile.zipFileName} dprint-plugin-prettier`,
                  `echo \"::set-output name=ZIP_CHECKSUM::$(shasum -a 256 ${profile.zipFileName} | awk '{print $1}')\"`,
                ];
              case OperatingSystem.Windows:
                return [
                  `Compress-Archive -CompressionLevel Optimal -Force -Path target/${profile.target}/release/dprint-plugin-prettier.exe -DestinationPath target/${profile.target}/release/${profile.zipFileName}`,
                  `echo "::set-output name=ZIP_CHECKSUM::$(shasum -a 256 target/${profile.target}/release/${profile.zipFileName} | awk '{print $1}')"`,
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
            uses: "actions/upload-artifact@v2",
            with: {
              name: profile.artifactsName,
              path: `target/${profile.target}/release/${profile.zipFileName}`,
            },
          };
        }),
      ],
    },
    draft_release: {
      name: "draft_release",
      if: "startsWith(github.ref, 'refs/tags/')",
      needs: "build",
      "runs-on": "ubuntu-latest",
      steps: [
        { name: "Checkout", uses: "actions/checkout@v2" },
        { name: "Download artifacts", uses: "actions/download-artifact@v2" },
        { uses: "denoland/setup-deno@v1" },
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
          name: "Get tag version",
          id: "get_tag_version",
          run: "echo ::set-output name=TAG_VERSION::${GITHUB_REF/refs\\/tags\\//}",
        },
        {
          name: "Get plugin file checksum",
          id: "get_plugin_file_checksum",
          run: "echo \"::set-output name=CHECKSUM::$(shasum -a 256 plugin.json | awk '{print $1}')\"",
        },
        // todo: implement this
        // {
        //   name: "Update Config Schema Version",
        //   run:
        //     "sed -i 's/prettier\\/0.0.0/prettier\\/${{ steps.get_tag_version.outputs.TAG_VERSION }}/' deployment/schema.json",
        // },
        {
          name: "Release",
          uses: "softprops/action-gh-release@v1",
          env: { GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}" },
          with: {
            files: [
              ...profiles.map((profile) => profile.zipFileName),
              "plugin.json",
              // todo: add this
              // "deployment/schema.json",
            ].join("\n"),
            body: `## Install

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
  noRefs: true,
  lineWidth: 10_000,
  noCompatMode: true,
});

Deno.writeTextFileSync(new URL("./ci.yml", import.meta.url), finalText);
await $`dprint fmt`;
