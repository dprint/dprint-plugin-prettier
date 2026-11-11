import { indent, softline } from "../../document/index.js";
import hasNewline from "../../utilities/has-newline.js";
import { locEnd, locStart } from "../location/index.js";
import { isBlockComment } from "../utilities/comment-types.js";
import { hasComment } from "../utilities/comments.js";

function printTryStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  return [
    "try ",
    print("block"),
    node.handler ? [" ", print("handler")] : "",
    node.finalizer ? [" finally ", print("finalizer")] : "",
  ];
}

function printCatchClause(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  if (node.param) {
    /** @type {boolean} */ const parameterHasComments = hasComment(
      node.param,
      (comment) =>
        !isBlockComment(comment) ||
        (comment.leading &&
          hasNewline(options.originalText, locEnd(comment))) ||
        (comment.trailing &&
          hasNewline(options.originalText, locStart(comment), {
            backwards: true,
          })),
    );
    const param = print("param");

    return [
      "catch ",
      parameterHasComments
        ? ["(", indent([softline, param]), softline, ") "]
        : ["(", param, ") "],
      print("body"),
    ];
  }

  return ["catch ", print("body")];
}

export { printCatchClause, printTryStatement };
