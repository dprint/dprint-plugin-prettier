// @nts-check
/**
@import {
  Node,
  NodeMap,
} from "../types/estree.js";
@typedef {
  | NodeMap["NewExpression"]
  | NodeMap["ImportExpression"]
  | NodeMap["OptionalCallExpression"]
  | NodeMap["CallExpression"]
  | NodeMap["TSImportType"]
  | NodeMap["TSExternalModuleReference"]
  | NodeMap["ImportType"]
  | NodeMap["ExternalModuleReference"]
  | NodeMap["DeclareClassExtendsCall"]
} CallLikeNode
*/

import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import {
  isExternalModuleReference,
  isImportType,
} from "../utilities/node-types.js";

/** @import AstPath from "../../common/ast-path.js" */

const callArgumentsCache = new WeakMap();

/**
@param {import("../types/estree.js").Node} node
*/
function getCallArgumentsWithoutCache(node) {
  /** @type {Node[]} */
  let args;
  if (node.type === "ImportExpression" || isImportType(node)) {
    args = [node.source];

    // @ts-expect-error -- missing
    if (node.options) {
      // @ts-expect-error -- missing
      args.push(node.options);
    }
  } else if (isExternalModuleReference(node)) {
    args = [node.expression];
  } else if (node.type === "DeclareClassExtendsCall") {
    args = [node.argument];
  } else {
    args = node.arguments;
  }

  return args;
}

/**
@param {CallLikeNode} node
@returns {Node[]}
*/
function getCallArguments(node) {
  return getOrInsertComputed(
    callArgumentsCache,
    node,
    getCallArgumentsWithoutCache,
  );
}

function iterateCallArgumentsPath(/** @type {AstPath} */ path, /** @type {(path: AstPath, index: number) => void} */ iteratee) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  if (node.type === "ImportExpression" || isImportType(node)) {
    path.call(() => iteratee(path, 0), "source");

    if (node.options) {
      path.call(() => iteratee(path, 1), "options");
    }
  } else if (isExternalModuleReference(node)) {
    path.call(() => iteratee(path, 0), "expression");
  } else if (node.type === "DeclareClassExtendsCall") {
    path.call(() => iteratee(path, 0), "argument");
  } else {
    path.each(iteratee, "arguments");
  }
}

/**
@param {CallLikeNode} node
@param {number} index
@returns {any[]}
*/
function getCallArgumentSelector(node, /** @type {number} */ index) {
  if (node.type === "ImportExpression" || isImportType(node)) {
    // @ts-expect-error -- missing
    if (index === 0 || index === (node.options ? -2 : -1)) {
      return ["source"];
    }

    // @ts-expect-error -- missing
    if (node.options && (index === 1 || index === -1)) {
      return ["options"];
    }

    throw new RangeError("Invalid argument index");
  }

  if (isExternalModuleReference(node)) {
    if (index === 0 || index === -1) {
      return ["expression"];
    }
  } else if (node.type === "DeclareClassExtendsCall") {
    if (index === 0 || index === -1) {
      return ["argument"];
    }
  } else {
    if (index < 0) {
      index = node.arguments.length + index;
    }
    if (index >= 0 && index < node.arguments.length) {
      return ["arguments", index];
    }
  }

  /* c8 ignore next */
  throw new RangeError("Invalid argument index");
}

export { getCallArguments, getCallArgumentSelector, iterateCallArgumentsPath };
