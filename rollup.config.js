import commonjs from "@rollup/plugin-commonjs";
import pluginJson from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.mjs",
    format: "esm",
  },
  plugins: [
    pluginJson(),
    typescript({
      tsconfig: "tsconfig.json",
    }),
  ],
};
