// Moves the keys of one module in src/sites.json from where its reads were in the old text of the module to where
// they are in the new one, through the lines that the two have in common. The texts are those that nts compiles,
// which NTS_REACH_DUMP writes (see "The profiles" in docs/upgrading.md). Keys on lines that changed are dropped.
//
// usage: deno run -A scripts/move-site-keys.ts <sites.json> <module key prefix> <old dumped text> <new dumped text>
const [sitesPath, prefix, oldPath, newPath] = Deno.args;
const sitesText = Deno.readTextFileSync(sitesPath);
const sites: Record<string, unknown> = JSON.parse(sitesText);
const oldText = Deno.readTextFileSync(oldPath);
const newText = Deno.readTextFileSync(newPath);
const oldLines = oldText.split("\n");
const newLines = newText.split("\n");
const lineMap = matchLines(oldLines, newLines);
const oldStarts = lineStarts(oldLines);
const newStarts = lineStarts(newLines);

// keys are replaced in the text, to keep the file's formatting
const newKeys = new Map<string, string | undefined>();
let moved = 0;
let dropped = 0;
for (const key of Object.keys(sites)) {
  if (!key.startsWith(prefix + "@")) {
    continue;
  }
  const offset = Number(key.slice(prefix.length + 1));
  const line = findLine(oldStarts, offset);
  const newLine = lineMap.get(line);
  if (newLine == null) {
    dropped++;
    newKeys.set(key, undefined);
    console.error(`dropped ${key}: ${oldLines[line].trim()}`);
    continue;
  }
  const newOffset = newStarts[newLine] + (offset - oldStarts[line]);
  const name = /^[\w$]+/.exec(oldText.slice(offset))?.[0];
  if (name == null || !newText.startsWith(name, newOffset)) {
    throw new Error(`${key} does not land on ${name}`);
  }
  newKeys.set(key, `${prefix}@${newOffset}`);
  moved++;
}
const outLines = sitesText.split("\n").flatMap((line) => {
  const key = /^\s*"([^"]+)":/.exec(line)?.[1];
  if (key == null || !newKeys.has(key)) {
    return [line];
  }
  const newKey = newKeys.get(key);
  return newKey == null ? [] : [line.replace(`"${key}"`, `"${newKey}"`)];
});
const outText = outLines.join("\n");
// the profile must still be one object with the same number of moved entries
if (Object.keys(JSON.parse(outText)).length !== Object.keys(sites).length - dropped) {
  throw new Error("entries were lost");
}
Deno.writeTextFileSync(sitesPath, outText);
console.error(`moved ${moved}, dropped ${dropped}`);

function matchLines(a: string[], b: string[]): Map<number, number> {
  const lengths = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lengths[i][j] = a[i] === b[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }
  const map = new Map<number, number>();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      map.set(i++, j++);
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return map;
}

function lineStarts(lines: string[]): number[] {
  const starts = [];
  let offset = 0;
  for (const line of lines) {
    starts.push(offset);
    offset += line.length + 1;
  }
  return starts;
}

function findLine(starts: number[], offset: number): number {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (starts[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return low;
}
