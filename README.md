# dprint-plugin-prettier

[![CI](https://github.com/dprint/dprint-plugin-prettier/workflows/CI/badge.svg)](https://github.com/dprint/dprint-plugin-prettier/actions?query=workflow%3ACI)

Wrapper around [prettier](https://prettier.io/) in order to use it as a dprint plugin.

## Install

1. Install [dprint](https://dprint.dev/install/)
2. Follow instructions at https://github.com/dprint/dprint-plugin-prettier/releases/

## Configuration

See Prettier's configuration [here](https://prettier.io/docs/en/options.html). Specify using the "API Override" column.

```jsonc
{
  // ...etc...
  "prettier": {
    "trailingComma": "all",
    "singleQuote": true,
    "proseWrap": "always",
    // enable prettier-plugin-jsdoc
    "plugin.jsDoc": true
  }
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
    "ts.singleQuote": false
  }
}
```

## Included Prettier Plugins

- [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte)
  - Enabled by default.
- [prettier-plugin-astro](https://github.com/withastro/prettier-plugin-astro)
  - Enabled by default.
- [prettier-plugin-jsdoc](https://github.com/hosseinmd/prettier-plugin-jsdoc)
  - Enable with `"plugin.jsDoc": true` configuration
- Want more? Open an issue.

## Why Does This Exist?

The main reason this exists is to be able to use Prettier with dprint's CLI. That way, you can format with all the plugins that dprint supports, still use Prettier, and only have to run `dprint fmt`.

Additionally it's much faster. This plugin will format files in parallel and you can take advantage of the speed of dprint's incremental formatting if enabled.

## Development

To experiment with adding a new plugin, you'll need to build the `dprint-plugin-prettier` plugin locally.

Requirements:
1. [deno](https://deno.land/) installed on your path.
1. Inside `js/node`, run `npm install` or `yarn install`.

To build, run `cargo build` from the root directory (that's here!).