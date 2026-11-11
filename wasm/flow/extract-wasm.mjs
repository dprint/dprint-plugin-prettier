// writes out the Wasm module of Flow's parser, which the flow-parser package has in its JavaScript as base64:
//   node extract-wasm.mjs <FlowParserWASM.js> <out.wasm>
import fs from "node:fs";

const [scriptPath, outPath] = process.argv.slice(2);
const script = fs.readFileSync(scriptPath, "utf8");
const match = /wasmBinaryFile="data:application\/octet-stream;base64,([A-Za-z0-9+/=]+)"/.exec(script);
if (match == null) {
  throw new Error("The Wasm module of Flow's parser was not found in " + scriptPath);
}
// the module's imports and exports have minified names, which flow_parser_glue.c is written for
const expected = [
  "wasmImports={b:_emscripten_memcpy_big,c:_emscripten_resize_heap,a:_getentropy}",
  'addOnInit(wasmExports["e"])',
  ...["f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q"].map((name, i) =>
    `Module["_${
      [
        "hermesParse",
        "hermesParseResult_free",
        "hermesParseResult_getError",
        "hermesParseResult_getErrorColumn",
        "hermesParseResult_getErrorLine",
        "hermesParseResult_getPositionBuffer",
        "hermesParseResult_getPositionBufferSize",
        "hermesParseResult_getProgramBuffer",
        "hermesParseResult_getStringBuffer",
        "main",
        "malloc",
        "free",
      ][i]
    }"]=asm["${name}"]`
  ),
];
for (const text of expected) {
  if (!script.includes(text)) {
    throw new Error(`The names of the parser's imports and exports changed (${text}), so flow_parser_glue.c needs updating.`);
  }
}
fs.writeFileSync(outPath, Buffer.from(match[1], "base64"));
