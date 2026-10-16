// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
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

/** @returns {string | undefined} */ function getPropOfDeclNode(path) {
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

/** @returns {boolean | undefined} */ function insideICSSRuleNode(/** @type {AstPath} */ path) {
  const ruleAncestorNode = path.findAncestor(
    /** @returns {boolean} */ (node) => node.type === "css-rule",
  );
  const selector = ruleAncestorNode?.raws?.selector;

  return (
    selector &&
    (selector.startsWith(":import") || selector.startsWith(":export"))
  );
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
  const { node } = path;
  return (
    node.groups[0].value === "url" &&
    node.groups.length === 2 &&
    path.findAncestor(/** @returns {boolean} */ (node) => node.type === "css-atrule")?.name === "import"
  );
}

/** @returns {boolean} */ function isURLFunctionNode(node) {
  return node.type === "value-func" && node.value.toLowerCase() === "url";
}

/** @returns {boolean} */ function isVarFunctionNode(node) {
  return node.type === "value-func" && node.value.toLowerCase() === "var";
}

/** @returns {boolean | undefined} */ function isDetachedRulesetDeclarationNode(node) {
  const { selector } = node;
  // If a Less file ends up being parsed with the SCSS parser, Less
  // variable declarations will be parsed as atrules with names ending
  // with a colon, so keep the original case then.
  /* c8 ignore next 3 */
  if (!selector) {
    return false;
  }

  return (
    (typeof selector === "string" && /^@.+:.*$/u.test(selector)) ||
    (selector.value && /^@.+:.*$/u.test(selector.value))
  );
}

/** @returns {boolean} */ function isForKeywordNode(node) {
  return (
    node.type === "value-word" &&
    ["from", "through", "end"].includes(node.value)
  );
}

/** @returns {boolean} */ function isIfElseKeywordNode(node) {
  return (
    node.type === "value-word" && ["and", "or", "not"].includes(node.value)
  );
}

/** @returns {boolean} */ function isEachKeywordNode(node) {
  return node.type === "value-word" && node.value === "in";
}

/** @returns {boolean} */ function isMultiplicationNode(node) {
  return node.type === "value-operator" && node.value === "*";
}

/** @returns {boolean} */ function isDivisionNode(node) {
  return node.type === "value-operator" && node.value === "/";
}

/** @returns {boolean} */ function isAdditionNode(node) {
  return node.type === "value-operator" && node.value === "+";
}

/** @returns {boolean} */ function isSubtractionNode(node) {
  return node.type === "value-operator" && node.value === "-";
}

/** @returns {boolean} */ function isModuloNode(node) {
  return node.type === "value-operator" && node.value === "%";
}

/** @returns {boolean} */ function isMathOperatorNode(node) {
  return (
    isMultiplicationNode(node) ||
    isDivisionNode(node) ||
    isAdditionNode(node) ||
    isSubtractionNode(node) ||
    isModuloNode(node)
  );
}

/** @returns {boolean} */ function isEqualityOperatorNode(node) {
  return node.type === "value-word" && ["==", "!="].includes(node.value);
}

/** @returns {boolean} */ function isRelationalOperatorNode(node) {
  return (
    node.type === "value-word" && ["<", ">", "<=", ">="].includes(node.value)
  );
}

/** @returns {boolean} */ function isSCSSControlDirectiveNode(node, options) {
  return (
    options.parser === "scss" &&
    node.type === "css-atrule" &&
    ["if", "else", "for", "each", "while"].includes(node.name)
  );
}

function isDetachedRulesetCallNode(node) {
  return node.raws?.params && /^\(\s*\)$/u.test(node.raws.params);
}

/** @returns {boolean} */ function isTemplatePlaceholderNode(node) {
  return node.name.startsWith("prettier-placeholder");
}

/** @returns {boolean} */ function isTemplatePropNode(node) {
  return node.prop.startsWith("@prettier-placeholder");
}

/** @returns {boolean} */ function isPostcssSimpleVarNode(currentNode, nextNode) {
  return (
    currentNode.value === "$$" &&
    currentNode.type === "value-func" &&
    nextNode?.type === "value-word" &&
    !nextNode.raws.before
  );
}

/** @returns {boolean} */ function hasComposesNode(node) {
  return (
    node.value?.type === "value-root" &&
    node.value.group?.type === "value-value" &&
    node.prop.toLowerCase() === "composes"
  );
}

/** @returns {boolean} */ function hasParensAroundNode(node) {
  return (
    node.value?.group?.group?.type === "value-paren_group" &&
    node.value.group.group.open !== null &&
    node.value.group.group.close !== null
  );
}

/** @returns {boolean} */ function hasEmptyRawBefore(node) {
  return node.raws?.before === "";
}

/** @returns {boolean} */ function isKeyValuePairNode(node) {
  return (
    node.type === "value-comma_group" &&
    node.groups?.[1]?.type === "value-colon"
  );
}

/** @returns {boolean} */ function isKeyValuePairInParenGroupNode(node) {
  return (
    node.type === "value-paren_group" &&
    node.groups?.[0] &&
    isKeyValuePairNode(node.groups[0])
  );
}

/** @returns {boolean} */ function isSCSSMapItemNode(/** @type {AstPath} */ path, options) {
  if (options.parser !== "scss") {
    return false;
  }

  const { node } = path;

  // Ignore empty item (i.e. `$key: ()`)
  if (node.groups.length === 0) {
    return false;
  }

  const parentParentNode = path.grandparent;

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
    return true;
  }

  // SCSS Map is argument of function (i.e. `func((key: value, other-key: other-value))`)
  if (parentParentNode.type === "value-func") {
    return true;
  }

  return false;
}

/** @returns {boolean} */ function isInlineValueCommentNode(node) {
  return node.type === "value-comment" && node.inline;
}

/** @returns {boolean} */ function isHashNode(node) {
  return node.type === "value-word" && node.value === "#";
}

/** @returns {boolean} */ function isLeftCurlyBraceNode(node) {
  return node.type === "value-word" && node.value === "{";
}

/** @returns {boolean} */ function isRightCurlyBraceNode(node) {
  return node.type === "value-word" && node.value === "}";
}

/** @returns {boolean} */ function isWordNode(node) {
  return ["value-word", "value-atword"].includes(node.type);
}

/** @returns {boolean} */ function isColonNode(node) {
  return node?.type === "value-colon";
}

/** @returns {boolean} */ function isKeyInValuePairNode(node, parentNode) {
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

/** @returns {boolean} */ function isMediaAndSupportsKeywords(node) {
  return node.value && ["not", "and", "or"].includes(node.value.toLowerCase());
}

/** @returns {boolean} */ function isColorAdjusterFuncNode(node) {
  if (node.type !== "value-func") {
    return false;
  }

  return colorAdjusterFunctions.has(node.value.toLowerCase());
}

/** @returns {boolean} */ function lastLineHasInlineComment(/** @type {string} */ text) {
  return /\/\//u.test(text.split(/[\n\r]/u).pop());
}

/** @returns {boolean} */ function isAtWordPlaceholderNode(node) {
  return (
    node?.type === "value-atword" &&
    node.value.startsWith("prettier-placeholder-")
  );
}

/** @returns {boolean} */ function isConfigurationNode(node, parentNode) {
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

/** @returns {boolean} */ function isParenGroupNode(node) {
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
  insideICSSRuleNode,
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
