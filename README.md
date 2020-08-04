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
