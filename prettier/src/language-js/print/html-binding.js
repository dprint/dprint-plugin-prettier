// @nts-check
import { group, indent, join, line, softline } from "../../document/index.js";

/** @import AstPath from "../../common/ast-path.js" */

/** @returns {any[] | undefined} */ function printHtmlBinding(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  if (options.__isVueBindings || options.__isVueForBindingLeft) {
    const parameterDocs = path.map(print, "program", "body", 0, "params");

    if (parameterDocs.length === 1) {
      return parameterDocs[0];
    }

    const doc = join([",", line], parameterDocs);

    return options.__isVueForBindingLeft
      ? ["(", indent([softline, group(doc)]), softline, ")"]
      : doc;
  }

  if (options.__isEmbeddedTypescriptGenericParameters) {
    const parameterDocs = path.map(
      print,
      "program",
      "body",
      0,
      "typeParameters",
      "params",
    );

    return join([",", line], parameterDocs);
  }
}

export { printHtmlBinding };
