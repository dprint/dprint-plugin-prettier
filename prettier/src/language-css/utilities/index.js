// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
/**
 * The callback that prints a part of the node that a printer is at, which prettier gives each printer
 * @typedef {(selector?: any, args?: any) => any} CssPrint
 * The options that prettier's CSS code reads
 * @typedef {{
 *   parser: string,
 *   originalText: string,
 *   singleQuote: boolean,
 *   trailingComma?: string,
 *   __isHTMLStyleAttribute?: boolean,
 * }} CssOptions
 */
const colorAdjusterFunctions = new Set([
  "red",
  "green",
  "blue",
  "alpha",
  "a",
  "rgb",
  "hue",
  "h",
  "saturation",
  "s",
  "lightness",
  "l",
  "whiteness",
  "w",
  "blackness",
  "b",
  "tint",
  "shade",
  "blend",
  "blenda",
  "contrast",
  "hsl",
  "hsla",
  "hwb",
  "hwba",
]);

/** @returns {string | undefined} */ function getPropOfDeclNode(/** @type {AstPath} */ path) {
  return path
    .findAncestor(/** @returns {boolean} */ (node) => node.type === "css-decl")
    ?.prop?.toLowerCase();
}

const wideKeywords = new Set(["initial", "inherit", "unset", "revert"]);
/** @returns {boolean} */ function isWideKeywords(/** @type {string} */ value) {
  return wideKeywords.has(value.toLowerCase());
}

/** @returns {boolean | undefined} */ function isKeyframeAtRuleKeywords(/** @type {AstPath} */ path, /** @type {string} */ value) {
  const atRuleAncestorNode = path.findAncestor(
    /** @returns {boolean} */ (node) => node.type === "css-atrule",
  );
  return (
    atRuleAncestorNode?.name?.toLowerCase().endsWith("keyframes") &&
    ["from", "to"].includes(value.toLowerCase())
  );
}

/** @returns {string} */ function maybeToLowerCase(/** @type {string} */ value) {
  return value.includes("$") ||
    value.includes("@") ||
    value.includes("#") ||
    value.startsWith("%") ||
    value.startsWith("--") ||
    value.startsWith(":--") ||
    (value.includes("(") && value.includes(")"))
    ? value
    : value.toLowerCase();
}

/** @returns {boolean} */ function insideValueFunctionNode(/** @type {AstPath} */ path, /** @type {string} */ functionName) {
  const funcAncestorNode = path.findAncestor(
    /** @returns {boolean} */ (node) => node.type === "value-func",
  );
  return funcAncestorNode?.value?.toLowerCase() === functionName;
}

// https://github.com/css-modules/icss
/** @returns {boolean} */ function insideIcssRuleNode(/** @type {AstPath} */ path) {
  return path.hasAncestor(/** @returns {boolean | undefined} */ (node) => {
    if (node.type !== "css-rule") {
      return false;
    }

    const selector = node.raws?.selector;
    return (
      selector &&
      (selector.startsWith(":import") || selector.startsWith(":export"))
    );
  });
}

/** @returns {boolean | undefined} */ function insideAtRuleNode(/** @type {AstPath} */ path, atRuleNameOrAtRuleNames) {
  const atRuleNames = Array.isArray(atRuleNameOrAtRuleNames)
    ? atRuleNameOrAtRuleNames
    : [atRuleNameOrAtRuleNames];
  const atRuleAncestorNode = path.findAncestor(
    /** @returns {boolean} */ (node) => node.type === "css-atrule",
  );

  return (
    atRuleAncestorNode &&
    atRuleNames.includes(atRuleAncestorNode.name.toLowerCase())
  );
}

/** @returns {boolean} */ function insideURLFunctionInImportAtRuleNode(/** @type {AstPath} */ path) {
  /** @type {{ node: import("../types.js").CssNode }} */ const { node } = path;
  return (
    node.groups[0]?.value === "url" &&
    node.groups.length === 2 &&
    path.findAncestor(/** @returns {boolean} */ (node) => node.type === "css-atrule")?.name === "import"
  );
}

/** @returns {boolean} */ function isURLFunctionNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-func" && node.value.toLowerCase() === "url";
}

/** @returns {boolean} */ function isVarFunctionNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-func" && node.value.toLowerCase() === "var";
}

/** @returns {boolean | undefined} */ function isDetachedRulesetDeclarationNode(/** @type {import("../types.js").CssNode} */ node) {
  const { selector } = node;
  // If a Less file ends up being parsed with the SCSS parser, Less
  // variable declarations will be parsed as atrules with names ending
  // with a colon, so keep the original case then.
  /* c8 ignore next 3 */
  if (!selector) {
    return false;
  }

  return (
    (typeof selector === "string" && /^@.+:.*$/.test(selector)) ||
    (selector.value && /^@.+:.*$/.test(selector.value))
  );
}

/** @returns {boolean} */ function isForKeywordNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    node.type === "value-word" &&
    ["from", "through", "end"].includes(node.value)
  );
}

/** @returns {boolean} */ function isIfElseKeywordNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    node.type === "value-word" && ["and", "or", "not"].includes(node.value)
  );
}

/** @returns {boolean} */ function isEachKeywordNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-word" && node.value === "in";
}

/** @returns {boolean} */ function isMultiplicationNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-operator" && node.value === "*";
}

/** @returns {boolean} */ function isDivisionNode(/** @type {import("../types.js").CssNode} */ node) {
  return node?.type === "value-operator" && node.value === "/";
}

/** @returns {boolean} */ function isAdditionNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-operator" && node.value === "+";
}

/** @returns {boolean} */ function isSubtractionNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-operator" && node.value === "-";
}

/** @returns {boolean} */ function isModuloNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-operator" && node.value === "%";
}

/** @returns {boolean} */ function isMathOperatorNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    isMultiplicationNode(node) ||
    isDivisionNode(node) ||
    isAdditionNode(node) ||
    isSubtractionNode(node) ||
    isModuloNode(node)
  );
}

/** @returns {boolean} */ function isEqualityOperatorNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-word" && ["==", "!="].includes(node.value);
}

/** @returns {boolean} */ function isRelationalOperatorNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    node.type === "value-word" && ["<", ">", "<=", ">="].includes(node.value)
  );
}

/** @returns {boolean} */ function isSCSSControlDirectiveNode(/** @type {import("../types.js").CssNode} */ node, /** @type {CssOptions} */ options) {
  return (
    options.parser === "scss" &&
    node.type === "css-atrule" &&
    ["if", "else", "for", "each", "while"].includes(node.name)
  );
}

function isDetachedRulesetCallNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.raws?.params && /^\(\s*\)$/.test(node.raws.params);
}

/** @returns {boolean} */ function isTemplatePlaceholderNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.name.startsWith("prettier-placeholder");
}

/** @returns {boolean} */ function isTemplatePropNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.prop.startsWith("@prettier-placeholder");
}

/** @returns {boolean} */ function isPostcssSimpleVarNode(currentNode, /** @type {import("../types.js").CssNode} */ nextNode) {
  return (
    currentNode.value === "$$" &&
    currentNode.type === "value-func" &&
    nextNode?.type === "value-word" &&
    !nextNode.raws.before
  );
}

/** @returns {boolean} */ function hasComposesNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    node.value?.type === "value-root" &&
    node.value.group?.type === "value-value" &&
    node.prop.toLowerCase() === "composes"
  );
}

/** @returns {boolean} */ function hasParensAroundNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    node.value?.group?.group?.type === "value-paren_group" &&
    node.value.group.group.open !== null &&
    node.value.group.group.close !== null
  );
}

/** @returns {boolean} */ function hasEmptyRawBefore(/** @type {import("../types.js").CssNode} */ node) {
  return node?.raws?.before === "";
}

/** @returns {boolean} */ function isKeyValuePairNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    node.type === "value-comma_group" &&
    node.groups?.[1]?.type === "value-colon"
  );
}

/** @returns {boolean} */ function isKeyValuePairInParenGroupNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    node.type === "value-paren_group" &&
    node.groups?.[0] &&
    isKeyValuePairNode(node.groups[0])
  );
}

/** @returns {boolean} */ function isSCSSMapItemNode(/** @type {AstPath} */ path, /** @type {CssOptions} */ options) {
  if (options.parser !== "scss") {
    return false;
  }

  /** @type {{ node: import("../types.js").CssNode }} */ const { node } = path;

  // Ignore empty item (i.e. `$key: ()`)
  if (node.groups.length === 0) {
    return false;
  }

  // A parenthesized scalar (i.e. `$key: (value)`) isn't a single-item list.
  if (
    node.type === "value-paren_group" &&
    node.open &&
    node.close &&
    node.groups.length === 1 &&
    node.groups[0].type !== "value-comma_group"
  ) {
    return false;
  }

  /** @type {import("../types.js").CssNode} */ const parentNode = path.parent;

  // Don't treat SCSS if function arguments as maps (`if(sass(condition): value; else: value)`)
  // https://sass-lang.com/documentation/breaking-changes/if-function/
  if (
    parentNode &&
    parentNode.type === "value-func" &&
    parentNode.value === "if"
  ) {
    return false;
  }

  /** @type {import("../types.js").CssNode} */ const parentParentNode = path.grandparent;

  // Check open parens contain key/value pair (i.e. `(key: value)` and `(key: (value, other-value)`)
  if (
    !isKeyValuePairInParenGroupNode(node) &&
    !(parentParentNode && isKeyValuePairInParenGroupNode(parentParentNode))
  ) {
    return false;
  }

  const declNode = path.findAncestor(/** @returns {boolean} */ (node) => node.type === "css-decl");

  // SCSS map declaration (i.e. `$map: (key: value, other-key: other-value)`)
  if (declNode?.prop?.startsWith("$")) {
    return true;
  }

  // List as value of key inside SCSS map (i.e. `$map: (key: (value other-value other-other-value))`)
  if (isKeyValuePairInParenGroupNode(parentParentNode)) {
    // If there is any operator in the value, it is not a map item
    if (parentNode.groups.some(/** @returns {boolean} */ (node) => isMathOperatorNode(node))) {
      return false;
    }

    return true;
  }

  // SCSS Map is argument of function (i.e. `func((key: value, other-key: other-value))`)
  if (parentParentNode.type === "value-func") {
    return true;
  }

  return false;
}

/** @returns {boolean} */ function isInlineValueCommentNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-comment" && node.inline;
}

/** @returns {boolean} */ function isHashNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-word" && node.value === "#";
}

/** @returns {boolean} */ function isLeftCurlyBraceNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-word" && node.value === "{";
}

/** @returns {boolean} */ function isRightCurlyBraceNode(/** @type {import("../types.js").CssNode} */ node) {
  return node.type === "value-word" && node.value === "}";
}

/** @returns {boolean} */ function isWordNode(/** @type {import("../types.js").CssNode} */ node) {
  return ["value-word", "value-atword"].includes(node.type);
}

/** @returns {boolean} */ function isColonNode(/** @type {import("../types.js").CssNode} */ node) {
  return node?.type === "value-colon";
}

/** @returns {boolean} */ function isKeyInValuePairNode(/** @type {import("../types.js").CssNode} */ node, /** @type {import("../types.js").CssNode} */ parentNode) {
  if (!isKeyValuePairNode(parentNode)) {
    return false;
  }

  const { groups } = parentNode;
  const index = groups.indexOf(node);

  /* c8 ignore next 3 */
  if (index === -1) {
    return false;
  }

  return isColonNode(groups[index + 1]);
}

/** @returns {boolean} */ function isMediaAndSupportsKeywords(/** @type {import("../types.js").CssNode} */ node) {
  return node.value && ["not", "and", "or"].includes(node.value.toLowerCase());
}

/** @returns {boolean} */ function isColorAdjusterFuncNode(/** @type {import("../types.js").CssNode} */ node) {
  if (node.type !== "value-func") {
    return false;
  }

  return colorAdjusterFunctions.has(node.value.toLowerCase());
}

/** @returns {boolean} */ function lastLineHasInlineComment(/** @type {string} */ text) {
  return /\/\//.test(text.split(/[\n\r]/).pop());
}

/** @returns {boolean} */ function isAtWordPlaceholderNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    node?.type === "value-atword" &&
    node.value.startsWith("prettier-placeholder-")
  );
}

/** @returns {boolean} */ function isConfigurationNode(/** @type {import("../types.js").CssNode} */ node, /** @type {import("../types.js").CssNode} */ parentNode) {
  if (
    node.open?.value !== "(" ||
    node.close?.value !== ")" ||
    node.groups.some(/** @returns {boolean} */ (group) => group.type !== "value-comma_group")
  ) {
    return false;
  }
  if (parentNode.type === "value-comma_group") {
    /** @type {number} */ const prevIdx = parentNode.groups.indexOf(node) - 1;
    const maybeWithNode = parentNode.groups[prevIdx];
    if (
      maybeWithNode?.type === "value-word" &&
      maybeWithNode.value === "with"
    ) {
      return true;
    }
  }
  return false;
}

/** @returns {boolean} */ function isParenGroupNode(/** @type {import("../types.js").CssNode} */ node) {
  return (
    node.type === "value-paren_group" &&
    node.open?.value === "(" &&
    node.close?.value === ")"
  );
}

export {
  getPropOfDeclNode,
  hasComposesNode,
  hasEmptyRawBefore,
  hasParensAroundNode,
  insideAtRuleNode,
  insideIcssRuleNode,
  insideURLFunctionInImportAtRuleNode,
  insideValueFunctionNode,
  isAdditionNode,
  isAtWordPlaceholderNode,
  isColonNode,
  isColorAdjusterFuncNode,
  isConfigurationNode,
  isDetachedRulesetCallNode,
  isDetachedRulesetDeclarationNode,
  isDivisionNode,
  isEachKeywordNode,
  isEqualityOperatorNode,
  isForKeywordNode,
  isHashNode,
  isIfElseKeywordNode,
  isInlineValueCommentNode,
  isKeyframeAtRuleKeywords,
  isKeyInValuePairNode,
  isKeyValuePairNode,
  isLeftCurlyBraceNode,
  isMathOperatorNode,
  isMediaAndSupportsKeywords,
  isMultiplicationNode,
  isParenGroupNode,
  isPostcssSimpleVarNode,
  isRelationalOperatorNode,
  isRightCurlyBraceNode,
  isSCSSControlDirectiveNode,
  isSCSSMapItemNode,
  isSubtractionNode,
  isTemplatePlaceholderNode,
  isTemplatePropNode,
  isURLFunctionNode,
  isVarFunctionNode,
  isWideKeywords,
  isWordNode,
  lastLineHasInlineComment,
  maybeToLowerCase,
};
