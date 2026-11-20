// @nts-check
import * as assert from "#universal/assert";

/**
@import {Node, Comment, NodeMap, CommentMap} from "../types/estree.js";
*/

/**
@typedef {Node | Comment} NodeOrComment
@typedef {NodeOrComment["type"]} NodeOrCommentTypes
*/

/**
@template {NodeOrCommentTypes[] | readonly NodeOrCommentTypes[]} InputNodeTypes
@param {any} typesArray
*/
function createTypeCheckFunction(typesArray) {
  const types = new Set(typesArray);

  if (process.env.NODE_ENV !== "production") {
    assert.equal(
      typesArray.length,
      types.size,
      "'typesArray' should be unique.",
    );
  }

  /**
  @param {import("../types/estree.js").Node} node
  @returns {node is (NodeMap & CommentMap)[InputNodeTypes[number]]}
  */
  return /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) => types.has(node?.type);
}

export { createTypeCheckFunction };
