# dprint-plugin-prettier

[![npm version](https://img.shields.io/npm/v/@dprint/prettier.svg)](https://www.npmjs.com/package/@dprint/prettier) [![CI](https://github.com/dprint/dprint-plugin-prettier/workflows/CI/badge.svg)](https://github.com/dprint/dprint-plugin-prettier/actions?query=workflow%3ACI)

[Prettier](https://prettier.io/) as a dprint Wasm plugin.

Prettier's JavaScript source is compiled ahead of time with nts to C#, which [NativeAOT-LLVM](https://github.com/dotnet/runtimelab/tree/feature/NativeAOT-LLVM) compiles to a Wasm module. The output is the same as Prettier's on Node.js, without a JavaScript engine, and dprint runs it in a sandbox like any other Wasm plugin.

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

Besides the languages that Prettier has built in, the plugin includes these Prettier plugins, at the versions in `plugins/package.json`:

- [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte), which formats `.svelte` files.
- [prettier-plugin-jsdoc](https://github.com/hosseinmd/prettier-plugin-jsdoc), which formats JSDoc comments when it is turned on with `"plugin.jsDoc": true`. Its options, such as `jsdocSpaces`, are given like Prettier's.

## Development

The source is in these folders:

- `prettier` - Prettier 3.9.10's source with type annotations in JSDoc comments that make the compiled code fast. They are comments only, so the code is Prettier's as it is. `package.json` lists the packages that the source imports, at the versions that Prettier 3.9.10 has.
- `plugins` - the Prettier plugins that the plugin includes, with the packages that they import (`package.json`), which are compiled from `node_modules`.
- `nts` - a bundle of nts, which compiles TypeScript and JavaScript to C#, with the declarations that `src` is checked with (`lib.d.ts`). `deno task build` bundles it again first when nts is checked out beside this repository (`../nts`), and `COMMIT` says what it was bundled from.
- `src` - the entry point that dprint calls (`main.ts`), Prettier's own plugins (`builtin-plugins.ts`) and those that it formats with (`plugins.ts`), with the libraries that are compiled along with Prettier (`vendor`, `shims`), what Prettier's `*.evaluate.js` files give (`generated`, made by `node scripts/generate.mjs`) and Prettier's TypeScript parser as npm has it (`prettier-plugins`).
- `wasm` - the C# project that compiles what nts makes of `src/main.ts` to the Wasm module, with the functions that dprint calls. Flow's parser is a Wasm module in the flow-parser package, which [wasm2c](https://github.com/WebAssembly/wabt) makes C of to compile into the plugin (`wasm/flow`).

To build, install Deno, Node.js, the .NET 10 SDK, the [WASI SDK](https://github.com/WebAssembly/wasi-sdk), [Binaryen](https://github.com/WebAssembly/binaryen) and [WABT](https://github.com/WebAssembly/wabt). Then:

```sh
deno task setup
WASI_SDK_PATH=<wasi-sdk folder> BINARYEN=<binaryen folder>/bin WABT=<wabt folder> deno task build
deno task test
```

This creates `target/plugin.wasm`. `deno task test:prettier` checks it against Prettier's own format tests, and `deno task test:plugins` (after that) against the tests of the Prettier plugins and Prettier's tests of JavaScript with prettier-plugin-jsdoc. [docs/upgrading.md](docs/upgrading.md) says how to upgrade Prettier.

To check that the plugin formats like Prettier from npm, `deno task test:repos` clones codebases into `target/repos` and formats their files with both. It takes a while, so it is not part of `deno task test`. Set `REPOS` to a comma separated list of the names in `tests/repos_test.ts` to only test those, and see `target/repos/diffs` for the files that differ.
