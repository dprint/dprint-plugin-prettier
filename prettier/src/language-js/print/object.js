// @nts-check
import * as assert from "#universal/assert";
import {
  group,
  hardline,
  indent,
  line,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utilities/has-newline.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../location/index.js";
import {
  CommentCheckFlags,
  getComments,
  hasComment,
} from "../utilities/comments.js";
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";
import { isNextLineEmpty } from "../utilities/is-next-line-empty.js";
import { isObjectType } from "../utilities/node-types.js";
import { stripComments } from "../utilities/strip-comments.js";
import { shouldHugTheOnlyParameter } from "./function-parameters.js";
import {
  printDanglingCommentsInList,
  printOptionalToken,
  printTrailingComma,
} from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @import AstPath from "../../common/ast-path.js" */

/** @import {Doc} from "../../document/index.js" */

const isPrintingImportAttributes = createTypeCheckFunction([
  "ImportDeclaration",
  "ExportDefaultDeclaration",
  "ExportNamedDeclaration",
  "ExportAllDeclaration",
  "DeclareExportDeclaration",
  "DeclareExportAllDeclaration",
]);

const isPrintingFlowEnumBody = createTypeCheckFunction([
  "EnumBody",
  "EnumBooleanBody",
  "EnumNumberBody",
  "EnumBigIntBody",
  "EnumStringBody",
  "EnumSymbolBody",
]);

/*
- `ObjectExpression`
- `ObjectPattern`
- `ImportDeclaration`
- `ExportDefaultDeclaration`
- `ExportNamedDeclaration`
- `ExportAllDeclaration`
- `EnumBody` (Flow)
- `EnumBooleanBody` (Flow, removed)
- `EnumNumberBody` (Flow, removed)
- `EnumBigIntBody` (Flow, removed)
- `EnumStringBody` (Flow, removed)
- `EnumSymbolBody` (Flow, removed)
- `DeclareExportDeclaration` (Flow)
- `DeclareExportAllDeclaration` (Flow)
- `TSEnumDeclaration`(TypeScript)
*/
/** @returns {Doc} */ function printObject(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node, parent: import("../types/estree.js").Node }} */ const { node, parent } = path;

  const isFlowEnumBody = isPrintingFlowEnumBody(node);
  const isEnumBody = node.type === "TSEnumBody" || isFlowEnumBody;
  const isImportAttributes = isPrintingImportAttributes(node);
  const hasUnknownMembers = isFlowEnumBody && node.hasUnknownMembers;

  const property = isEnumBody
    ? "members"
    : isImportAttributes
      ? "attributes"
      : "properties";
  const children = /** @type {import("../types/estree.js").Node[]} */ (node[property]);

  const shouldBreak =
    isEnumBody ||
    (node.type === "ObjectPattern" &&
      parent.type !== "FunctionDeclaration" &&
      parent.type !== "FunctionExpression" &&
      parent.type !== "ArrowFunctionExpression" &&
      parent.type !== "ObjectMethod" &&
      parent.type !== "ClassMethod" &&
      parent.type !== "ClassPrivateMethod" &&
      parent.type !== "AssignmentPattern" &&
      parent.type !== "CatchClause" &&
      /** @type {import("../types/estree.js").Node[]} */ (node.properties).some(
        /** @returns {boolean | undefined} */ (/** @type {import("../types/estree.js").Node} */ property) =>
          property.value &&
          (property.value.type === "ObjectPattern" ||
            property.value.type === "ArrayPattern"),
      )) ||
    (node.type !== "ObjectPattern" &&
      options.objectWrap === "preserve" &&
      children.length > 0 &&
      hasNewLineAfterOpeningBrace(node, children[0], options));

  /** @type {Doc[]} */
  let separatorParts = [];
  const parts = path.map(({ node }) => {
    const result = [...separatorParts, print()];
    separatorParts = [",", line];
    if (isNextLineEmpty(node, options)) {
      separatorParts.push(hardline);
    }
    return result;
  }, property);

  if (hasUnknownMembers) {
    /** @type {Doc[]} */
    let printed;
    if (hasComment(node, CommentCheckFlags.Dangling)) {
      /** @type {boolean} */ const hasLineComments = hasComment(node, CommentCheckFlags.Line);
      const printedDanglingComments = printDanglingComments(path, options);
      printed = [
        printedDanglingComments,
        hasLineComments ||
        hasNewline(options.originalText, locEnd(getComments(node).at(-1)))
          ? hardline
          : line,
        "...",
      ];
    } else {
      printed = ["..."];
    }
    parts.push([...separatorParts, ...printed]);
  }

  /** @type {boolean} */ const canHaveTrailingSeparator = !(
    hasUnknownMembers || children.at(-1)?.type === "RestElement"
  );

  /** @type {Doc} */
  let content;
  if (parts.length === 0) {
    content = group([
      "{",
      printDanglingCommentsInList(path, options),
      "}",
      printOptionalToken(path),
      printTypeAnnotationProperty(path, print),
    ]);
  } else {
    const spacing = options.bracketSpacing ? line : softline;
    content = [
      "{",
      indent([spacing, ...parts]),
      canHaveTrailingSeparator ? printTrailingComma(options) : "",
      spacing,
      "}",
      printOptionalToken(path),
      printTypeAnnotationProperty(path, print),
    ];
  }

  // If we inline the object as first argument of the parent, we don't want
  // to create another group so that the object breaks before the return
  // type
  if (
    path.match(
      /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) =>
        node.type === "ObjectPattern" && !isNonEmptyArray(node.decorators),
      shouldHugTheOnlyParameter,
    ) ||
    (isObjectType(node) &&
      (path.match(
        undefined,
        /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node, name) => name === "typeAnnotation",
        /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node, name) => name === "typeAnnotation",
        shouldHugTheOnlyParameter,
      ) ||
        path.match(
          undefined,
          /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node, name) =>
            node.type === "FunctionTypeParam" && name === "typeAnnotation",
          shouldHugTheOnlyParameter,
        ))) ||
    // Assignment printing logic (printAssignment) is responsible
    // for adding a group if needed
    (!shouldBreak &&
      path.match(
        /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) => node.type === "ObjectPattern",
        /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) =>
          node.type === "AssignmentExpression" ||
          node.type === "VariableDeclarator",
      ))
  ) {
    return content;
  }

  return group(content, { shouldBreak });
}

/** @returns {boolean} */ function hasNewLineAfterOpeningBrace(/** @type {import("../types/estree.js").Node} */ node, firstProperty, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options) {
  const text = options.originalText;
  const firstPropertyStart = locStart(firstProperty);

  let openingBraceIndex = locStart(node);
  if (isPrintingImportAttributes(node)) {
    openingBraceIndex = stripComments(options).lastIndexOf(
      "{",
      firstPropertyStart,
    );
    /* c8 ignore next 3 */
    if (process.env.NODE_ENV !== "production") {
      assert.ok(openingBraceIndex !== -1);
    }
  }

  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    assert.equal(text.charAt(openingBraceIndex), "{");
  }

  return hasNewlineInRange(text, openingBraceIndex, firstPropertyStart);
}

export { printObject };
