// the part of `svelte/compiler` that prettier-plugin-svelte uses, its parser, so that the rest of Svelte's compiler is
// not compiled: `parse` and what it calls, as Svelte 5.57.2's src/compiler/index.js has them
import { walk as zimmerframe_walk } from "zimmerframe";
import { convert } from "../../plugins/node_modules/svelte/src/compiler/legacy.js";
import { parse as _parse } from "../../plugins/node_modules/svelte/src/compiler/phases/1-parse/index.js";
import * as state from "../../plugins/node_modules/svelte/src/compiler/state.js";

/**
 * @param {string} source
 * @param {{ filename?: string; rootDir?: string; modern?: boolean; loose?: boolean }} [options]
 */
export function parse(source, { modern, loose } = {}) {
  source = remove_bom(source);
  state.reset({ warning: () => false, filename: undefined });

  const ast = _parse(source, loose);
  return to_public_ast(source, ast, modern);
}

/**
 * @param {string} source
 * @param {any} ast
 * @param {boolean | undefined} modern
 */
function to_public_ast(source, ast, modern) {
  if (modern) {
    const clean = (/** @type {any} */ node) => {
      delete node.metadata;
    };

    ast.options?.attributes.forEach((attribute) => {
      clean(attribute);
      clean(attribute.value);
      if (Array.isArray(attribute.value)) {
        attribute.value.forEach(clean);
      }
    });

    // remove things that we don't want to treat as public API
    return zimmerframe_walk(ast, null, {
      _(node, { next }) {
        clean(node);
        next();
      },
    });
  }

  return convert(source, ast);
}

/**
 * Remove the byte order mark from a string if it's present since it would mess with our template generation logic
 * @param {string} source
 */
function remove_bom(source) {
  if (source.charCodeAt(0) === 0xfeff) {
    return source.slice(1);
  }
  return source;
}
