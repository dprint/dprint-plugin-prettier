import { group, indent, line, softline } from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { printForXStatementBody } from "./clause.js";

function printForStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  const body = printForXStatementBody(path, options, print);

  // We want to keep dangling comments above the loop to stay consistent.
  // Any comment positioned between the for statement and the parentheses
  // is going to be printed before the statement.
  const dangling = printDanglingComments(path, options);
  const printedComments = dangling ? [dangling, softline] : "";

  if (!node.init && !node.test && !node.update) {
    return [printedComments, group(["for (;;)", body])];
  }

  return [
    printedComments,
    group([
      "for (",
      group([
        indent([
          softline,
          print("init"),
          ";",
          line,
          print("test"),
          ";",
          node.update ? [line, print("update")] : "",
        ]),
        softline,
      ]),
      ")",
      body,
    ]),
  ];
}

export { printForStatement };
