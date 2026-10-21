import { getOrInsertComputed } from "../../utilities/get-or-insert.js";

/** @import AstPath from "../../common/ast-path.js" */

function getFunctionParametersWithoutCache(/** @type {import("../types/estree.js").Node} */ node) {
  const parameters = [];
  if (node.this) {
    parameters.push(node.this);
  }

  parameters.push(...node.params);

  if (node.rest) {
    parameters.push(node.rest);
  }
  return parameters;
}

const functionParametersCache = new WeakMap();
/** @returns {any[]} */ function getFunctionParameters(/** @type {import("../types/estree.js").Node} */ node) {
  return getOrInsertComputed(
    functionParametersCache,
    node,
    getFunctionParametersWithoutCache,
  );
}

function iterateFunctionParametersPath(/** @type {AstPath} */ path, /** @type {(a0?: any, a1?: any) => void} */ iteratee) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  let index = 0;
  const callback = () => iteratee(path, index++);
  if (node.this) {
    path.call(callback, "this");
  }

  path.each(callback, "params");

  if (node.rest) {
    path.call(callback, "rest");
  }
}

/** @returns {boolean} */ function hasRestParameter(/** @type {import("../types/estree.js").Node} */ node) {
  if (node.rest) {
    return true;
  }
  const parameters = getFunctionParameters(node);
  return parameters.at(-1)?.type === "RestElement";
}

export {
  getFunctionParameters,
  hasRestParameter,
  iterateFunctionParametersPath,
};
