import { group, indent, line } from "../../document/index.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
- `DeclareOpaqueType`(flow)
- `OpaqueType`(flow)
*/
function printOpaqueType(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  const parts = [
    printDeclareToken(path),
    "opaque type ",
    print("id"),
    print("typeParameters"),
  ];

  if (node.supertype) {
    parts.push(": ", print("supertype"));
  }

  if (node.lowerBound || node.upperBound) {
    const lowerAndUpperBoundParts = [];
    if (node.lowerBound) {
      lowerAndUpperBoundParts.push(
        indent([line, "super ", print("lowerBound")]),
      );
    }
    if (node.upperBound) {
      lowerAndUpperBoundParts.push(
        indent([line, "extends ", print("upperBound")]),
      );
    }
    parts.push(group(lowerAndUpperBoundParts));
  }

  if (node.impltype) {
    parts.push(" = ", print("impltype"));
  }

  parts.push(printSemicolon(options));

  return parts;
}

export { printOpaqueType };
