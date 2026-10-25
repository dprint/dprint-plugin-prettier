# Upgrading Prettier

The plugin is Prettier's source compiled with [nts](https://github.com/dsherret/nts), so an upgrade brings in the new
source and its packages, and keeps the types that make the compiled code fast. The rule throughout is that Prettier's
code is only given types and is never changed: where the plugin formats differently, either a type is wrong (remove
it) or nts compiles something wrongly (fix nts). This was written while upgrading 3.4.2 to 3.9.10, and lists what
went wrong then.

## Checklist

1. [Update the version](#1-the-version) everywhere it is written.
2. [Pin the packages](#2-the-packages) to the exact versions Prettier's release is built with, and update the copies
   in `src/vendor`.
3. [Merge the source](#3-the-source) into `prettier/src`, keeping its types.
4. [Carry the types of the TypeScript parser](#4-the-typescript-parser) over to the new bundle.
5. [Check Flow's parser](#5-flows-parser), which is a Wasm module that the build makes C of.
6. [Map new imports](#6-new-imports) in `src/nts.json`, and regenerate `src/generated`.
7. [Build and test](#7-building-and-testing) until `deno task test:prettier` has no differences.
8. [Add types to new code](#8-types-for-new-code) where it is slow, and test again.
9. [Measure](#9-measuring) against Prettier on Node.

## 1. The version

The version of Prettier is written in:

- `prettier/package.json` (`version` and `description`), which `scripts/pin-dependencies.mjs` sets
- `deno.json` (`npm:prettier@<version>`), the Prettier that the tests compare with
- `.github/workflows/ci.ts` (`prettierVersion`), after which `deno run -A .github/workflows/ci.ts` regenerates
  `ci.generated.yml`
- `tests/repos_test.ts` (the ref of the `prettier` repo)
- `README.md`

`wasm/Plugin.csproj` has the version of the plugin, which is not Prettier's.

## 2. The packages

Prettier's release is built with the exact versions in its own `package.json`. `prettier/package.json` must list the
same versions, not ranges: with ranges, npm installs newer releases than Prettier's, which format differently. At
3.9.10 that was Babel's parser 8.0.7 instead of 8.0.0, meriyah 7.4.0 instead of 7.1.1 and `@angular/compiler` 21
instead of 22, which together made hundreds of Prettier's tests fail.

```sh
node scripts/pin-dependencies.mjs <version>
cd prettier && npm install --ignore-scripts
```

Before installing, copy the packages that are about to change (`prettier/node_modules/<name>`) somewhere, since the
old version of a package is what the types of its copy in `src/vendor` are carried from.

### The copies in `src/vendor`

Some packages are compiled from a copy in `src/vendor` rather than from `node_modules` (the packages that `paths` in
`src/nts.json` points into `./vendor`). When the version of one changes, find out what the copy is by taking its
type comments out and comparing it with the old package:

- The same as the old package: it has no types, so replace it with the new package's files.
- The same apart from the types: carry them over to the new version.

Do this for every file of the package, as only some of them may have types: PostCSS's parser and tokenizer have
them and its node classes do not, and copying the whole new package over it because its first file had none lost
the types of the others (they were put back from git).

```sh
node scripts/carry-types.mjs <old package file> <old typed copy> <new package file> <out>
```

It prints how many types it carried; those it could not line up are written to `<out>.unmatched.txt` to be looked
at. Check that the result is the new package's file once the types are taken out again. Babel's parser
(`src/vendor/babel-parser/index.js`) and angular-html-parser's lexer (`src/vendor/angular-html-parser/lexer.mjs`)
are this way, and the lexer's imports may need following, as a file that the old version imported may be gone.

- Different in more than the types: the copy was changed for the plugin, which a comment in it should say.

A change between two versions that is only how the package's bundler wrote the same code (yaml-unist-parser 3.2.1
against 3.2.0) may be left as it is.

## 3. The source

`prettier/src` is Prettier's `src` with JSDoc types added, and `// @nts-check` at the top of each file whose types
nts trusts. Bring in what changed upstream with a three-way merge of each file, so that the types stay where the
code did not change:

```sh
git merge-file prettier/src/<file> <old upstream>/src/<file> <new upstream>/src/<file>
```

Files that are new upstream are copied as they are, and files that are gone are deleted. Then:

- Check that every file that had `// @nts-check` before still has it. A merge that takes the upstream side of the
  first line drops it, and the file's types are then not used at all: at 3.9.10 this happened to 94 files, which
  made the plugin much slower without changing what it printed.
- Where the code around a type changed, check that the type still fits; the build points out most of these.

## 4. The TypeScript parser

`src/prettier-plugins/typescript.mjs` is `plugins/typescript.mjs` of Prettier from npm, with types. Carry the types of
the old bundle over to the new one, which also works through the bundle's minified names:

```sh
node scripts/carry-types.mjs <old untyped bundle> <old typed bundle> <new bundle> src/prettier-plugins/typescript.mjs
```

Set `CARRY_CONTEXT=2` so that a type is only carried where the lines around it line up too: without it, a line whose
code changed may line up with a different function and be given its types. A wrong type there showed up as files
that took minutes, such as a `lineMap` that was copied for every node because its type was lost.

## 5. Flow's parser

Prettier's Flow parser comes from the flow-parser package, which is Flow's parser compiled with Emscripten to a Wasm
module that is in its JavaScript as base64. The build takes the module out (`wasm/flow/extract-wasm.mjs`), makes C of
it with wasm2c, and compiles that into the plugin with `wasm/flow/flow_parser_glue.c`, which gives the module what
Emscripten's JavaScript would (its three imports and a memory that grows) and gives C# functions to call
(`wasm/FlowParser.cs`). `src/shims/flow-parser.ts` takes the place of the package's `dist/index.js` and
`dist/FlowParser.js`, and the package's own deserializer reads the parser's answer.

When flow-parser changes:

- `extract-wasm.mjs` fails if the minified names of the module's imports and exports changed. Find the new ones in
  `dist/FlowParserWASM.js` (`wasmImports=…` and `Module["_hermesParse"]=asm["…"]` and so on), and update the glue.
- Compare `src/shims/flow-parser.ts` with the package's `dist/index.js` and `dist/FlowParser.js`, which it follows.
  The option `enableExperimentalFlowRecordSyntax` going to `enableRecords` in `index.js` was missed at first, and
  records failed to parse.

The parser's memory starts at 128 MB, so it is only created the first time a file is parsed with it.

## 6. New imports

nts resolves imports itself, so a package that the new source imports for the first time needs an entry in `paths`
of `src/nts.json`, which has to point at a file that nts can compile: a package's browser build, a copy in
`src/vendor`, or a shim in `src/shims` for a package that does more than the plugin needs. A package that is only a
JSON file, such as character-entities, is mapped to that file.

Prettier's `*.evaluate.js` files are run at build time by Prettier's own build, and the plugin does the same:

```sh
node scripts/generate.mjs
```

Check that the languages it writes are Prettier's by comparing each language's extensions, file names and parsers in
`src/generated/*-languages.js` with `getSupportInfo()` of Prettier from npm, since they come from linguist-languages,
whose version is pinned with the others.

## 7. Building and testing

```sh
WASI_SDK_PATH=<wasi-sdk folder> BINARYEN=<binaryen folder>/bin WABT=<wabt folder> deno task build
deno task test
deno task test:prettier
deno task test:repos
```

`test:prettier` runs Prettier's own format tests through `target/plugin.wasm`: every fixture of `tests/format` with
every parser and the options of its test, as Prettier's test runner makes them, compared with Prettier from npm,
including the message of an error. At 3.9.10 all 21,650 cases give the same output. The cases that differ are written
to `target/prettier-tests/diffs`. It leaves out the fixtures that mark a cursor or a range, the tests that give
Prettier plugins, and the parsers of other packages (oxc, hermes, yuku). CI runs it after `deno task test`. `test:repos`
formats the files of many codebases with Prettier's default options.

A difference is one of these:

- A wrong type, which is most of them after an upgrade. typegen's types only say what was seen while recording (see
  below), and at 3.9.10 these were wrong: a `string` for a parameter that is undefined for a snippet without a path
  (`isFlowFile`), a `string` result for a helper that caches anything (`is` in the TypeScript bundle), a `string`
  result for `printIgnored`, which may give a doc, and an HTML `Node` for what is sometimes an angular-html-parser
  `StartTagComment` (`locStart`, `locEnd`, `printAttributes`). Remove the type; never change the code.
- Something that nts compiles wrongly or does not have. At 3.9.10 these were `structuredClone`, `isWellFormed`,
  `toString` with a radix and on a BigInt where the type is not known, `\p{…}` in a regular expression with the `u`
  flag for characters beyond the first 65536, `null` given to a property of an object of a class after it was
  created, `codePointAt` outside of the text, and fields of JavaScript classes that their own file gives other kinds of
  values. Fix it in nts with a spec, as the nts repository describes.
- The comparison itself: dprint gives a plugin a file without its BOM and always with a path, and its configuration is
  JSON, which has no `Infinity`. `tests/prettier_tests_worker.ts` gives Prettier the same.

Run the specs of nts after changing it, and the tests above after changing a type.

## 8. Types for new code

Code without types compiles to C# that looks everything up by name, which is several times slower. nts's typegen
records the types that values hold while Prettier formats files in Node, and writes them as comments:

```sh
NTS_CONFIG=src NTS_TYPES=types.json node --import <nts>/typegen/record.mjs <a script that formats many files>
node <nts>/typegen/annotate.mjs --types types.json --backup <dir> --only prettier/src/<folder>
```

Record with as many kinds of files as possible: at 3.9.10 that was files of every language and every case that
`test:prettier` collects (`target/prettier-tests/cases.json`, each formatted with the options of its test), which reach
far more of the parsers than real files do. Then annotate a folder at a time and run `test:prettier` after each,
since a type that was only seen to hold one thing is often wrong for something that was not formatted while recording.
`annotate.mjs --restore --backup <dir>` puts the files back. Annotating the TypeScript bundle with only the types of
numbers, texts and booleans gave nothing measurable at 3.9.10, so types are worth adding where a profile shows the time
going, not everywhere.

### The parsers

Every parser that Prettier uses is compiled with types, in one of two ways:

- **Packages that have JSDoc types throughout** (micromark, its extensions and utilities, mdast-util-from-markdown and
  unist-util-*) are used from `node_modules` as they are, and are listed under `checked` in `src/nts.json`, which has
  nts compile them with their own comments as if they started with `// @nts-check`. A file whose types nts does not
  compile yet is left out with a `!` in front of it (micromark's HTML compilers, which Prettier does not use). A
  package of types only, such as micromark-util-types, is then found by its declarations.
- **Every other parser is a copy in `src/vendor` with recorded types**: Babel's parser, acorn, acorn-jsx, espree,
  meriyah, `@angular/compiler`, angular-estree-parser, angular-html-parser, yaml, yaml-unist-parser, PostCSS and its
  parsers, remark, graphql, glimmer and handlebars-parser, and the deserializer of flow-parser
  (`src/vendor/flow-parser`, which `src/shims/flow-parser.ts` uses). `paths` in `src/nts.json` points each package at
  its copy, and a type in `prettier/src` that imports one of them by path imports the copy (as
  `prettier/src/language-html/parse/parse.js` does with angular-html-parser).

The plugins that `src/plugins.ts` adds are compiled the same way. prettier-plugin-svelte (its `browser.js`),
prettier-plugin-jsdoc (its `dist`) and comment-parser are copies with recorded types. Svelte's compiler is used
from `node_modules` and is listed under `checked`. It takes two parsers from copies through `scopes` in
`src/nts.json`: `src/vendor/acorn-svelte` is the acorn version that svelte depends on, with the types of
`src/vendor/acorn` carried over, and `src/vendor/acorn-typescript` is @sveltejs/acorn-typescript. Upgrading one of
these plugins is the same as upgrading a package in `prettier`. Its versions are pinned in `plugins/package.json`,
and `deno task test:plugins` runs its tests. That also runs the plugins' tests on Prettier from npm and fails when the
tests that don't pass there change (`knownFailedTests` in `tests/plugin_tests_test.ts`), since giving what Prettier
gives only formats as the tests expect where they pass. After an upgrade, find why a test started or stopped failing
(a newer dependency than the plugin's own lockfile has, say) and update the list.

To give a package types that only `node_modules` has, copy it into `src/vendor`, point `paths` at the copy, and annotate
the copy. A recording made before it was copied still holds for the copy when its keys are renamed to the copy's paths,
since the files are the same. Flow's parser is recorded with flow-parser from npm in Node, which runs its Wasm module,
as the plugin's shim needs the native parser.

What went wrong when the parsers were annotated at 3.9.10, all of which `test:prettier` found:

- A type that was only seen as one thing: a parameter seen as a subclass but given the base class's `this`
  (glimmer's `acceptCallNodes`), one seen as a boolean but given objects (handlebars' `preparePath`), a key seen as a
  text but given numbers (meriyah's `getOwnProperty`), and a parameter seen as an array but given a generator (yaml's
  `compose`). These were removed from the copies by hand.
- A JSDoc type on a parameter of an arrow function that is passed to a method of an array of anything
  (postcss-less), which nts compiles as a parameter of the array's element type; removed.
- Places where nts compiled correct types wrongly, which were fixed in nts: an array given as one argument of a rest
  parameter (yaml-unist-parser's `tokens`), a slice to an element past the end of an array (micromark's
  subtokenizer, which looped forever), and `concat` on an array literal of a JavaScript file.

## 9. Measuring

Time the plugin against Prettier on the same files, as `docs/performance.md` of nts does: a copy of DefinitelyTyped
that Prettier from npm has formatted, checked with `dprint check --incremental=false` and `DPRINT_MAX_THREADS=1`
against `prettier --check` (and with all threads), and the same for files of the other languages. A file that takes
far longer than the others points at something quadratic, which a wrong or missing type can cause; at 3.9.10 a
missing type made one file of DefinitelyTyped take 86 seconds instead of half of one. Write the results and anything
learned in `docs/performance.md` of nts.
