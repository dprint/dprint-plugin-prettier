// @nts-check
/** @import {GraphqlNode, GraphqlOptions, GraphqlPrint} from "../print-types.js" */
import { hardline, line } from "../../document/index.js";

/** @import AstPath from "../../common/ast-path.js" */

function printDescription(/** @type {AstPath} */ path, /** @type {GraphqlOptions} */ options, /** @type {(a0?: any) => any} */ print) {
  /** @type {{ node: GraphqlNode }} */ const { node } = path;
  if (!node.description) {
    return "";
  }

  const parts = [print("description")];
  if (node.kind === "InputValueDefinition" && !node.description.block) {
    parts.push(line);
  } else {
    parts.push(hardline);
  }

  return parts;
}

export { printDescription };
