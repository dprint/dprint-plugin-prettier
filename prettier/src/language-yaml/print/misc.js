// @nts-check
import { align, softline } from "../../document/index.js";
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { hasEndComments, isNextLineEmpty, isNode } from "../utilities.js";

/** @import AstPath from "../../common/ast-path.js" */
/** @import { YamlNode } from "../../../../src/vendor/yaml-unist-parser/transforms/context.mjs" */

const printedEmptyLineCache = new WeakMap();
const getNextEmptyLinePrintedSet = (path) =>
  getOrInsertComputed(printedEmptyLineCache, path.root, () => new Set());
const markNextEmptyLinePrinted = (path, node = path.node) => {
  getNextEmptyLinePrintedSet(path).add(node.position.end.offset);
};
const hasNextEmptyLineBeenPrinted = (path, node = path.node) =>
  getNextEmptyLinePrintedSet(path).has(node.position.end.offset);

function printNextEmptyLine(/** @type {AstPath} */ path, /** @type {string} */ originalText) {
  if (!hasNextEmptyLineBeenPrinted(path)) {
    markNextEmptyLinePrinted(path);

    /** @type {{ node: YamlNode }} */ const { node } = path;
    if (
      isNextLineEmpty(node, originalText) &&
      !shouldPrintEndComments(path.parent)
    ) {
      return softline;
    }
  }

  return "";
}

/** @returns {boolean} */ function shouldPrintEndComments(/** @type {YamlNode | null | undefined} */ node) {
  return (
    hasEndComments(node) &&
    !isNode(node, [
      "documentHead",
      "documentBody",
      "flowMapping",
      "flowSequence",
    ])
  );
}

function alignWithSpaces(/** @type {number} */ width, doc) {
  return align(" ".repeat(width), doc);
}

export {
  alignWithSpaces,
  markNextEmptyLinePrinted,
  printNextEmptyLine,
  shouldPrintEndComments,
};
