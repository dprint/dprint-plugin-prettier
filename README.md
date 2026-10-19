# dprint-plugin-prettier

[![npm version](https://img.shields.io/npm/v/@dprint/prettier.svg)](https://www.npmjs.com/package/@dprint/prettier) [![CI](https://github.com/dprint/dprint-plugin-prettier/workflows/CI/badge.svg)](https://github.com/dprint/dprint-plugin-prettier/actions?query=workflow%3ACI)

[Prettier](https://prettier.io/) as a dprint Wasm plugin.

Prettier's JavaScript source is compiled ahead of time with [nts](https://github.com/dsherret/nts) to C#, which [NativeAOT-LLVM](https://github.com/dotnet/runtimelab/tree/feature/NativeAOT-LLVM) compiles to a Wasm module. The output is the same as Prettier's on Node.js, without a JavaScript engine, and dprint runs it in a sandbox like any other Wasm plugin.

The plugin has Prettier 3.9.10, with the versions of the packages that Prettier 3.9.10 is released with.

## Install

1. Install [dprint](https://dprint.dev/install/)
2. Run `dprint init` to create the config file.
3. Run `dprint add prettier` to add this plugin.

## Configuration

See Prettier's configuration [here](https://prettier.io/docs/en/options.html). Specify using the "API Override" column.

```jsonc
{
  // ...etc...
  "prettier": {
    "trailingComma": "all",
    "singleQuote": true,
    "proseWrap": "always",
  },
}
```

### File extension specific configuration

Add the file extension to the start of the configuration option. For example:

```jsonc
{
  // ...etc...
  "prettier": {
    "singleQuote": true,
    // use double quotes in js files
    "js.singleQuote": false,
    // use double quotes in ts files
    "ts.singleQuote": false,
  },
}
```

## Prettier plugins

The plugin has the languages that Prettier has built in. Prettier plugins, such as prettier-plugin-svelte and prettier-plugin-jsdoc, are not included and will be added as separate dprint plugins.

## Development

The source is in these folders:

- `prettier` - Prettier 3.9.10's source with type annotations in JSDoc comments that make the compiled code fast. They are comments only, so the code is Prettier's as it is. `package.json` lists the packages that the source imports, at the versions that Prettier 3.9.10 has.
- `src` - the entry point that dprint calls (`main.ts`) and the plugins of Prettier that it uses (`plugins.ts`), with the libraries that are compiled along with Prettier (`vendor`, `shims`), what Prettier's `*.evaluate.js` files give (`generated`, made by `node scripts/generate.mjs`) and Prettier's TypeScript parser as npm has it (`prettier-plugins`).
- `wasm` - the C# project that compiles what nts makes of `src/main.ts` to the Wasm module, with the functions that dprint calls. Flow's parser is a Wasm module in the flow-parser package, which [wasm2c](https://github.com/WebAssembly/wabt) makes C of to compile into the plugin (`wasm/flow`).

To build, check out [nts](https://github.com/dsherret/nts) beside this repository (`../nts`), and install Deno, Node.js, the .NET 10 SDK, the [WASI SDK](https://github.com/WebAssembly/wasi-sdk), [Binaryen](https://github.com/WebAssembly/binaryen) and [WABT](https://github.com/WebAssembly/wabt). Then:

```sh
deno task setup
WASI_SDK_PATH=<wasi-sdk folder> BINARYEN=<binaryen folder>/bin WABT=<wabt folder> deno task build
deno task test
```

This creates `target/plugin.wasm`. `deno task test:prettier` checks it against Prettier's own format tests, and [docs/upgrading.md](docs/upgrading.md) says how to upgrade Prettier.

To check that the plugin formats like Prettier from npm, `deno task test:repos` clones codebases into `target/repos` and formats their files with both. It takes a while, so it is not part of `deno task test`. Set `REPOS` to a comma separated list of the names in `tests/repos_test.ts` to only test those, and see `target/repos/diffs` for the files that differ.
