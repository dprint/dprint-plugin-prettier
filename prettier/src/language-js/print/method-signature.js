import { group } from "../../document/index.js";
import { printClassMemberSemicolon } from "./class.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printKey } from "./key.js";
import {
  printOptionalToken,
  printTypeScriptAccessibilityToken,
} from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/*
- `TSMethodSignature` (TypeScript)
*/
function printMethodSignature(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  const { node } = path;
  const parts = [];
  /** @type {string} */ const kind = node.kind && node.kind !== "method" ? `${node.kind} ` : "";
  parts.push(
    printTypeScriptAccessibilityToken(node),
    kind,
    printKey(path, options, print),
    printOptionalToken(path),
  );

  const parametersDoc = printFunctionParameters(
    path,
    options,
    print,
    /* shouldExpandParameters */ false,
    /* shouldPrintTypeParameters */ true,
  );

  const returnTypeDoc = printTypeAnnotationProperty(path, print, "returnType");
  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc,
  );

  parts.push(shouldGroupParameters ? group(parametersDoc) : parametersDoc);

  if (node.returnType) {
    parts.push(group(returnTypeDoc));
  }

  return [group(parts), printClassMemberSemicolon(path, options)];
}

export { printMethodSignature };
