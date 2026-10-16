// Runs the specs in tests/specs against target/plugin.wasm (built with `deno task build`) through dprint's
// formatter for Wasm plugins. A spec file can start with `-- <file name> --` and `~~ <config> ~~` lines, and
// has tests that start with `== <name> ==` and give the input, `[expect]` and the formatted output.
import { createFromBuffer, type Formatter } from "@dprint/formatter";
import { assertEquals, assertStringIncludes, assertThrows } from "@std/assert";
import $ from "dax";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const formatter = createFromBuffer(
  Deno.readFileSync(rootDir.join("target/plugin.wasm").toString()) as Uint8Array<ArrayBuffer>,
);

for (const specPath of collectSpecs(rootDir.join("tests/specs"))) {
  const spec = parseSpecFile(specPath.readTextSync().replaceAll("\r\n", "\n"));
  for (const test of spec.tests) {
    Deno.test(`${rootDir.join("tests/specs").relative(specPath)}: ${test.name}`, () => {
      formatter.setConfig({}, spec.config);
      assertEquals(formatter.getConfigDiagnostics(), []);
      const formatted = format(formatter, spec.fileName, test.input);
      assertEquals(formatted, test.expected);
      // formatting again changes nothing
      assertEquals(format(formatter, spec.fileName, formatted), formatted);
    });
  }
}

Deno.test("overrides the configuration for one file", () => {
  formatter.setConfig({}, { singleQuote: true });
  assertEquals(
    formatter.formatText({ filePath: "file.js", fileText: "'a'", overrideConfig: { singleQuote: false } }),
    "\"a\";\n",
  );
  assertEquals(formatter.formatText({ filePath: "file.js", fileText: "\"a\"" }), "'a';\n");
});

Deno.test("takes the global configuration", () => {
  formatter.setConfig({ lineWidth: 10, indentWidth: 4, useTabs: false, newLineKind: "crlf" }, {});
  assertEquals(
    formatter.formatText({ filePath: "file.ts", fileText: "f(aaaa, bbbb)" }),
    "f(\r\n    aaaa,\r\n    bbbb,\r\n);\r\n",
  );
});

Deno.test("reports what is wrong with the configuration", () => {
  formatter.setConfig({}, { lineWidth: "wide", "plugin.jsDoc": true });
  assertEquals(formatter.getConfigDiagnostics().map(d => d.propertyName), ["plugin.jsDoc", "lineWidth"]);
});

Deno.test("formats the languages of prettier", () => {
  formatter.setConfig({}, {});
  const cases: [string, string, string][] = [
    ["file.json", "{\"a\":1}", "{ \"a\": 1 }\n"],
    ["file.css", "a{b:c}", "a {\n  b: c;\n}\n"],
    ["file.scss", "a{b{c:d}}", "a {\n  b {\n    c: d;\n  }\n}\n"],
    ["file.less", "a{b:c}", "a {\n  b: c;\n}\n"],
    ["file.graphql", "{a}", "{\n  a\n}\n"],
    ["file.yaml", "a:   1", "a: 1\n"],
    ["file.md", "#   Title\n\n```js\nconst   a=1\n```\n", "# Title\n\n```js\nconst a = 1;\n```\n"],
    ["file.html", "<div><p>a</p></div>", "<div><p>a</p></div>\n"],
    ["file.vue", "<script>\nconst   a=1\n</script>\n", "<script>\nconst a = 1;\n</script>\n"],
    ["file.hbs", "<div   class=\"a\"></div>", "<div class=\"a\"></div>"],
    ["file.ts", "const a = css`a{b:c}`;", "const a = css`\n  a {\n    b: c;\n  }\n`;\n"],
    ["file.ts", "const f = <T,>(a: T) => a;", "const f = <T>(a: T) => a;\n"],
    ["file.tsx", "const f = <T,>(a: T) => a;", "const f = <T,>(a: T) => a;\n"],
    ["file.js.flow", "type A = {| a: number |}", "type A = {| a: number |};\n"],
  ];
  for (const [filePath, fileText, expected] of cases) {
    assertEquals(formatter.formatText({ filePath, fileText }), expected, filePath);
  }
});

Deno.test("gives the extensions of prettier's languages", () => {
  formatter.setConfig({}, {});
  const extensions = formatter.getFileMatchingInfo().fileExtensions;
  for (
    const extension of [
      "ts",
      "tsx",
      "mts",
      "cts",
      "js",
      "jsx",
      "mjs",
      "cjs",
      "json",
      "md",
      "mdx",
      "css",
      "scss",
      "less",
      "yaml",
      "html",
      "vue",
      "hbs",
      "graphql",
    ]
  ) {
    assertEquals(extensions.includes(extension), true, extension);
  }
});

Deno.test("reports a syntax error", () => {
  formatter.setConfig({}, {});
  const error = assertThrows(() => formatter.formatText({ filePath: "file.js", fileText: "const v =" }));
  assertStringIncludes(String(error), "SyntaxError: Unexpected token (1:10)");
});

Deno.test("reports a file without a parser", () => {
  formatter.setConfig({}, {});
  const error = assertThrows(() => formatter.formatText({ filePath: "file.txt", fileText: "const v =" }));
  assertStringIncludes(String(error), "UndefinedParserError: No parser could be inferred for file \"file.txt\"");
});

function format(formatter: Formatter, filePath: string, fileText: string) {
  return formatter.formatText({ filePath, fileText });
}

interface Spec {
  fileName: string;
  config: Record<string, unknown>;
  tests: { name: string; input: string; expected: string }[];
}

function parseSpecFile(text: string): Spec {
  const lines = text.split("\n");
  let fileName = "default.ts";
  let config: Record<string, unknown> = {};
  while (lines.length > 0 && !lines[0].startsWith("== ")) {
    const line = lines.shift()!;
    const fileNameMatch = /^-- (.*) --$/.exec(line);
    const configMatch = /^~~ (.*) ~~$/.exec(line);
    if (fileNameMatch != null) fileName = fileNameMatch[1];
    else if (configMatch != null) config = parseConfig(configMatch[1]);
  }
  const tests = [];
  for (const section of lines.join("\n").split(/^(?=== .* ==$)/m)) {
    const nameEnd = section.indexOf("\n");
    const name = section.slice(3, nameEnd - 3);
    const [input, expected] = section.slice(nameEnd + 1).split("\n[expect]\n");
    tests.push({ name, input, expected: expected.replace(/\n+$/, "") + "\n" });
  }
  return { fileName, config, tests };
}

// a configuration written as `key: value, key: value`
function parseConfig(text: string): Record<string, unknown> {
  const config: Record<string, unknown> = {};
  for (const entry of text.split(",")) {
    const [key, value] = entry.split(":").map(part => part.trim());
    config[key] = value === "true" ? true : value === "false" ? false : /^\d+$/.test(value) ? Number(value) : value;
  }
  return config;
}

function collectSpecs(dir: ReturnType<typeof $.path>): ReturnType<typeof $.path>[] {
  const specs = [];
  for (const entry of dir.readDirSync()) {
    const path = dir.join(entry.name);
    if (entry.isDirectory) specs.push(...collectSpecs(path));
    else if (entry.name.endsWith(".txt")) specs.push(path);
  }
  return specs.sort((a, b) => a.toString().localeCompare(b.toString()));
}
