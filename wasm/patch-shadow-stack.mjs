// gives a module that NativeAOT-LLVM linked a 64 MB shadow stack in place of the 1 MB one that its
// runtime allocates for a thread without checking that code stays within it:
//   node patch-shadow-stack.mjs <in.wasm> <out.wasm>
import fs from "node:fs";
const bytes = fs.readFileSync(process.argv[2]);
// what stores the field before, then the 1 MB that is asked for, then the start of the next constant
const before = Buffer.from([0x36, 0x02, 0x68, 0x20, 0x00, 0x41, 0x80, 0x80, 0xc0, 0x00, 0x41]);
const first = bytes.indexOf(before);
if (first < 0 || bytes.indexOf(before, first + 1) >= 0) {
  throw new Error("The place that allocates the shadow stack was not found once.");
}
// 64 MB as a constant of the same length
Buffer.from([0x41, 0x80, 0x80, 0x80, 0x20]).copy(bytes, first + 5);
fs.writeFileSync(process.argv[3], bytes);
console.log("patched at", first + 5);
