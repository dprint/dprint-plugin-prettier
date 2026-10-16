// @nts-check
import { indent, line } from "../../document/builders.js";
import { isCallExpression, isMemberExpression } from "../utils/index.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/builders.js"
 */

/**
 * @param {AstPath} path
 * @returns {Doc}
 */
function printOptionalToken(path) {
  const { node } = path;
  if (
    !node.optional ||
    // It's an optional computed method parsed by typescript-estree.
    // "?" is printed in `printMethod`.
    (node.type === "Identifier" && node === path.parent.key)
  ) {
    return "";
  }
  if (
    isCallExpression(node) ||
    (isMemberExpression(node) && node.computed) ||
    node.type === "OptionalIndexedAccessType"
  ) {
    return "?.";
  }
  return "?";
}

/**
 * @param {AstPath} path
 * @returns {Doc}
 */
function printDefiniteToken(path) {
  return path.node.definite ||
    path.match(
      undefined,
      /** @returns {boolean | undefined} */ (node, name) =>
        name === "id" && node.type === "VariableDeclarator" && node.definite,
    )
    ? "!"
    : "";
}

const flowDeclareNodeTypes = new Set([
  "DeclareClass",
  "DeclareComponent",
  "DeclareFunction",
  "DeclareHook",
  "DeclareVariable",
  "DeclareExportDeclaration",
  "DeclareExportAllDeclaration",
  "DeclareOpaqueType",
  "DeclareTypeAlias",
  "DeclareEnum",
  "DeclareInterface",
]);
/**
 * @param {AstPath} path
 * @returns {Doc}
 */
function printDeclareToken(path) {
  const { node } = path;

  return (
    // TypeScript
    node.declare ||
      // Flow
      (flowDeclareNodeTypes.has(node.type) &&
        path.parent.type !== "DeclareExportDeclaration")
      ? "declare "
      : ""
  );
}

const tsAbstractNodeTypes = new Set([
  "TSAbstractMethodDefinition",
  "TSAbstractPropertyDefinition",
  "TSAbstractAccessorProperty",
]);
/**
 * @param {AstPath} param0
 * @returns {Doc}
 */
function printAbstractToken({ node }) {
  return node.abstract || tsAbstractNodeTypes.has(node.type) ? "abstract " : "";
}

function printFunctionTypeParameters(/** @type {AstPath} */ path, options, /** @type {(a0?: any) => any} */ print) {
  const fun = path.node;
  if (fun.typeArguments) {
    return print("typeArguments");
  }
  if (fun.typeParameters) {
    return print("typeParameters");
  }
  return "";
}

/** @returns {any[]} */ function printBindExpressionCallee(/** @type {AstPath} */ path, options, /** @type {(a0?: any) => any} */ print) {
  return ["::", print("callee")];
}

function adjustClause(node, clause, /** @type {boolean | undefined} */ forceSpace) {
  if (node.type === "EmptyStatement") {
    return ";";
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return [" ", clause];
  }

  return indent([line, clause]);
}

/** @returns {any[]} */ function printRestSpread(/** @type {AstPath} */ path, print) {
  return ["...", print("argument"), printTypeAnnotationProperty(path, print)];
}

/** @returns {string} */ function printTypeScriptAccessibilityToken(node) {
  return node.accessibility ? node.accessibility + " " : "";
}

export {
  adjustClause,
  printAbstractToken,
  printBindExpressionCallee,
  printDeclareToken,
  printDefiniteToken,
  printFunctionTypeParameters,
  printOptionalToken,
  printRestSpread,
  printTypeScriptAccessibilityToken,
};
