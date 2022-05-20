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
    "proseWrap": "always"
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
- [prettier-plugin-astro](https://github.com/withastro/prettier-plugin-astro)
- Want more? Open an issue.

## Making the plugins work

If for example you want to use [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte) plugin. In your config, change `"includes:"` field to include svelte file names too. For example for the case with svelte it will be:

`"includes": ["**/*.{ts,tsx,js,jsx,cjs,mjs,json,md,toml,svelte}"],`

Notice the `svelte` added. dprint will only run prettier on files that are not covered by `dprint` itself.

## Why Does This Exist?

The main reason this exists is to be able to use Prettier with dprint's CLI. That way, you can format with all the plugins that dprint supports, still use Prettier, and only have to run `dprint fmt`.

Additionally it's much faster. This plugin will format files in parallel and you can take advantage of the speed of dprint's incremental formatting if enabled.
