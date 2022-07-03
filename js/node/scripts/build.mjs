import { build } from "esbuild";
import alias from "esbuild-plugin-alias";
import { resolve } from "path";

build({
  entryPoints: ["./src/main.ts"],
  inject: ["./shims/node-shim.js"],
  outfile: "../startup.js",
  bundle: true,
  minify: true,
  target: "chrome58",
  plugins: [
    alias({
      "prettier-plugin-jsdoc": resolve(
        "./node_modules/prettier-plugin-jsdoc/dist/index.min.mjs",
      ),
      "comment-parser": resolve("./node_modules/comment-parser/src/index.ts"),
    }),
  ],
});
