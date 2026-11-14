// @nts-check
import { printDefiniteToken, printOptionalToken } from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 * @import {Node} from "../types/estree.js"
 */

/** @returns {boolean} */ function shouldEscapeIdentifier(/** @type {AstPath} */ path) {
  return (
    // `for (using o\u{66} of foo);`
    // https://github.com/babel/babel/pull/18430
    path.match(
      /** @returns {boolean} */ (/** @type {Node} */ { name }) => name === "of",
      /** @returns {boolean} */ (/** @type {Node} */ node, /** @type {string | number} */ key) => node.type === "VariableDeclarator" && key === "id",
      /** @returns {boolean} */ (/** @type {Node} */ node, /** @type {string | number} */ key) =>
        node.type === "VariableDeclaration" &&
        node.kind === "using" &&
        key === "declarations",
      /** @returns {boolean} */ (/** @type {Node} */ node, /** @type {string | number} */ key) => node.type === "ForOfStatement" && key === "left",
    ) ||
    // cspell:disable-next-line
    // `export asyn\u{63} from "async";`
    path.match(
      /** @returns {boolean} */ (/** @type {Node} */ { name }) => name === "async",
      /** @returns {boolean} */ (/** @type {Node} */ node, /** @type {string | number} */ key) =>
        node.type === "ExportDefaultSpecifier" && key === "exported",
      /** @returns {boolean} */ (/** @type {Node} */ node, /** @type {string | number} */ key) =>
        node.type === "ExportNamedDeclaration" && key === "specifiers",
    )
  );
}

const escapeIdentifier = /** @returns {string} */ (/** @type {string} */ name) =>
  String.raw`${name.slice(0, -1)}\u{${name.codePointAt(name.length - 1).toString(16)}}`;

const printIdentifierName = /** @returns {string} */ (/** @type {AstPath} */ path) => {
  /** @type {{ node: Node }} */ const {
    node: { name },
  } = path;
  return shouldEscapeIdentifier(path) ? escapeIdentifier(name) : name;
};

/** @returns {Doc[]} */ function printIdentifier(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  return [
    printIdentifierName(path),
    printOptionalToken(path),
    printDefiniteToken(path),
    printTypeAnnotationProperty(path, print),
  ];
}

export { printIdentifier };
