import { group, indent, join, softline } from "../../document/index.js";
import { printClassMemberSemicolon } from "./class.js";
import { printTrailingComma } from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

function printIndexSignature(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  // The TypeScript parser accepts multiple parameters here. If you're
  // using them, it makes sense to have a trailing comma. But if you
  // aren't, this is more like a computed property name than an array.
  // So we leave off the trailing comma when there's just one parameter.
  const trailingComma =
    node.parameters.length > 1 ? printTrailingComma(options) : "";

  const parametersGroup = group([
    indent([softline, join([", ", softline], path.map(print, "parameters"))]),
    trailingComma,
    softline,
  ]);

  const isClassMember = path.key === "body" && path.parent.type === "ClassBody";

  return [
    // `static` only allowed in class member
    isClassMember && node.static ? "static " : "",
    node.readonly ? "readonly " : "",
    "[",
    node.parameters ? parametersGroup : "",
    "]",
    printTypeAnnotationProperty(path, print),
    printClassMemberSemicolon(path, options),
  ];
}

export { printIndexSignature };
