// Checks what dprint's configuration does to target/plugin.wasm (built with `deno task build`) against prettier
// from npm: every option that prettier and the Prettier plugins that the plugin includes say they have, with every
// value of it, formats the samples of every language in tests/samples as prettier does with that option. The
// options come from prettier's own getSupportInfo(), so an option that a new version adds is checked as well.
import { createFromBuffer } from "@dprint/formatter";
import { assert, assertEquals } from "@std/assert";
import $ from "dax";
import { createRequire } from "node:module";
import * as prettier from "prettier";
// at the version that the plugin includes (plugins/package.json), which a test checks
import * as jsDocPlugin from "prettier-plugin-jsdoc";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const formatter = createFromBuffer(
  Deno.readFileSync(rootDir.join("target/plugin.wasm").toString()) as Uint8Array<ArrayBuffer>,
);
// the Prettier plugins at the versions that the plugin includes
const sveltePlugin = createRequire(import.meta.url)("../plugins/node_modules/prettier-plugin-svelte/plugin.js");
const samples = Array.from(rootDir.join("tests/samples").readDirSync())
  .filter(entry => entry.isFile)
  .map(entry => ({ fileName: entry.name, text: rootDir.join("tests/samples", entry.name).readTextSync() }))
  .sort((a, b) => a.fileName.localeCompare(b.fileName));
// the samples whose comments prettier-plugin-jsdoc formats
const jsDocSamples = samples.filter(sample => /\.(js|ts|tsx)$/.test(sample.fileName));
// the options that dprint has no way to give, or that say where the file is rather than how it is formatted
const optionsLeftOut = new Set([
  "cursorOffset",
  "rangeStart",
  "rangeEnd",
  "filepath",
  "plugins",
  "svelte5CompilerPath",
]);
// values for the options that are numbers, which have no list of choices
const numberValues: Record<string, number[]> = {
  printWidth: [20, 40, 120, 100000],
  tabWidth: [1, 4, 8],
  jsdocSpaces: [2],
  jsdocPrintWidth: [40, 120],
};

interface SupportOption {
  name: string;
  type: string;
  category: string;
  array?: boolean;
  choices?: { value: unknown }[];
}

const supportInfo = await prettier.getSupportInfo({ plugins: [sveltePlugin, jsDocPlugin] });
const supportOptions = supportInfo.options as SupportOption[];

Deno.test("prettier-plugin-jsdoc and what it imports are at the versions that the plugin includes", () => {
  const included = rootDir.join("plugins/package-lock.json").readJsonSync<{
    packages: Record<string, { version: string }>;
  }>().packages;
  const compared = JSON.parse(rootDir.join("deno.lock").readTextSync()).npm as Record<string, unknown>;
  for (const name of ["prettier-plugin-jsdoc", "comment-parser", "mdast-util-from-markdown", "binary-searching"]) {
    const version = included[`node_modules/${name}`].version;
    assert(
      Object.keys(compared).some(key => key === `${name}@${version}` || key.startsWith(`${name}@${version}_`)),
      `${name} ${version} is not what the tests compare with (deno.lock)`,
    );
  }
});

Deno.test("the samples are of every language and are formatted without an error", async () => {
  const languages = new Set<string>();
  for (const sample of samples) {
    const info = await prettier.getFileInfo(sample.fileName, { plugins: [sveltePlugin] });
    assert(info.inferredParser != null, sample.fileName);
    languages.add(info.inferredParser);
    // throws when the sample has a syntax error, which would leave only the error's message to compare
    await prettier.format(sample.text, { filepath: sample.fileName, plugins: [sveltePlugin] });
  }
  assertEquals(
    [...languages].sort(),
    [
      "babel",
      "css",
      "glimmer",
      "graphql",
      "html",
      "json",
      "less",
      "markdown",
      "mdx",
      "scss",
      "svelte",
      "typescript",
      "vue",
      "yaml",
    ],
  );
});

Deno.test("formats the samples as prettier does without any options", async () => {
  await assertSameAsPrettier({}, samples, false);
});

for (const option of supportOptions) {
  if (optionsLeftOut.has(option.name) || option.array || option.name === "parser") {
    continue;
  }
  const isJsDoc = option.category === "jsdoc";
  for (const value of valuesOf(option)) {
    Deno.test(`${option.name}: ${JSON.stringify(value)}`, async () => {
      await assertSameAsPrettier({ [option.name]: value }, isJsDoc ? jsDocSamples : samples, isJsDoc);
    });
  }
}

// every sample with every parser, which mostly fails for a sample of another language, as it does in prettier
for (const parser of valuesOf(supportOptions.find(option => option.name === "parser")!) as string[]) {
  Deno.test(`parser: ${parser}`, async () => {
    formatter.setConfig({}, { parser });
    assertEquals(formatter.getConfigDiagnostics(), []);
    for (const sample of samples) {
      const expected = await formatWithPrettier(sample.text, sample.fileName, { parser }, false);
      const actual = formatWithPlugin(sample.text, sample.fileName);
      assertEquals(actual, expected, sample.fileName);
    }
  });
}

Deno.test("every option of prettier has values to check", () => {
  const unchecked = supportOptions
    .filter(option => !optionsLeftOut.has(option.name) && !option.array && valuesOf(option).length === 0)
    .map(option => option.name);
  // a text that is a list of tags, which has no values to choose from
  assertEquals(unchecked, ["jsdocTagsOrder"]);
});

Deno.test("the schema of the configuration has every option of prettier with its values and default", async () => {
  const schema = rootDir.join("deployment/schema.json").readJsonSync<{
    properties: Record<string, { type: string; default?: unknown; oneOf?: { const: unknown }[] }>;
    "x-sections": { properties: string[] }[];
  }>();
  const inSections = new Set(schema["x-sections"].flatMap(section => section.properties));
  for (const option of (await prettier.getSupportInfo()).options as (SupportOption & { default?: unknown })[]) {
    if (optionsLeftOut.has(option.name) || option.name === "parser") {
      continue;
    }
    const property = schema.properties[option.name];
    assert(property != null, `${option.name} is not in deployment/schema.json`);
    assert(inSections.has(option.name), `${option.name} is not in a section of deployment/schema.json`);
    assertEquals(property.type, option.type === "choice" ? "string" : option.type === "int" ? "integer" : option.type);
    assertEquals(property.default, option.default, option.name);
    if (option.type === "choice") {
      assertEquals(
        property.oneOf?.map(choice => choice.const).sort(),
        option.choices!.map(choice => choice.value).sort(),
        option.name,
      );
    }
  }
});

Deno.test("formats comments with prettier-plugin-jsdoc as prettier does with the plugin", async () => {
  await assertSameAsPrettier({}, jsDocSamples, true);
});

Deno.test("options together", async () => {
  await assertSameAsPrettier(
    {
      printWidth: 60,
      tabWidth: 4,
      useTabs: true,
      semi: false,
      singleQuote: true,
      jsxSingleQuote: true,
      quoteProps: "consistent",
      trailingComma: "none",
      bracketSpacing: false,
      bracketSameLine: true,
      arrowParens: "avoid",
      proseWrap: "always",
      endOfLine: "crlf",
      singleAttributePerLine: true,
      vueIndentScriptAndStyle: true,
      experimentalTernaries: true,
    },
    samples,
    false,
  );
});

Deno.test("an option for the files of an extension", async () => {
  for (const sample of samples) {
    const extension = sample.fileName.slice(sample.fileName.lastIndexOf(".") + 1);
    // the option is given for every file and then taken back for the files of the sample's extension
    formatter.setConfig({}, {
      tabWidth: 8,
      semi: false,
      [`${extension.toUpperCase()}.tabWidth`]: 3,
      [`${extension}.semi`]: true,
    });
    assertEquals(formatter.getConfigDiagnostics(), []);
    assertEquals(
      formatter.formatText({ filePath: sample.fileName, fileText: sample.text }),
      await prettier.format(sample.text, { filepath: sample.fileName, plugins: [sveltePlugin], tabWidth: 3 }),
      sample.fileName,
    );
  }
});

Deno.test("a parser for the files of an extension", async () => {
  const text = "{\"a\":1,// comment\n'b':[1,2,],}";
  formatter.setConfig({}, { "json.parser": "json5", "js.parser": "flow" });
  assertEquals(
    formatter.formatText({ filePath: "file.json", fileText: text }),
    await prettier.format(text, { filepath: "file.json", parser: "json5" }),
  );
  const flow = "type A = {| a: number |}; const f = (x: any) => (x: string)";
  assertEquals(
    formatter.formatText({ filePath: "file.js", fileText: flow }),
    await prettier.format(flow, { filepath: "file.js", parser: "flow" }),
  );
});

Deno.test("the options of dprint's own names", async () => {
  for (const sample of samples) {
    formatter.setConfig({ lineWidth: 50, indentWidth: 3, useTabs: true, newLineKind: "crlf" }, {});
    assertEquals(
      formatter.formatText({ filePath: sample.fileName, fileText: sample.text }),
      await prettier.format(sample.text, {
        filepath: sample.fileName,
        plugins: [sveltePlugin],
        printWidth: 50,
        tabWidth: 3,
        useTabs: true,
        endOfLine: "crlf",
      }),
      sample.fileName,
    );
    formatter.setConfig({ lineWidth: 50, indentWidth: 3, useTabs: true, newLineKind: "crlf" }, {
      lineWidth: 70,
      indentWidth: 5,
      useTabs: false,
      newLineKind: "auto",
    });
    const crlfText = sample.text.replaceAll("\n", "\r\n");
    assertEquals(
      formatter.formatText({ filePath: sample.fileName, fileText: crlfText }),
      await prettier.format(crlfText, {
        filepath: sample.fileName,
        plugins: [sveltePlugin],
        printWidth: 70,
        tabWidth: 5,
        useTabs: false,
        endOfLine: "auto",
      }),
      sample.fileName,
    );
  }
});

Deno.test("formats the files of every extension and name that prettier has a parser for", async () => {
  formatter.setConfig({}, {});
  const extensions = new Set<string>();
  for (const language of supportInfo.languages) {
    for (const extension of language.extensions ?? []) {
      extensions.add(extension.replace(/^\./, ""));
    }
  }
  assertEquals(formatter.getFileMatchingInfo().fileExtensions.toSorted(), [...extensions].sort());
  // an empty file of each has a parser, as prettier's does
  for (const extension of extensions) {
    const filePath = `file.${extension}`;
    const info = await prettier.getFileInfo(filePath, { plugins: [sveltePlugin] });
    const expected = await formatWithPrettier("", filePath, {}, false);
    assertEquals(formatWithPlugin("", filePath), expected, `${filePath} (${info.inferredParser})`);
  }
});

/** Checks that the plugin with a configuration formats samples as prettier does with the same options. */
async function assertSameAsPrettier(
  options: Record<string, unknown>,
  samples: { fileName: string; text: string }[],
  jsDoc: boolean,
) {
  formatter.setConfig({}, jsDoc ? { ...options, "plugin.jsDoc": true } : options);
  assertEquals(formatter.getConfigDiagnostics(), []);
  let changed = 0;
  for (const sample of samples) {
    const expected = await formatWithPrettier(sample.text, sample.fileName, options, jsDoc);
    assertEquals(formatWithPlugin(sample.text, sample.fileName), expected, sample.fileName);
    // and when dprint gives the options for only this file
    formatter.setConfig({}, {});
    assertEquals(
      formatWithPlugin(sample.text, sample.fileName, jsDoc ? { ...options, "plugin.jsDoc": true } : options),
      expected,
      `${sample.fileName} with the options overridden`,
    );
    formatter.setConfig({}, jsDoc ? { ...options, "plugin.jsDoc": true } : options);
    if (expected !== await formatWithPrettier(sample.text, sample.fileName, {}, jsDoc)) {
      changed++;
    }
  }
  return changed;
}

async function formatWithPrettier(text: string, filePath: string, options: Record<string, unknown>, jsDoc: boolean) {
  try {
    return await prettier.format(text, {
      ...options,
      filepath: filePath,
      plugins: jsDoc ? [sveltePlugin, jsDocPlugin] : [sveltePlugin],
    });
  } catch (error) {
    return "error: " + firstLine(String(error));
  }
}

function formatWithPlugin(text: string, filePath: string, overrideConfig?: Record<string, unknown>) {
  try {
    return formatter.formatText({ filePath, fileText: text, overrideConfig });
  } catch (error) {
    return "error: " + firstLine((error as Error).message);
  }
}

function valuesOf(option: SupportOption): unknown[] {
  if (option.type === "boolean") {
    return [true, false];
  }
  if (option.type === "choice") {
    return (option.choices ?? []).map(choice => choice.value);
  }
  return numberValues[option.name] ?? [];
}

function firstLine(text: string) {
  const index = text.indexOf("\n");
  return index < 0 ? text : text.slice(0, index);
}
