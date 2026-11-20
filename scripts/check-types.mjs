// Checks that the types of prettier's source and the vendored copies were not lost, against a commit such as the one
// before an upgrade:
//   node scripts/check-types.mjs <commit> [--types-only]
// It fails when a package (a folder such as prettier/src/language-css or src/vendor/postcss) has fewer JSDoc type
// annotations than at the commit or when a file lost its `// @nts-check`, and lists the files that are new since the
// commit and don't have one, which need types if nts compiles them (a file that the plugin never imports doesn't). With --types-only it also fails when a changed file has other changes than comments and the
// parentheses of casts, which their syntax trees without comments and places show, for checking added types.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import url from "node:url";

const rootDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const [commit, mode] = process.argv.slice(2);
if (commit == null) {
  throw new Error("Give the commit to compare with, such as the one before the upgrade.");
}
const folders = ["src", "prettier/src"];
const tags = /@(type|returns|param|typedef|this|template|import|property|callback|satisfies)\b/g;
const checkDirective = "// @nts-check";
const git = (...args) => execFileSync("git", args, { cwd: rootDir, encoding: "utf8", maxBuffer: 1 << 30 });
const isCode = file => /\.(m?js|cjs|ts)$/.test(file) && !file.endsWith(".d.ts");
const count = text => text.match(tags)?.length ?? 0;
// the copies of glimmer's packages, which glimmer 0.97 bundles into one
const packageOf = file =>
  /^src\/(vendor\/(glimmer|handlebars-parser|simple-html-tokenizer)|shims\/glimmer)/.test(file)
    ? "glimmer and what it bundles"
    : file.split("/").slice(0, 3).join("/");

const oldFiles = git("ls-tree", "-r", "--name-only", commit, "--", ...folders).split("\n").filter(isCode);
const newFiles = git("ls-files", "--cached", "--others", "--exclude-standard", "--", ...folders).split("\n")
  .filter(isCode).filter(file => fs.existsSync(path.join(rootDir, file)));
const oldText = file => git("show", `${commit}:${file}`);
const newText = file => fs.readFileSync(path.join(rootDir, file), "utf8");
const problems = [];
const unchecked = [];

const totals = new Map();
const add = (file, index, n) => {
  const row = totals.get(packageOf(file)) ?? [0, 0];
  row[index] += n;
  totals.set(packageOf(file), row);
};
const oldChecked = new Set();
for (const file of oldFiles) {
  const text = oldText(file);
  add(file, 0, count(text));
  if (text.includes(checkDirective)) oldChecked.add(file);
}
const checkedPackages = new Set([...oldChecked].map(packageOf));
const oldSet = new Set(oldFiles);
for (const file of newFiles) {
  const text = newText(file);
  add(file, 1, count(text));
  if (oldChecked.has(file) && !text.includes(checkDirective)) {
    problems.push(`${file} lost its ${checkDirective}`);
  }
  if (!oldSet.has(file) && checkedPackages.has(packageOf(file)) && !text.includes(checkDirective)) {
    unchecked.push(file);
  }
}
let before = 0;
let after = 0;
for (const [name, [old, now]] of totals) {
  before += old;
  after += now;
  if (now < old) problems.push(`${name} has ${now} type annotations, ${old - now} fewer than at ${commit}`);
}
console.log(`type annotations: ${before} at ${commit}, ${after} now`);

if (mode === "--types-only") {
  const require = createRequire(path.join(rootDir, "prettier/package.json"));
  const { parse } = require("@babel/parser");
  const ignored = new Set([
    "start",
    "end",
    "loc",
    "range",
    "extra",
    "comments",
    "leadingComments",
    "trailingComments",
    "innerComments",
  ]);
  const codeOf = (text, file) =>
    JSON.stringify(
      parse(text, {
        sourceType: file.endsWith(".cjs") ? "script" : "unambiguous",
        allowReturnOutsideFunction: true,
        plugins: file.endsWith(".ts") ? ["typescript"] : ["jsx"],
      }).program,
      (key, value) => (ignored.has(key) ? undefined : value),
    );
  for (const file of git("diff", "--name-only", commit, "--", ...folders).split("\n").filter(isCode)) {
    if (!oldSet.has(file) || !fs.existsSync(path.join(rootDir, file))) continue;
    try {
      if (codeOf(newText(file), file) !== codeOf(oldText(file), file)) {
        problems.push(`${file} has other changes than types`);
      }
    } catch (error) {
      problems.push(`${file} doesn't parse: ${error.message}`);
    }
  }
}

if (unchecked.length > 0) {
  console.log(`new files without ${checkDirective}, in packages whose files have it:`);
  for (const file of unchecked) console.log(`  ${file}`);
}
if (problems.length > 0) console.log("problems:");
for (const problem of problems) console.log(`  ${problem}`);
if (problems.length > 0) {
  process.exitCode = 1;
}
