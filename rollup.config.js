import pluginJson from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

export default {
  input: ["src/main.ts", "src/worker.ts"],
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].mjs",
  },
  plugins: [
    pluginJson(),
    typescript({
      tsconfig: "tsconfig.json",
    }),
  ],
};
