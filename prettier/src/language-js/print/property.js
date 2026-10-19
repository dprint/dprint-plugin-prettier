// @nts-check
import { printAssignment } from "./assignment.js";
import { printKey } from "./key.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
- `Property`
- `ObjectProperty`
- `ImportAttribute`
*/
function printProperty(/** @type {AstPath} */ path, options, print) {
  const { node } = path;
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
