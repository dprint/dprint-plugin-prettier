// @nts-check
import { group } from "../../document/index.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/*
- "DeclareHook"
*/
function printDeclareHook(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  return [
    printDeclareToken(path),
    "hook",
    path.node.id ? [" ", print("id")] : "",
    printSemicolon(options),
  ];
}

/*
`HookTypeAnnotation` is ambiguous:
- `declare hook useFoo(a: B): void;`
- `var A: hook (a: B) => void;`
*/
/** @returns {boolean} */ function isDeclareHookTypeAnnotation(/** @type {AstPath} */ path) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  return (
    node.type === "HookTypeAnnotation" &&
    path.getParentNode(2)?.type === "DeclareHook"
  );
}

/*
- `HookTypeAnnotation` (Flow)
*/
function printHookTypeAnnotation(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  const parametersDoc = printFunctionParameters(
    path,
    options,
    print,
    /* shouldExpandParameters */ false,
    /* shouldPrintTypeParameters */ true,
  );

  const returnTypeDoc = [
    isDeclareHookTypeAnnotation(path) ? ": " : " => ",
    print("returnType"),
  ];

  return group([
    isDeclareHookTypeAnnotation(path) ? "" : "hook ",
    shouldGroupFunctionParameters(node, returnTypeDoc)
      ? group(parametersDoc)
      : parametersDoc,
    returnTypeDoc,
  ]);
}

export { printDeclareHook, printHookTypeAnnotation };
