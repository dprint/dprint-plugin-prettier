// @nts-check
import { group } from "../../document/index.js";
import { printFunctionParameters } from "./function-parameters.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/*
- `ComponentDeclaration` (Flow)
- `DeclareComponent` (Flow)
- `ComponentTypeAnnotation` (Flow)
*/
function printComponent(/** @type {AstPath} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  const parts = [
    printDeclareToken(path),
    node.async ? "async " : "",
    "component",
  ];
  if (node.id) {
    parts.push(" ", print("id"));
  }

  parts.push(print("typeParameters"));

  const parametersDoc = printFunctionParameters(path, options, print);
  if (node.rendersType) {
    parts.push(group([parametersDoc, " ", print("rendersType")]));
  } else {
    parts.push(group([parametersDoc]));
  }

  if (node.body) {
    parts.push(" ", print("body"));
  }

  if (node.type === "DeclareComponent") {
    parts.push(printSemicolon(options));
  }

  return parts;
}

/*
- `ComponentParameter` (Flow)
*/
function printComponentParameter(/** @type {AstPath} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  if (node.shorthand) {
    return print("local");
  }

  return [print("name"), " as ", print("local")];
}

function printComponentTypeParameter(/** @type {AstPath} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  const printed = [];
  if (node.name) {
    printed.push(print("name"), node.optional ? "?: " : ": ");
  }

  printed.push(print("typeAnnotation"));

  return printed;
}

export { printComponent, printComponentParameter, printComponentTypeParameter };
