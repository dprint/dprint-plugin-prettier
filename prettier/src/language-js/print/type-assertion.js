import {
  conditionalGroup,
  group,
  ifBreak,
  indent,
  softline,
} from "../../document/index.js";
import {
  isArrayExpression,
  isObjectExpression,
} from "../utilities/node-types.js";

/*
- `TSTypeAssertion` (TypeScript)
*/
function printTypeAssertion(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  /** @type {boolean} */ const shouldBreakAfterCast = !(
    isArrayExpression(node.expression) || isObjectExpression(node.expression)
  );

  const castGroup = group([
    "<",
    indent([softline, print("typeAnnotation")]),
    softline,
    ">",
  ]);

  const exprContents = [
    ifBreak("("),
    indent([softline, print("expression")]),
    softline,
    ifBreak(")"),
  ];

  if (shouldBreakAfterCast) {
    return conditionalGroup([
      [castGroup, print("expression")],
      [castGroup, group(exprContents, { shouldBreak: true })],
      [castGroup, print("expression")],
    ]);
  }
  return group([castGroup, print("expression")]);
}

export { printTypeAssertion };
