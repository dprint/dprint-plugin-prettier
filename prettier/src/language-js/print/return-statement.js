import {
  group,
  hardline,
  ifBreak,
  indent,
  softline,
} from "../../document/index.js";
import { isBinaryish } from "../utilities/node-types.js";
import { returnArgumentHasLeadingComment } from "../utilities/return-statement-has-leading-comment.js";
import { printSemicolon } from "./miscellaneous.js";

/** @import AstPath from "../../common/ast-path.js" */

/**
@import {Doc} from "../../document/index.js";
*/

/** @returns {Doc} */ function printReturnOrThrowArgument(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  const argumentDoc = print();

  if (returnArgumentHasLeadingComment(node, options)) {
    return ["(", indent([hardline, argumentDoc]), hardline, ")"];
  }

  if (
    isBinaryish(node) ||
    (options.experimentalTernaries &&
      node.type === "ConditionalExpression" &&
      (node.consequent.type === "ConditionalExpression" ||
        node.alternate.type === "ConditionalExpression"))
  ) {
    return group([
      ifBreak("("),
      indent([softline, argumentDoc]),
      softline,
      ifBreak(")"),
    ]);
  }

  return argumentDoc;
}

// `ReturnStatement` and `ThrowStatement`
function printReturnOrThrowStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  return [
    node.type === "ThrowStatement" ? "throw" : "return",
    node.argument
      ? [
          " ",
          path.call(
            () => printReturnOrThrowArgument(path, options, print),
            "argument",
          ),
        ]
      : "",
    printSemicolon(options),
  ];
}

export {
  printReturnOrThrowStatement as printReturnStatement,
  printReturnOrThrowStatement as printThrowStatement,
};
