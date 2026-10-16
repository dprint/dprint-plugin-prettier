// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import { align, softline } from "../../document/builders.js";
import { hasEndComments, isNextLineEmpty, isNode } from "../utils.js";

const printedEmptyLineCache = new WeakMap();
function printNextEmptyLine(/** @type {AstPath} */ path, /** @type {string} */ originalText) {
  const { node, root } = path;

  let isNextEmptyLinePrintedSet;
  if (printedEmptyLineCache.has(root)) {
    isNextEmptyLinePrintedSet = printedEmptyLineCache.get(root);
  } else {
    isNextEmptyLinePrintedSet = new Set();
    printedEmptyLineCache.set(root, isNextEmptyLinePrintedSet);
  }

  if (!isNextEmptyLinePrintedSet.has(node.position.end.line)) {
    isNextEmptyLinePrintedSet.add(node.position.end.line);
    if (
      isNextLineEmpty(node, originalText) &&
      !shouldPrintEndComments(path.parent)
    ) {
      return softline;
    }
  }

  return "";
}

/** @returns {boolean} */ function shouldPrintEndComments(node) {
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

export { alignWithSpaces, printNextEmptyLine, shouldPrintEndComments };
