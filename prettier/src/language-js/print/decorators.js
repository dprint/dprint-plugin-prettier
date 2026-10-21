// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import {
  breakParent,
  group,
  hardline,
  join,
  line,
} from "../../document/index.js";
import hasNewline from "../../utilities/has-newline.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { hasSameLocStart, locEnd } from "../location/index.js";
import isIgnored from "../utilities/is-ignored.js";
import { isExportDeclaration } from "../utilities/node-types.js";

function printClassMemberDecorators(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  return group([
    join(line, path.map(print, "decorators")),
    hasNewlineBetweenOrAfterDecorators(node, options) ? hardline : line,
  ]);
}

function printDecoratorsBeforeExport(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  // Only print decorators here if they were written before the export,
  // otherwise they are printed by the node.declaration
  if (!hasDecoratorsBeforeExport(path.node)) {
    return "";
  }

  // Export declarations are responsible for printing any decorators
  // that logically apply to node.declaration.
  return [
    join(hardline, path.map(print, "declaration", "decorators")),
    hardline,
  ];
}

function printDecorators(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node, parent: import("../types/estree.js").Node }} */ const { node, parent } = path;
  const { decorators } = node;

  if (
    !isNonEmptyArray(decorators) ||
    // If the parent node is an export declaration and the decorator
    // was written before the export, the export will be responsible
    // for printing the decorators.
    hasDecoratorsBeforeExport(parent) ||
    // Decorators already printed in ignored node
    isIgnored(path)
  ) {
    return "";
  }

  /** @type {boolean} */ const shouldBreak =
    node.type === "ClassExpression" ||
    node.type === "ClassDeclaration" ||
    hasNewlineBetweenOrAfterDecorators(node, options);

  return [
    path.key === "declaration" && isExportDeclaration(parent)
      ? hardline
      : shouldBreak
        ? breakParent
        : "",
    join(line, path.map(print, "decorators")),
    line,
  ];
}

/** @returns {boolean} */ function hasNewlineBetweenOrAfterDecorators(/** @type {import("../types/estree.js").Node} */ node, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options) {
  return /** @type {import("../types/estree.js").Node[]} */ (node.decorators).some(/** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ decorator) =>
    hasNewline(options.originalText, locEnd(decorator)),
  );
}

/** @returns {boolean} */ function hasDecoratorsBeforeExport(/** @type {import("../types/estree.js").Node} */ node) {
  if (
    node.type !== "ExportDefaultDeclaration" &&
    node.type !== "ExportNamedDeclaration" &&
    node.type !== "DeclareExportDeclaration"
  ) {
    return false;
  }

  const decorators = node.declaration?.decorators;

  return isNonEmptyArray(decorators) && hasSameLocStart(node, decorators[0]);
}

export {
  printClassMemberDecorators,
  printDecorators,
  printDecoratorsBeforeExport,
};
