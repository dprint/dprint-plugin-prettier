// @nts-check
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";

const isElementWithNgNonBindable = /** @returns {boolean} */ (/** @type {import("../parse/ast.js").Node} */ node) =>
  node?.kind === "element" && Object.hasOwn(node.attrMap, "ngNonBindable");

const angularNonBindableCache = new WeakMap();
const hasOrInNgNonBindableInternal = /** @returns {boolean} */ (/** @type {import("../parse/ast.js").Node | undefined} */ node) =>
  Boolean(node) &&
  getOrInsertComputed(
    angularNonBindableCache,
    node,
    /** @returns {boolean} */ (node) =>
      isElementWithNgNonBindable(node) ||
      hasOrInNgNonBindableInternal(node.parent),
  );

const hasOrInNgNonBindable = /** @returns {boolean} */ (/** @type {import("../parse/ast.js").Node} */ node, options) =>
  options.parser === "angular" && hasOrInNgNonBindableInternal(node);

export { hasOrInNgNonBindable };
