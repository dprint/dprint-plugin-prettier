// Carries the JSDoc types that were added to an old version of a file over to its new version, for upgrading
// prettier's TypeScript parser (src/prettier-plugins) or a library in src/vendor:
//   node scripts/carry-types.mjs <old untyped> <old typed> <new> <out>
// Lines are lined up with their names left out, so that the minified names of a bundle may differ between the
// versions; the comments go in front of the same tokens of the new line, and the names in them are renamed to what
// the new version calls them. The types of lines that were not lined up are written to <out>.unmatched.txt. Set
// CARRY_CONTEXT to a number of lines around a line that have to line up as well, for where the code changed.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [oldPath, typedPath, newPath, outPath] = process.argv.slice(2);
const oldLines = fs.readFileSync(oldPath, "utf8").split("\n");
const typedLines = fs.readFileSync(typedPath, "utf8").split("\n");
const newLines = fs.readFileSync(newPath, "utf8").split("\n");
const keywords = new Set(
  ("break case catch class const continue debugger default delete do else export extends finally for function if "
    + "import in instanceof new return super switch this throw try typeof var void while with yield let static async "
    + "await of get set null true false undefined").split(" "),
);
// names in types that are not the bundle's own
const typeWords = new Set(
  ("int number string boolean any unknown void undefined null object never true false Array ReadonlyArray Map Set "
    + "WeakSet WeakMap Record InstanceType ReturnType Parameters Promise Function RegExp Symbol Error typeof readonly "
    + "keyof Object String Number Boolean Iterable IterableIterator Generator").split(" "),
);
const tagWords = new Set(["type", "returns", "param", "template", "inline"]);

const typedOf = pairTypedLines();
const newOf = pairLines(oldLines.map(normalizeLine), newLines.map(normalizeLine));
const votes = new Map();
for (const [o, n] of newOf) {
  const oldNames = names(oldLines[o]);
  const newNames = names(newLines[n]);
  if (oldNames.length !== newNames.length) continue;
  for (let i = 0; i < oldNames.length; i++) {
    const counts = votes.get(oldNames[i]) ?? new Map();
    counts.set(newNames[i], (counts.get(newNames[i]) ?? 0) + 1);
    votes.set(oldNames[i], counts);
  }
}
const stats = { typed: 0, carried: 0, unmatched: 0, notComments: 0, unnamed: 0 };
const unnamed = new Map();
const unmatchedLines = [];
const out = [...newLines];
for (const [o, typed] of typedOf) {
  stats.typed++;
  const n = newOf.get(o);
  // only where the lines around it are the same too, as a line where the code changed may line up with another
  const context = Number(process.env.CARRY_CONTEXT ?? "0");
  let isInContext = true;
  for (let k = 1; k <= context; k++) {
    if (newOf.get(o - k) !== n - k || newOf.get(o + k) !== n + k) isInContext = false;
  }
  if (n === undefined || !isInContext) {
    stats.unmatched++;
    unmatchedLines.push(typed);
    continue;
  }
  const carried = carry(oldLines[o], typed, newLines[n]);
  if (carried === "comments") stats.notComments++;
  else if (carried == null) stats.unnamed++;
  else {
    out[n] = carried;
    stats.carried++;
  }
}
if (typedLines[0].startsWith("// @nts-check") && !out[0].startsWith("// @nts-check")) out.unshift("// @nts-check");
fs.writeFileSync(outPath, out.join("\n"));
fs.writeFileSync(outPath + ".unmatched.txt", unmatchedLines.join("\n"));
console.log(stats);
console.log([...unnamed].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => k + ":" + v).join(" "));

/** Puts the comments that the typed line has and the untyped one does not in front of the same tokens of the new line. */
function carry(oldLine, typedLine, newLine) {
  const comments = [];
  const stripped = typedLine.replace(/\/\*\*(?:(?!\*\/).)*\*\/\s*/g, (comment, offset) => {
    comments.push({ comment, offset });
    return "";
  });
  if (stripped !== oldLine || comments.length === 0) return "comments";
  const oldTokens = tokens(oldLine);
  const newTokens = tokens(newLine);
  if (oldTokens.length !== newTokens.length) return "comments";
  const local = new Map();
  oldTokens.forEach((token, i) => {
    if (token.isName) local.set(token.text, newTokens[i].text);
  });
  // where each comment goes, as the token that it comes in front of
  let removed = 0;
  const placed = [];
  for (const { comment, offset } of comments) {
    const at = offset - removed;
    removed += comment.length;
    const index = oldTokens.findIndex(token => token.start >= at);
    const renamed = rename(comment, local);
    if (renamed == null) return null;
    placed.push({ index: index < 0 ? oldTokens.length : index, text: renamed });
  }
  let result = newLine;
  for (const { index, text } of placed.reverse()) {
    const position = index < newTokens.length ? newTokens[index].start : newLine.length;
    result = result.slice(0, position) + text + result.slice(position);
  }
  return result;
}

/** Renames the bundle's names in a comment, or gives nothing when one of them is not known. */
function rename(comment, local) {
  let failed = false;
  const renamed = comment.replace(/(@|\.\s*)?([A-Za-z_$][\w$]*)(\??\s*:)?/g, (all, before, name, colon) => {
    if (before != null || colon != null || typeWords.has(name) || tagWords.has(name)) {
      return all;
    }
    const mapped = local.get(name) ?? globalName(name);
    if (mapped == null) {
      failed = true;
      unnamed.set(name, (unnamed.get(name) ?? 0) + 1);
      return all;
    }
    return mapped;
  });
  return failed ? null : renamed;
}

/** What the new bundle calls a name, when nearly all of the lines that have it agree. */
function globalName(name) {
  const counts = votes.get(name);
  if (counts == null) return undefined;
  let total = 0;
  let best;
  let bestCount = 0;
  for (const [candidate, count] of counts) {
    total += count;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return bestCount >= 2 && bestCount >= total * 0.8 ? best : undefined;
}

/** The lines of the old typed bundle that differ from the untyped one, by the index of the untyped line. */
function pairTypedLines() {
  const pairs = new Map();
  for (const hunk of diffHunks(oldLines, typedLines)) {
    if (hunk.oldCount !== hunk.newCount) continue;
    for (let i = 0; i < hunk.oldCount; i++) pairs.set(hunk.oldStart + i, typedLines[hunk.newStart + i]);
  }
  return pairs;
}

/** Maps the index of each line of the first text to the line of the second that it is the same as. */
function pairLines(a, b) {
  const pairs = new Map();
  let i = 0;
  let j = 0;
  for (const hunk of diffHunks(a, b)) {
    while (i < hunk.oldStart) pairs.set(i++, j++);
    i = hunk.oldStart + hunk.oldCount;
    j = hunk.newStart + hunk.newCount;
  }
  while (i < a.length && j < b.length) pairs.set(i++, j++);
  return pairs;
}

function diffHunks(a, b) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "carry-"));
  fs.writeFileSync(path.join(dir, "a"), a.join("\n"));
  fs.writeFileSync(path.join(dir, "b"), b.join("\n"));
  let output;
  try {
    output = execFileSync(
      "git",
      ["diff", "--no-index", "--histogram", "-U0", "--no-color", path.join(dir, "a"), path.join(dir, "b")],
      { encoding: "utf8", maxBuffer: 1 << 30 },
    );
  } catch (error) {
    output = error.stdout;
  }
  fs.rmSync(dir, { recursive: true });
  const hunks = [];
  for (const line of output.split("\n")) {
    const match = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (match == null) continue;
    const oldCount = match[2] == null ? 1 : Number(match[2]);
    const newCount = match[4] == null ? 1 : Number(match[4]);
    // a hunk of no lines is placed after the line it names
    hunks.push({
      oldStart: oldCount === 0 ? Number(match[1]) : Number(match[1]) - 1,
      oldCount,
      newStart: newCount === 0 ? Number(match[3]) : Number(match[3]) - 1,
      newCount,
    });
  }
  return hunks;
}

function normalizeLine(line) {
  return line.replace(/(\.\s*)?(#?[A-Za-z_$][\w$]*)(\s*:)?/g, (all, dot, name, colon) =>
    dot != null || keywords.has(name) ? all : "_" + (colon ?? ""));
}

/** The names of a line that are not property names, in order. */
function names(line) {
  return tokens(line).filter(token => token.isName).map(token => token.text);
}

function tokens(line) {
  const result = [];
  const pattern = /(\.\s*)?(#?[A-Za-z_$][\w$]*)(\s*:)?|\d[\w.]*|\S/g;
  let match;
  while ((match = pattern.exec(line)) != null) {
    if (match[2] != null) {
      const start = match.index + (match[1]?.length ?? 0);
      const isName = match[1] == null && !keywords.has(match[2]);
      if (match[1] != null) result.push({ text: ".", start: match.index, isName: false });
      result.push({ text: match[2], start, isName });
      if (match[3] != null) {
        result.push({ text: ":", start: start + match[2].length + match[3].length - 1, isName: false });
      }
    } else {
      result.push({ text: match[0], start: match.index, isName: false });
    }
  }
  return result;
}
