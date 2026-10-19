// @nts-check
import { isChainElementWrapper } from "./node-types.js";

/**
@import {
  Node,
  NodeMap,
} from "../types/estree.js";
*/

/**
@param {any} node
@returns {any}
*/
function stripChainElementWrappers(node) {
  while (isChainElementWrapper(node)) {
    node = node.expression;
  }

  return node;
}

export { stripChainElementWrappers };
