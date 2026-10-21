// @nts-check
import { isChainElementWrapper } from "./node-types.js";

/**
@import {
  Node,
  NodeMap,
} from "../types/estree.js";
*/

/**
@param {import("../types/estree.js").Node} node
@returns {import("../types/estree.js").Node}
*/
function stripChainElementWrappers(node) {
  while (isChainElementWrapper(node)) {
    node = node.expression;
  }

  return node;
}

export { stripChainElementWrappers };
