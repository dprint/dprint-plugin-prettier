import packageJson from "../package.json" assert { type: "json" };

Deno.writeTextFileSync(
  new URL("../src/version.ts", import.meta.url),
  `export const VERSION = "${packageJson.version}";\n`,
);
