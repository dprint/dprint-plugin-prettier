# @dprint/prettier

npm distribution of [dprint-plugin-prettier](https://github.com/dprint/dprint-plugin-prettier), which formats code with [Prettier](https://prettier.io) compiled ahead of time to a Wasm module.

## Use with the dprint CLI

Run `dprint add prettier` or add the package to the `"plugins"` array of a dprint configuration file:

```jsonc
{
  // ...etc...
  "plugins": [
    "npm:@dprint/prettier@<version>"
  ]
}
```

## Use with @dprint/formatter

Requires [@dprint/formatter](https://github.com/dprint/js-formatter) 0.6.0 or later.

```ts
import { createFromBuffer } from "@dprint/formatter";
import { getPath } from "@dprint/prettier";
import * as fs from "fs";

const buffer = fs.readFileSync(getPath());
const formatter = createFromBuffer(buffer);

console.log(formatter.formatText({
  filePath: "file.ts",
  fileText: "const   a=1",
}));
```
