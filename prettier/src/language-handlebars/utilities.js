// @nts-check
// Do not use void tags from other package, won't match
import { getVoidTags } from "@glimmer/syntax";

/** @import AstPath from "../common/ast-path.js" */

const htmlVoidElements = new Set(getVoidTags());

/** @returns {boolean} */ function isUppercase(/** @type {string} */ string) {
  return string.toUpperCase() === string;
}

/** @returns {boolean} */ function isGlimmerComponent(node) {
  return (
    node.type === "ElementNode" &&
    typeof node.tag === "string" &&
    !node.tag.startsWith(":") &&
    (isUppercase(node.tag[0]) || node.tag.includes("."))
  );
}

// https://github.com/glimmerjs/glimmer-vm/blob/ec5648f3895b9ab8d085523be001553746221449/packages/%40glimmer/syntax/lib/generation/printer.ts#L44-L46
/** @returns {boolean} */ function isVoidTag(/** @type {string} */ tag) {
  return htmlVoidElements.has(tag.toLowerCase()) && !isUppercase(tag[0]);
}

/** @returns {boolean} */ function isVoidElement(node) {
  return (
    node.selfClosing === true ||
    isVoidTag(node.tag) ||
    (isGlimmerComponent(node) &&
      node.children.every(/** @returns {boolean} */ (node) => isWhitespaceNode(node)))
  );
}

/** @returns {boolean} */ function isWhitespaceNode(node) {
  return node.type === "TextNode" && !/\S/.test(node.chars);
}

/** @returns {boolean} */ function isPrettierIgnoreNode(node) {
  return (
    node?.type === "MustacheCommentStatement" &&
    typeof node.value === "string" &&
    node.value.trim() === "prettier-ignore"
  );
}

/** @returns {boolean} */ function hasPrettierIgnore(/** @type {AstPath} */ path) {
  return (
    isPrettierIgnoreNode(path.node) ||
    (path.isInArray &&
      (path.key === "children" ||
        path.key === "body" ||
        path.key === "parts") &&
      isPrettierIgnoreNode(path.siblings[path.index - 2]))
  );
}

export { hasPrettierIgnore, isVoidElement, isWhitespaceNode };
