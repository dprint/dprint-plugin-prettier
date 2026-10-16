// Builds the plugin into target/plugin.wasm: nts compiles src/main.ts to C#, which NativeAOT-LLVM compiles
// to a Wasm module that is then given a larger shadow stack and made smaller.
//
// Needs nts checked out beside this repository (../nts), Deno, Node.js, the .NET 10 SDK, and the
// WASI SDK and Binaryen, whose folders are given by the WASI_SDK_PATH and BINARYEN environment
// variables (BINARYEN may be left out when wasm-opt is on the path).
import $ from "dax";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const ntsDir = rootDir.parentOrThrow().join("nts");
const targetDir = rootDir.join("target");
const ntsOutDir = targetDir.join("nts");
const wasmDir = rootDir.join("wasm");
const outPath = targetDir.join("plugin.wasm");

if (!ntsDir.join("main.ts").existsSync()) {
  throw new Error(`Expected nts to be checked out at ${ntsDir}.`);
}
if (Deno.env.get("WASI_SDK_PATH") == null) {
  throw new Error("Expected the WASI_SDK_PATH environment variable to give the folder of the WASI SDK.");
}

// the packages that prettier's source imports
if (!rootDir.join("prettier/node_modules").existsSync()) {
  $.logStep("Installing", "prettier's dependencies");
  await $`npm ci --ignore-scripts`.cwd(rootDir.join("prettier"));
}

$.logStep("Compiling", "src/main.ts with nts");
ntsOutDir.mkdirSync({ recursive: true });
await $`deno run -A ${ntsDir.join("main.ts")} ${rootDir.join("src/main.ts")} --no-aot`
  .cwd(ntsOutDir)
  .stderr(ntsOutDir.join("nts.log"));

$.logStep("Compiling", "the Wasm module with NativeAOT-LLVM");
await $`dotnet publish Plugin.csproj -c Release -r wasi-wasm -p:NtsOutDir=${ntsOutDir.join("dist")}`
  .cwd(wasmDir)
  .stdout(targetDir.join("publish.log"));

$.logStep("Optimizing", "the Wasm module");
const publishedPath = wasmDir.join("bin/Release/net10.0/wasi-wasm/publish/dprint-plugin-prettier.wasm");
const patchedPath = targetDir.join("patched.wasm");
await $`node ${wasmDir.join("patch-shadow-stack.mjs")} ${publishedPath} ${patchedPath}`;
const binaryen = Deno.env.get("BINARYEN");
const wasmOptName = Deno.build.os === "windows" ? "wasm-opt.exe" : "wasm-opt";
const wasmOpt = binaryen == null ? wasmOptName : $.path(binaryen).join(wasmOptName).toString();
await $`${wasmOpt} -O2 --enable-bulk-memory --enable-nontrapping-float-to-int --enable-sign-ext --enable-mutable-globals --enable-multivalue --enable-reference-types ${patchedPath} -o ${outPath}`;

$.logStep("Built", outPath.toString());
