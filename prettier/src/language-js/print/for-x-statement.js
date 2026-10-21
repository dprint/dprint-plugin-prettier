import { group } from "../../document/index.js";
import { printForXStatementBody } from "./clause.js";

function printForXStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  const { node } = path;
  const isForOfStatement = node.type === "ForOfStatement";
  return group([
    "for",
    isForOfStatement && node.await ? " await" : "",
    " (",
    print("left"),
    " ",
    isForOfStatement ? "of" : "in",
    " ",
    print("right"),
    ")",
    printForXStatementBody(path, options, print),
  ]);
}

export { printForXStatement };
