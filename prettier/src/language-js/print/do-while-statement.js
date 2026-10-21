import { group, hardline } from "../../document/index.js";
import { printDoWhileStatementBody } from "./clause.js";
import {
  printDoWhileStatementCondition,
  printSemicolon,
} from "./miscellaneous.js";

function printDoWhileStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  return [
    group(["do", printDoWhileStatementBody(path, options, print)]),
    path.node.body.type === "BlockStatement" ? " " : hardline,
    "while (",
    printDoWhileStatementCondition(path, options, print),
    ")",
    printSemicolon(options),
  ];
}

export { printDoWhileStatement };
