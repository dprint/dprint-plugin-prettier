import { isNumericLiteral } from "./node-types.js";

/**
@import {
  Node,
  NodeMap,
  NumericLiteral,
} from "../types/estree.js";
*/

/**
@param {Node} node
@returns {boolean}}
*/
function isSignedNumericLiteral(node) {
  return (
    node.type === "UnaryExpression" &&
    (node.operator === "+" || node.operator === "-") &&
    isNumericLiteral(node.argument)
  );
}

export { isSignedNumericLiteral };
