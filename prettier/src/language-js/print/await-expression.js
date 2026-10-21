// @nts-check
import { group, indent, softline } from "../../document/index.js";
import {
  isCallExpression,
  isMemberExpression,
} from "../utilities/node-types.js";
import { startsWithNoLookaheadToken } from "../utilities/starts-with-no-lookahead-token.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

function printAwaitExpression(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  /** @type{Doc[]} */
  let parts = ["await"];
  if (node.argument) {
    parts.push(" ", print("argument"));
    /** @type {{ parent: import("../types/estree.js").Node }} */ const { parent } = path;
    if (
      (isCallExpression(parent) && parent.callee === node) ||
      (isMemberExpression(parent) && parent.object === node)
    ) {
      parts = [indent([softline, ...parts]), softline];
      // avoid printing `await (await` on one line
      const parentAwaitOrBlock = path.findAncestor(
        /** @returns {boolean} */ (node) =>
          node.type === "AwaitExpression" || node.type === "BlockStatement",
      );
      if (
        parentAwaitOrBlock?.type !== "AwaitExpression" ||
        !startsWithNoLookaheadToken(
          parentAwaitOrBlock.argument,
          /** @returns {boolean} */ (leftmostNode) => leftmostNode === node,
        )
      ) {
        return group(parts);
      }
    }
  }
  return parts;
}

export { printAwaitExpression };
