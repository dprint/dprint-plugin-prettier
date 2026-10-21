// @nts-check
import { printAssignment } from "./assignment.js";
import { printKey } from "./key.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
- `Property`
- `ObjectProperty`
- `ImportAttribute`
*/
function printProperty(/** @type {AstPath} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  if (node.shorthand) {
    return print("value");
  }

  return printAssignment(
    path,
    options,
    print,
    printKey(path, options, print),
    ":",
    "value",
  );
}

export { printProperty };
