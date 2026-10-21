// @nts-check
import { align, softline } from "../../document/index.js";
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { hasEndComments, isNextLineEmpty, isNode } from "../utilities.js";

/** @import AstPath from "../../common/ast-path.js" */
/** @import { YamlNode } from "../../../../src/vendor/yaml-unist-parser/transforms/context.mjs" */

const printedEmptyLineCache = new WeakMap();
function printNextEmptyLine(/** @type {AstPath} */ path, /** @type {string} */ originalText) {
  /** @type {{ node: YamlNode, root: any }} */ const { node, root } = path;

  const isNextEmptyLinePrintedSet = getOrInsertComputed(
    printedEmptyLineCache,
    root,
    () => new Set(),
  );

  if (!isNextEmptyLinePrintedSet.has(node.position.end.offset)) {
    isNextEmptyLinePrintedSet.add(node.position.end.offset);
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

export { alignWithSpaces, printNextEmptyLine, shouldPrintEndComments };
