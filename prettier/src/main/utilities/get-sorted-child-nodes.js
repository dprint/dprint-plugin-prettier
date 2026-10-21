// @nts-check
import { getChildren } from "../../utilities/ast.js";
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";

/**
 * what the comments and the range code give to find the children of a node, in the order of the text
 * @typedef {{
 *   cache: WeakMap<any, any>,
 *   locStart: (node: any) => number,
 *   locEnd: (node: any) => number,
 *   getVisitorKeys: any,
 *   filter?: (node: any, ancestors?: any[]) => any,
 *   getChildren?: (node: any, options: any) => any,
 * }} SortedChildNodesOptions
 */

/** @returns {any[]} */ function getSortedChildNodesWithoutCache(node, /** @type {any[]} */ ancestors, /** @type {SortedChildNodesOptions} */ options) {
  const { filter } = options;

  if (!filter) {
    return [];
  }

  /** @type {any[] | undefined} */ let childAncestors;
  const childNodes = (
    options.getChildren?.(node, options) ?? [
      ...getChildren(node, { getVisitorKeys: options.getVisitorKeys }),
    ]
  ).flatMap((child) => {
    childAncestors ??= [node, ...ancestors];
    return filter(child, childAncestors)
      ? [child]
      : getSortedChildNodes(child, childAncestors, options);
  });

  const { locStart, locEnd } = options;

  // Sort by `start` location first, then `end` location
  childNodes.sort(
    /** @returns {number} */ (nodeA, nodeB) =>
      locStart(nodeA) - locStart(nodeB) || locEnd(nodeA) - locEnd(nodeB),
  );

  return childNodes;
}

/** @returns {any[]} */ function getSortedChildNodes(node, /** @type {any[]} */ ancestors, /** @type {SortedChildNodesOptions} */ options) {
  return getOrInsertComputed(options.cache, node, (node) =>
    getSortedChildNodesWithoutCache(node, ancestors, options),
  );
}

export default getSortedChildNodes;
