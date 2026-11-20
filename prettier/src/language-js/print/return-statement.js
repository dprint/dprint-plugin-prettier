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

/** @returns {Doc} */ function printArgumentNode(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
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

function printArgument(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  if (!path.node.argument) {
    return "";
  }

  return [
    " ",
    path.call(() => printArgumentNode(path, options, print), "argument"),
  ];
}

function printReturnStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  return [
    "return",
    printArgument(path, options, print),
    printSemicolon(options),
  ];
}

function printThrowStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  return [
    "throw",
    printArgument(path, options, print),
    printSemicolon(options),
  ];
}

function printYieldExpression(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  return [
    "yield",
    path.node.delegate ? "*" : "",
    printArgument(path, options, print),
  ];
}

export { printReturnStatement, printThrowStatement, printYieldExpression };
