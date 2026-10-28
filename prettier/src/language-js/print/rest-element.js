import { printTypeAnnotationProperty } from "./type-annotation.js";

function printRestOrSpreadElement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  return ["...", print("argument"), printTypeAnnotationProperty(path, print)];
}

export {
  printRestOrSpreadElement as printRestElement,
  printRestOrSpreadElement as printSpreadElement,
};
