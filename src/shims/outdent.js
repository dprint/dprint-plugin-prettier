// @nts-check
// removes the indentation that a template has from being written inside of indented code
/**
 * @param {readonly string[]} strings
 * @param {...string} values
 * @returns {string}
 */
export function outdent(strings, ...values) {
  let text = strings[0];
  for (let i = 0; i < values.length; i++) {
    text += values[i] + strings[i + 1];
  }
  /** @type {string[]} */ const lines = text.split("\n");
  if (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }
  if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  /** @type {number} */ let indent = -1;
  for (const line of lines) {
    if (line.trim() !== "") {
      /** @type {number} */ const count = line.length - line.trimStart().length;
      indent = indent === -1 || count < indent ? count : indent;
    }
  }
  return lines.map((line) => line.slice(indent === -1 ? 0 : indent)).join("\n");
}
