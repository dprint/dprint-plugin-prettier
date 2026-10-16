// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import {
  hardline,
  ifBreak,
  join,
  line,
  softline,
} from "../../document/builders.js";
import { hasEndComments, isEmptyNode } from "../utils.js";
import { alignWithSpaces, printNextEmptyLine } from "./misc.js";

/** @returns {any[]} */ function printFlowMapping(/** @type {AstPath} */ path, print, options) {
  const { node } = path;
  /** @type {boolean} */ const isMapping = node.type === "flowMapping";
  /** @type {string} */ const openMarker = isMapping ? "{" : "[";
  /** @type {string} */ const closeMarker = isMapping ? "}" : "]";

  /** @type {softline | line} */
  let bracketSpacing = softline;
  if (isMapping && node.children.length > 0 && options.bracketSpacing) {
    bracketSpacing = line;
  }
  const lastItem = node.children.at(-1);
  /** @type {boolean} */ const isLastItemEmptyMappingItem =
    lastItem?.type === "flowMappingItem" &&
    isEmptyNode(lastItem.key) &&
    isEmptyNode(lastItem.value);

  return [
    openMarker,
    alignWithSpaces(options.tabWidth, [
      bracketSpacing,
      printChildren(path, print, options),
      options.trailingComma === "none" ? "" : ifBreak(","),
      hasEndComments(node)
        ? [hardline, join(hardline, path.map(print, "endComments"))]
        : "",
    ]),
    isLastItemEmptyMappingItem ? "" : bracketSpacing,
    closeMarker,
  ];
}

/** @returns {any[]} */ function printChildren(/** @type {AstPath} */ path, /** @type {() => any} */ print, options) {
  return path.map(
    /** @returns {any[]} */ ({ isLast, node, next }) => [
      print(),
      isLast
        ? ""
        : [
            ",",
            line,
            node.position.start.line !== next.position.start.line
              ? printNextEmptyLine(path, options.originalText)
              : "",
          ],
    ],
    "children",
  );
}

export {
  printFlowMapping,
  // Alias
  printFlowMapping as printFlowSequence,
};
