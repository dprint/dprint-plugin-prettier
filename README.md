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

## Included Prettier Plugins

- [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte)
- [prettier-plugin-astro](https://github.com/withastro/prettier-plugin-astro)
- Want more? Open an issue.

## Why Does This Exist?

The main reason this exists is to be able to use Prettier with dprint's CLI. So you can format with all the plugins that dprint supports and still use Prettier and only have to run `dprint fmt`.

An additional benefit is that dprint's CLI will format files in parallel with Prettier
