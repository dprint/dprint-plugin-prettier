import commonjs from "@rollup/plugin-commonjs";
import pluginJson from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.mjs",
    format: "esm",
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    pluginJson(),
    typescript({
      tsconfig: "tsconfig.json",
    }),
  ],
};
