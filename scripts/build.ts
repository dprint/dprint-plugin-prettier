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
// the C# is only compiled by the Wasm project, which also has what it calls of the plugin (wasm/FlowParser.cs)
await $`deno run -A ${ntsDir.join("main.ts")} ${rootDir.join("src/main.ts")} --no-aot --no-build`
  .cwd(ntsOutDir)
  .stderr(ntsOutDir.join("nts.log"));

$.logStep("Compiling", "Flow's parser");
const flowLibPath = await buildFlowParser();

$.logStep("Compiling", "the collector's memory functions");
const gcEnvPath = await buildGcEnv();

$.logStep("Compiling", "the Wasm module with NativeAOT-LLVM");
await $`dotnet publish Plugin.csproj -c Release -r wasi-wasm -p:NtsOutDir=${ntsOutDir.join("dist")} -p:FlowParserLib=${flowLibPath} -p:GcEnvObject=${gcEnvPath}`
  .cwd(wasmDir)
  .stdout(targetDir.join("publish.log"));

$.logStep("Optimizing", "the Wasm module");
const publishedPath = wasmDir.join("bin/Release/net10.0/wasi-wasm/publish/dprint-plugin-prettier.wasm");
const patchedPath = targetDir.join("patched.wasm");
await $`node ${wasmDir.join("patch-shadow-stack.mjs")} ${publishedPath} ${patchedPath}`;
const orderedPath = targetDir.join("ordered.wasm");
await $`node ${wasmDir.join("order-functions.mjs")} ${patchedPath} ${targetDir.join("link.map")} ${wasmDir.join("hot-functions.txt")} ${orderedPath}`;
const binaryen = Deno.env.get("BINARYEN");
const wasmOptName = Deno.build.os === "windows" ? "wasm-opt.exe" : "wasm-opt";
const wasmOpt = binaryen == null ? wasmOptName : $.path(binaryen).join(wasmOptName).toString();
// -O3 inlines more than -O2, which is 1-2% faster. The compiler emits the legacy form of Wasm's exceptions, which
// wasmtime only runs in the standard form that binaryen translates it to. Sorting the functions by the names that
// order-functions.mjs gave them puts the ones that run most first
await $`${wasmOpt} -O3 --enable-bulk-memory --enable-nontrapping-float-to-int --enable-sign-ext --enable-mutable-globals --enable-multivalue --enable-reference-types --enable-exception-handling --translate-to-exnref --reorder-functions-by-name ${orderedPath} -o ${outPath}`;

$.logStep("Built", outPath.toString());

/**
 * Compiles Flow's parser, the Wasm module of the flow-parser package, into a library for WASI: wasm2c makes C of
 * the module, which the WASI SDK compiles along with what runs it (wasm/flow). Gives the path of the library.
 */
async function buildFlowParser() {
  const flowDir = targetDir.join("flow");
  flowDir.mkdirSync({ recursive: true });
  const wasmPath = flowDir.join("flow_parser.wasm");
  await $`node ${wasmDir.join("flow/extract-wasm.mjs")} ${rootDir.join("prettier/node_modules/flow-parser/dist/FlowParserWASM.js")} ${wasmPath}`;
  const wabt = Deno.env.get("WABT");
  if (wabt == null) {
    throw new Error("Expected the WABT environment variable to give the folder of WABT, for wasm2c.");
  }
  const exe = Deno.build.os === "windows" ? ".exe" : "";
  await $`${$.path(wabt).join(`bin/wasm2c${exe}`)} ${wasmPath} -n flow -o ${flowDir.join("flow_parser.c")}`;
  const wasiSdk = $.path(Deno.env.get("WASI_SDK_PATH")!);
  const flags = [
    "--target=wasm32-wasip1",
    `--sysroot=${wasiSdk.join("share/wasi-sysroot")}`,
    "-O2",
    `-I${wasmDir.join("flow/include")}`,
    `-I${flowDir}`,
    `-I${$.path(wabt).join("include")}`,
    // the memory is allocated with malloc and checked on each access, since WASI has no guard pages
    "-DWASM_RT_USE_MMAP=0",
    "-DWASM_RT_MEMCHECK_BOUNDS_CHECK=1",
    // running out of stack is a trap of the engine, as it is for the rest of the plugin
    "-DWASM_RT_NONCONFORMING_UNCHECKED_STACK_EXHAUSTION=1",
  ];
  const clang = wasiSdk.join(`bin/clang${exe}`);
  await $`${clang} ${flags} -c ${flowDir.join("flow_parser.c")} -o ${flowDir.join("flow_parser.o")}`;
  await $`${clang} ${flags} -c ${wasmDir.join("flow/flow_parser_glue.c")} -o ${flowDir.join("flow_parser_glue.o")}`;
  const libPath = flowDir.join("libflowparser.a");
  if (libPath.existsSync()) libPath.removeSync();
  await $`${wasiSdk.join(`bin/llvm-ar${exe}`)} rcs ${libPath} ${flowDir.join("flow_parser.o")} ${flowDir.join("flow_parser_glue.o")}`;
  return libPath;
}

/** Compiles the memory functions of the collector (wasm/gc) for WASI. Gives the path of the object. */
async function buildGcEnv() {
  const gcDir = targetDir.join("gc");
  gcDir.mkdirSync({ recursive: true });
  const wasiSdk = $.path(Deno.env.get("WASI_SDK_PATH")!);
  const exe = Deno.build.os === "windows" ? ".exe" : "";
  const objectPath = gcDir.join("gcenv.wasm.o");
  await $`${wasiSdk.join(`bin/clang++${exe}`)} --target=wasm32-wasip1 --sysroot=${wasiSdk.join("share/wasi-sysroot")} -O2 -mbulk-memory -fno-exceptions -fno-rtti -c ${wasmDir.join("gc/gcenv.wasm.cpp")} -o ${objectPath}`;
  return objectPath;
}
