// @ts-check
const assert = require("assert");
const createFromBuffer = require("@dprint/formatter").createFromBuffer;
const getPath = require("./index").getPath;

const buffer = require("fs").readFileSync(getPath());
const formatter = createFromBuffer(buffer);

assert.strictEqual(
  formatter.formatText({
    filePath: "file.ts",
    fileText: "function test  ( t  : any ) { console .log ( t  )}",
  }),
  "function test(t: any) {\n  console.log(t);\n}\n",
);
assert.strictEqual(
  formatter.formatText({
    filePath: "file.css",
    fileText: ".selector {\n    display   :   none\n}",
  }),
  ".selector {\n  display: none;\n}\n",
);
