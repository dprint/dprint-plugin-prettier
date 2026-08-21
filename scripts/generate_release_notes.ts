#!/usr/bin/env -S deno run -A
const prettierVersion = Deno.args[0];
const tagVersion = Deno.args[1];
const pluginChecksum = Deno.args[2];

// optional npm install block; only emitted if create_npm_packages.ts has
// run and produced a manifest with the main package's tarball checksum.
let npmBlock = "";
try {
  const manifest = JSON.parse(await Deno.readTextFile("npm-dist/publish-manifest.json")) as {
    mainPackageName: string;
    mainPackageChecksum: string;
  };
  npmBlock = `
   Alternatively, run \`dprint add npm:${manifest.mainPackageName}\`, which will update the config file as follows:
   \`\`\`jsonc
   {
     // etc...
     "plugins": [
       // ...add other dprint plugins here that you want to take precedence over prettier...
       "npm:${manifest.mainPackageName}@${tagVersion}/plugin.json@${manifest.mainPackageChecksum}"
     ]
   }
   \`\`\`
`;
} catch (err) {
  if (!(err instanceof Deno.errors.NotFound)) throw err;
}

const text = `Prettier ${prettierVersion}
## Install

Dependencies:

- Install dprint's CLI >= 0.40.0
- Create a config file via \`dprint init\`

Then:

1. Run \`dprint add prettier\`, which will update the config file like so:

   \`\`\`jsonc
   {
     // etc...
     "plugins": [
       // ...add other dprint plugins here that you want to take precedence over prettier...
       "https://plugins.dprint.dev/prettier-${tagVersion}.json@${pluginChecksum}"
     ]
   }
   \`\`\`
${npmBlock}2. Add a \`"prettier"\` configuration property if desired.

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
