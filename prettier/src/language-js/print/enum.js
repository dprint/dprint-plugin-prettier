// @nts-check
import { printKey } from "./key.js";
import { printDeclareToken } from "./miscellaneous.js";
import { printObject } from "./object.js";

function printFlowEnumBody(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  return [
    node.explicitType ? `of ${node.explicitType} ` : "",
    printObject(path, options, print),
  ];
}

function printLegacyFlowEnumBody(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  return [
    node.type === "EnumSymbolBody" || node.explicitType
      ? `of ${node.type
          .slice(
            // `Enum`
            4,
            // `Body`
            -4,
          )
          .toLowerCase()} `
      : "",
    printObject(path, options, print),
  ];
}

/*
- `EnumBooleanMember`(flow)
- `EnumNumberMember`(flow)
- `EnumBigIntMember`(flow)
- `EnumStringMember`(flow)
- `EnumDefaultedMember`(flow)
- `TSEnumMember`(TypeScript)
*/
function printEnumMember(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  const isTsEnumMember = node.type === "TSEnumMember";

  const idDoc = isTsEnumMember
    ? printKey(path, options, print)
    : // Flow only allow identifier
      print("id");
  const initializerProperty = isTsEnumMember ? "initializer" : "init";
  if (!node[initializerProperty]) {
    return idDoc;
  }

  return [idDoc, " = ", print(initializerProperty)];
}

/*
- `DeclareEnum`(flow)
- `EnumDeclaration`(flow)
- `TSEnumDeclaration`(TypeScript)
*/
function printEnumDeclaration(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  return [
    printDeclareToken(path),
    node.const ? "const " : "",
    "enum ",
    print("id"),
    " ",
    print("body"),
  ];
}

export {
  printEnumDeclaration,
  printEnumMember,
  printFlowEnumBody,
  printLegacyFlowEnumBody,
};
