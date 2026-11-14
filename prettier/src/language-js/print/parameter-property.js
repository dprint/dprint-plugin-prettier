// @nts-check
import { printAssignment } from "./assignment.js";
import {
  printDeclareToken,
  printOptionalToken,
  printTypeScriptAccessibilityToken,
} from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/*
- `TSParameterProperty` (TypeScript)
- `ParameterProperty` (Flow)
*/
/** @returns {import("../../document/index.js").Doc} */ function printParameterProperty(/** @type {import("../../common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  const parts = [
    printDeclareToken(path),
    printTypeScriptAccessibilityToken(node),
    node.static ? "static " : "",
    node.override ? "override " : "",
    node.readonly ? "readonly " : "",
    node.variance ? print("variance") : "",
  ];

  if (node.type === "TSParameterProperty") {
    return [...parts, print("parameter")];
  }

  parts.push(
    print("key"),
    printOptionalToken(path),
    printTypeAnnotationProperty(path, print),
  );

  return printAssignment(path, options, print, parts, " =", "value");
}

export { printParameterProperty };
