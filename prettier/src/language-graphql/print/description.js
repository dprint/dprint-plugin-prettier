// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import { hardline, line } from "../../document/builders.js";

function printDescription(/** @type {AstPath} */ path, options, /** @type {(a0?: any) => any} */ print) {
  const { node } = path;
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

export default printDescription;
