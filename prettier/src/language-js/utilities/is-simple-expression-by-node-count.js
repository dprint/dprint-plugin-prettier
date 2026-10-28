import isObject from "../../utilities/is-object.js";

/** @returns {number} */ function getExpressionInnerNodeCount(/** @type {import("../types/estree.js").Node} */ node, /** @type {number} */ maxCount) {
  let count = 0;
  for (const k in node) {
    const prop = node[k];

    if (isObject(prop) && typeof prop.type === "string") {
      count++;
      count += getExpressionInnerNodeCount(prop, maxCount - count);
    }

    // Bail early to protect against bad performance.
    if (count > maxCount) {
      return count;
    }
  }
  return count;
}

/**
 * Attempts to gauge the rough complexity of a node, for example
 * to detect deeply-nested booleans, call expressions with lots of arguments, etc.
 */
function isSimpleExpressionByNodeCount(/** @type {import("../types/estree.js").Node} */ node, maxInnerNodeCount = 5) {
  const count = getExpressionInnerNodeCount(node, maxInnerNodeCount);
  return count <= maxInnerNodeCount;
}

export { isSimpleExpressionByNodeCount };
