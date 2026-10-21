import { group } from "../../document/index.js";
import { printWhileStatementBody } from "./clause.js";
import { printWhileStatementCondition } from "./miscellaneous.js";

function printWhileStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  const { node } = path;
  const keyword = node.type === "WithStatement" ? "with" : "while";

  return group([
    keyword,
    " (",
    printWhileStatementCondition(path, options, print),
    ")",
    printWhileStatementBody(path, options, print),
  ]);
}

export { printWhileStatement };
