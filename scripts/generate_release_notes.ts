#!/usr/bin/env -S deno run -A
const prettierVersion = Deno.args[0];

const text = `Prettier ${prettierVersion}
## Install

Dependencies:

- Install dprint's CLI >= 0.40.0
- Create a config file via \`dprint init\`

Then:

1. Run \`dprint add prettier\`, which will add the plugin to your dprint configuration file.
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
`;

console.log(text);
