// @nts-check
import { hardline, indent } from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { isNextLineEmpty } from "../utilities/is-next-line-empty.js";
import { printStatementSequence } from "./statement-sequence.js";

/** @import AstPath from "../../common/ast-path.js" */

/** @import {Doc} from "../../document/index.js" */

/*
- `Program`
- `BlockStatement`
- `StaticBlock`
- `TSModuleBlock` (TypeScript)
*/
function printBlock(/** @type {AstPath} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  const bodyDoc = printBlockBody(path, options, print);
  /** @type {{ node: import("../types/estree.js").Node, parent: import("../types/estree.js").Node }} */ const { node, parent } = path;

  if (node.type === "Program" && parent?.type !== "ModuleExpression") {
    return bodyDoc ? [bodyDoc, hardline] : "";
  }

  const parts = [];

  if (node.type === "StaticBlock") {
    parts.push("static ");
  }

  parts.push("{");
  if (bodyDoc) {
    parts.push(indent([hardline, bodyDoc]), hardline);
  } else {
    /** @type {import("../types/estree.js").Node} */ const parentParent = path.grandparent;
    if (!(
      parent.type === "ArrowFunctionExpression" ||
      parent.type === "FunctionExpression" ||
      parent.type === "FunctionDeclaration" ||
      parent.type === "ComponentDeclaration" ||
      parent.type === "HookDeclaration" ||
      parent.type === "ObjectMethod" ||
      parent.type === "ClassMethod" ||
      parent.type === "ClassPrivateMethod" ||
      parent.type === "ForStatement" ||
      parent.type === "WhileStatement" ||
      parent.type === "DoWhileStatement" ||
      parent.type === "DoExpression" ||
      parent.type === "ModuleExpression" ||
      (parent.type === "CatchClause" && !parentParent.finalizer) ||
      parent.type === "TSModuleDeclaration" ||
      parent.type === "DeclareModule" ||
      parent.type === "MatchStatementCase" ||
      node.type === "StaticBlock"
    )) {
      parts.push(hardline);
    }
  }

  parts.push("}");

  return parts;
}

/*
- `Program`
- `BlockStatement`
- `StaticBlock`
- `TSModuleBlock` (TypeScript)
*/
function printBlockBody(/** @type {AstPath} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  /** @type {boolean} */ const hasDirectives = isNonEmptyArray(node.directives);
  const hasBody = node.body.some(/** @returns {boolean} */ (node) => node.type !== "EmptyStatement");
  /** @type {boolean} */ const hasDanglingComments = hasComment(node, CommentCheckFlags.Dangling);

  if (!hasDirectives && !hasBody && !hasDanglingComments) {
    return "";
  }

  const parts = [];
  // Babel
  if (hasDirectives) {
    parts.push(printStatementSequence(path, options, print, "directives"));

    if (hasBody || hasDanglingComments) {
      parts.push(hardline);
      if (isNextLineEmpty(node.directives.at(-1), options)) {
        parts.push(hardline);
      }
    }
  }

  if (hasBody) {
    parts.push(printStatementSequence(path, options, print, "body"));
  }

  if (hasDanglingComments) {
    parts.push(printDanglingComments(path, options));
  }

  return parts;
}

export { printBlock };
