// Checks what dprint sees of target/plugin.wasm (built with `deno task build`) besides the formatted text of an
// ordinary file: what the plugin says about itself, how it resolves dprint's configuration into prettier's options,
// what it says is wrong with a configuration, and the files that are out of the ordinary (empty, large, with
// characters outside of ASCII, with errors).
import { createFromBuffer } from "@dprint/formatter";
import { assert, assertEquals, assertMatch, assertStringIncludes, assertThrows } from "@std/assert";
import $ from "dax";
import * as prettier from "prettier";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const wasmBytes = Deno.readFileSync(rootDir.join("target/plugin.wasm").toString()) as Uint8Array<ArrayBuffer>;
const formatter = createFromBuffer(wasmBytes);
const defaultOptions = { printWidth: 80, tabWidth: 2, useTabs: false, endOfLine: "lf" };

Deno.test("says what the plugin is", () => {
  const info = formatter.getPluginInfo();
  assertEquals(info.name, "dprint-plugin-prettier");
  assertEquals(info.configKey, "prettier");
  assertEquals(info.helpUrl, "https://dprint.dev/plugins/prettier");
  assertEquals(info.updateUrl, "https://plugins.dprint.dev/dprint/dprint-plugin-prettier/latest.json");
  assertMatch(info.version, /^\d+\.\d+\.\d+$/);
  assertEquals(
    info.configSchemaUrl,
    `https://plugins.dprint.dev/dprint/dprint-plugin-prettier/${info.version}/schema.json`,
  );
  // dprint then formats the whole file when it is asked for a range
  assertEquals((info as unknown as { supportsRangeFormatting: boolean }).supportsRangeFormatting, false);
});

Deno.test("gives the licenses of prettier and of what is compiled with it", () => {
  const license = formatter.getLicenseText();
  assertStringIncludes(license, "prettier: Copyright (c) James Long and contributors (MIT License)");
  assertStringIncludes(license, "The MIT License");
});

Deno.test("resolves no configuration to prettier's defaults", () => {
  formatter.setConfig({}, {});
  assertEquals(formatter.getConfigDiagnostics(), []);
  assertEquals(formatter.getResolvedConfig(), { main: defaultOptions, extensionOverrides: {}, jsDoc: false });
});

Deno.test("resolves the configuration that all plugins share", () => {
  formatter.setConfig({ lineWidth: 100, indentWidth: 4, useTabs: true, newLineKind: "crlf" }, {});
  assertEquals(formatter.getConfigDiagnostics(), []);
  assertEquals(formatter.getResolvedConfig(), {
    main: { printWidth: 100, tabWidth: 4, useTabs: true, endOfLine: "crlf" },
    extensionOverrides: {},
    jsDoc: false,
  });
  formatter.setConfig({ newLineKind: "auto" }, {});
  assertEquals(formatter.getResolvedConfig().main, { ...defaultOptions, endOfLine: "auto" });
});

Deno.test("the plugin's configuration comes before what all plugins share", () => {
  const global = { lineWidth: 100, indentWidth: 4, useTabs: true, newLineKind: "crlf" } as const;
  formatter.setConfig(global, { lineWidth: 60, indentWidth: 3, useTabs: false, newLineKind: "lf" });
  assertEquals(formatter.getConfigDiagnostics(), []);
  assertEquals(formatter.getResolvedConfig().main, { printWidth: 60, tabWidth: 3, useTabs: false, endOfLine: "lf" });
});

Deno.test("prettier's names come before dprint's", () => {
  formatter.setConfig({}, {
    lineWidth: 60,
    printWidth: 90,
    indentWidth: 3,
    tabWidth: 8,
    newLineKind: "crlf",
    endOfLine: "cr",
  });
  assertEquals(formatter.getConfigDiagnostics(), []);
  assertEquals(formatter.getResolvedConfig().main, { printWidth: 90, tabWidth: 8, useTabs: false, endOfLine: "cr" });
  assertEquals(formatter.formatText({ filePath: "file.js", fileText: "a\nb" }), "a;\rb;\r");
});

Deno.test("resolves the options of extensions, of prettier and of the Prettier plugins", () => {
  formatter.setConfig({}, {
    semi: false,
    "TS.semi": true,
    "d.ts.singleQuote": true,
    "json.tabWidth": 4,
    "plugin.jsDoc": true,
    jsdocSpaces: 2,
    custom: [1, { a: null }],
  });
  assertEquals(formatter.getConfigDiagnostics(), []);
  assertEquals(formatter.getResolvedConfig(), {
    main: { ...defaultOptions, semi: false, jsdocSpaces: 2, custom: [1, { a: null }] },
    // by what comes before the last dot, in lower case
    extensionOverrides: { ts: { semi: true }, "d.ts": { singleQuote: true }, json: { tabWidth: 4 } },
    jsDoc: true,
  });
  assertEquals(formatter.formatText({ filePath: "file.js", fileText: "a" }), "a\n");
  assertEquals(formatter.formatText({ filePath: "file.ts", fileText: "a" }), "a;\n");
  assertEquals(formatter.formatText({ filePath: "FILE.TS", fileText: "a" }), "a;\n");
  assertEquals(
    formatter.formatText({ filePath: "file.json", fileText: "{\"a\":{\"b\":1}}" }),
    "{ \"a\": { \"b\": 1 } }\n",
  );
  assertEquals(
    formatter.formatText({ filePath: "dir.ts/file.json", fileText: "{\n\"a\":1}" }),
    "{\n    \"a\": 1\n}\n",
  );
});

Deno.test("says what is wrong with each setting of the wrong type and goes on with its default", () => {
  formatter.setConfig({}, {
    lineWidth: "a",
    indentWidth: true,
    useTabs: 1,
    newLineKind: 5,
    endOfLine: 1,
    tabWidth: "x",
    printWidth: null,
    "plugin.jsDoc": "yes",
  });
  assertEquals(formatter.getConfigDiagnostics(), [
    { propertyName: "plugin.jsDoc", message: "Expected a boolean, but found \"yes\"." },
    { propertyName: "lineWidth", message: "Expected a number, but found \"a\"." },
    { propertyName: "printWidth", message: "Expected a number, but found null." },
    { propertyName: "indentWidth", message: "Expected a number, but found true." },
    { propertyName: "tabWidth", message: "Expected a number, but found \"x\"." },
    { propertyName: "useTabs", message: "Expected a boolean, but found 1." },
    { propertyName: "newLineKind", message: "Expected a string, but found 5." },
    { propertyName: "endOfLine", message: "Expected a string, but found 1." },
  ]);
  assertEquals(formatter.getResolvedConfig(), { main: defaultOptions, extensionOverrides: {}, jsDoc: false });
});

Deno.test("says that a new line kind is unknown", () => {
  formatter.setConfig({}, { newLineKind: "mac" });
  assertEquals(formatter.getConfigDiagnostics(), [
    { propertyName: "newLineKind", message: "Unknown new line kind: mac" },
  ]);
  assertEquals(formatter.getResolvedConfig().main, defaultOptions);
});

Deno.test("prettier says what is wrong with one of its options when a file is formatted", () => {
  formatter.setConfig({}, { semi: "nope" });
  assertEquals(formatter.getConfigDiagnostics(), []);
  const error = assertThrows(() => formatter.formatText({ filePath: "file.js", fileText: "a" }));
  assertStringIncludes(String(error), "Invalid semi value. Expected true or false, but received \"nope\".");
});

Deno.test("an option that prettier doesn't have is left alone", () => {
  formatter.setConfig({}, { notAnOption: 1 });
  assertEquals(formatter.getConfigDiagnostics(), []);
  assertEquals(formatter.formatText({ filePath: "file.js", fileText: "a" }), "a;\n");
});

Deno.test("the configuration that dprint gives for one file is over the plugin's, for that file only", () => {
  formatter.setConfig({ lineWidth: 40 }, { semi: false, "ts.semi": true, "plugin.jsDoc": true });
  const jsDoc = "/**\n* adds  numbers\n*/\nfunction add() {}\n";
  assertEquals(
    formatter.formatText({ filePath: "file.ts", fileText: "a", overrideConfig: { "ts.semi": false } }),
    "a\n",
  );
  assertEquals(formatter.formatText({ filePath: "file.js", fileText: "a", overrideConfig: { semi: true } }), "a;\n");
  assertEquals(
    formatter.formatText({ filePath: "file.js", fileText: "f(aaaa, bbbb, cccc)", overrideConfig: { lineWidth: 10 } }),
    "f(\n  aaaa,\n  bbbb,\n  cccc,\n)\n",
  );
  assertEquals(
    formatter.formatText({ filePath: "file.js", fileText: jsDoc, overrideConfig: { "plugin.jsDoc": false } }),
    "/**\n * adds  numbers\n */\nfunction add() {}\n",
  );
  // and the next files are formatted with the plugin's again
  assertEquals(formatter.formatText({ filePath: "file.ts", fileText: "a" }), "a;\n");
  assertEquals(formatter.formatText({ filePath: "file.js", fileText: "a" }), "a\n");
  assertEquals(
    formatter.formatText({ filePath: "file.js", fileText: jsDoc }),
    "/** Adds numbers */\nfunction add() {}\n",
  );
  assertEquals(formatter.getResolvedConfig(), {
    main: { printWidth: 40, tabWidth: 2, useTabs: false, endOfLine: "lf", semi: false },
    extensionOverrides: { ts: { semi: true } },
    jsDoc: true,
  });
});

Deno.test("a configuration replaces the one before it", () => {
  formatter.setConfig({ lineWidth: 10, useTabs: true }, { semi: false, "js.singleQuote": true });
  assertEquals(
    formatter.formatText({ filePath: "file.js", fileText: "f(\"aaaa\", bbbb)" }),
    "f(\n\t'aaaa',\n\tbbbb,\n)\n",
  );
  formatter.setConfig({}, {});
  assertEquals(formatter.getResolvedConfig(), { main: defaultOptions, extensionOverrides: {}, jsDoc: false });
  assertEquals(formatter.formatText({ filePath: "file.js", fileText: "f(\"aaaa\", bbbb)" }), "f(\"aaaa\", bbbb);\n");
});

Deno.test("two plugins of the same module keep their own configurations", () => {
  const other = createFromBuffer(wasmBytes);
  formatter.setConfig({}, { semi: false });
  other.setConfig({}, { singleQuote: true });
  assertEquals(formatter.formatText({ filePath: "file.js", fileText: "\"a\"" }), "\"a\"\n");
  assertEquals(other.formatText({ filePath: "file.js", fileText: "\"a\"" }), "'a';\n");
});

Deno.test("finds the parser by the name of the file as prettier does", async () => {
  formatter.setConfig({}, {});
  const cases: [string, string][] = [
    ["file.JS", "a"],
    ["dir/sub.dir/file.ts", "let a"],
    ["C:\\dir\\file.ts", "let a"],
    ["/dir with spaces/файл.ts", "let a"],
    [".prettierrc", "{a:1}"],
    [".babelrc", "{\"a\":1}"],
    ["package.json", "{\"b\":1,\"a\":[]}"],
    ["tsconfig.json", "{\"a\":1,// comment\n}"],
    ["file.d.mts", "export  type A = 1"],
    ["file.component.html", "<div   *ngIf=\"a\"></div>"],
    ["CMakeLists.txt", "a"],
    ["Dockerfile", "a"],
    ["file", "a"],
    ["file.", "a"],
    [".js", "a"],
  ];
  for (const [filePath, fileText] of cases) {
    assertEquals(formatOrError(filePath, fileText), await prettierOrError(filePath, fileText), filePath);
  }
});

Deno.test("formats files that are empty or only white space as prettier does", async () => {
  formatter.setConfig({}, {});
  for (
    const extension of [
      "js",
      "ts",
      "tsx",
      "json",
      "css",
      "scss",
      "less",
      "md",
      "mdx",
      "yaml",
      "html",
      "vue",
      "graphql",
      "hbs",
    ]
  ) {
    for (const fileText of ["", " ", "\n", "\n\n\n", "\r\n", "\t\n "]) {
      const filePath = `file.${extension}`;
      assertEquals(
        formatOrError(filePath, fileText),
        await prettierOrError(filePath, fileText),
        `${filePath} ${JSON.stringify(fileText)}`,
      );
    }
  }
});

Deno.test("keeps the characters outside of ASCII as prettier does", async () => {
  formatter.setConfig({}, {});
  const cases: [string, string][] = [
    ["file.js", "const s = '😀 中文 é \u0301 \u200B \u00A0', 변수 = `${😀}`; // 💡 comment\n/* 日本語 */"],
    ["file.js", "const a = '\\u{1F600}', b = '\\uD83D', c = /[\u{1F600}-\u{1F64F}]/u"],
    ["file.ts", "const 名前: string = \"Ünïcödé\";type T = 'ß' | 'ﬁ'"],
    ["file.json", "{\"ключ\":\"значение 😀\",\"a\":\"\\ud83d\\ude00\"}"],
    [
      "file.md",
      "# 😀  中文标题\n\n全角文字と half width を混ぜた長い文章です。 これは 幅の 計算に 使われます。\n\n| 列 | 😀 |\n|-|-|\n| 中文 | a |\n",
    ],
    ["file.css", "a::before{content:'→ 😀';font-family:\"游ゴシック\"}"],
    ["file.yaml", "ключ:   значение\n😀: [中, 文]\n"],
    ["file.html", "<p title=\"é\">😀   中文 &amp; &eacute; &#x1F600;</p>"],
    ["file.vue", "<template><p>{{ '😀'+名前 }}</p></template>"],
    ["file.graphql", "{user(name:\"😀 中文\"){id}}"],
    ["file.hbs", "<p class=\"é\">{{t \"😀\"}}   中文</p>"],
  ];
  for (const [filePath, fileText] of cases) {
    assertEquals(
      formatOrError(filePath, fileText),
      await prettierOrError(filePath, fileText),
      `${filePath} ${fileText}`,
    );
  }
});

Deno.test("fails as prettier does and formats the next file", async () => {
  formatter.setConfig({}, {});
  const cases: [string, string][] = [
    ["file.js", "const v ="],
    ["file.ts", "let a: = 1"],
    ["file.tsx", "<div>"],
    ["file.json", "{\"a\":}"],
    ["file.css", "a{"],
    ["file.scss", "a{b:c"],
    ["file.less", "@a:{"],
    ["file.yaml", "a: [1"],
    ["file.graphql", "{a"],
    ["file.html", "<div></span>"],
    ["file.vue", "<template><div></template>"],
    ["file.hbs", "{{#if}}"],
    ["file.txt", "a"],
  ];
  for (const [filePath, fileText] of cases) {
    const expected = await prettierOrError(filePath, fileText);
    assert(expected.startsWith("error: "), `${filePath} is formatted by prettier`);
    assertEquals(formatOrError(filePath, fileText), expected, filePath);
    assertEquals(formatter.formatText({ filePath: "file.js", fileText: "a" }), "a;\n", `after ${filePath}`);
  }
});

Deno.test("formats large files as prettier does", async () => {
  formatter.setConfig({}, {});
  for (const fileName of ["sample.js", "sample.ts", "sample.css", "sample.json", "sample.md", "sample.yaml"]) {
    const sample = rootDir.join("tests/samples", fileName).readTextSync();
    // more than the lengths from which the plugin gives a file room by its length (src/main.ts)
    const fileText = fileName === "sample.json"
      ? "[" + Array.from({ length: 400 }, () => sample).join(",") + "]"
      : fileName === "sample.yaml"
      ? Array.from({ length: 700 }, () => sample.replace("%YAML 1.2\n", "")).join("")
      : Array.from({ length: 60 }, (_, i) => sample.replaceAll("Shape", `Shape${i}`)).join("\n");
    assert(fileText.length > (fileName === "sample.yaml" ? 300_000 : 50_000), fileName);
    assertEquals(formatOrError(fileName, fileText), await prettierOrError(fileName, fileText), fileName);
  }
});

Deno.test("formats the same file many times with the same result", () => {
  formatter.setConfig({}, {});
  for (const fileName of ["sample.ts", "sample.md", "sample.vue"]) {
    const fileText = rootDir.join("tests/samples", fileName).readTextSync();
    const first = formatter.formatText({ filePath: fileName, fileText });
    for (let i = 0; i < 200; i++) {
      assertEquals(formatter.formatText({ filePath: fileName, fileText }), first, `${fileName} the ${i}th time`);
    }
  }
});

function formatOrError(filePath: string, fileText: string) {
  try {
    return formatter.formatText({ filePath, fileText });
  } catch (error) {
    return "error: " + firstLine((error as Error).message);
  }
}

async function prettierOrError(filePath: string, fileText: string) {
  try {
    return await prettier.format(fileText, { filepath: filePath });
  } catch (error) {
    return "error: " + firstLine(String(error)).toWellFormed();
  }
}

function firstLine(text: string) {
  const index = text.indexOf("\n");
  return index < 0 ? text : text.slice(0, index);
}
