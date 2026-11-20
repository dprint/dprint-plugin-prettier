// @nts-check
import { hardline } from "../../document/index.js";
import { isNextLineEmpty } from "../utilities/is-next-line-empty.js";

/**
 * @import {Doc} from "../../document/index.js"
 * @import AstPath from "../../common/ast-path.js")
 * @returns {any[]}
 */

/*
- `Program` ("directives" and "body")
- `BlockStatement`
- `StaticBlock`
- `SwitchCase` ("consequent")
- `TSModuleBlock` (TypeScript)
*/
function printStatementSequence(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print, /** @type {string} */ property) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  const parts = [];
  const lastStatement = /** @type {import("../types/estree.js").Node[]} */ (node[property]).findLast(
    /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ statement) => statement.type !== "EmptyStatement",
  );

  path.each(({ node }) => {
    // Skip printing EmptyStatement nodes to avoid leaving stray
    // semicolons lying around.
    if (node.type === "EmptyStatement") {
      return;
    }

    parts.push(print());

    if (node !== lastStatement) {
      parts.push(hardline);

      if (isNextLineEmpty(node, options)) {
        parts.push(hardline);
      }
    }
  }, property);

  return parts;
}

export { printStatementSequence };
