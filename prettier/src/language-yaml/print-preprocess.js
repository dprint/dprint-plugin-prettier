// @nts-check
import { defineShortcut, mapNode } from "./utilities.js";
/** @import { YamlNode } from "../../../src/vendor/yaml-unist-parser/transforms/context.mjs" */

function preprocess(ast) {
  return mapNode(ast, defineShortcuts);
}

/** @returns {YamlNode} */ function defineShortcuts(/** @type {YamlNode} */ node) {
  switch (node.type) {
    case "document":
      defineShortcut(node, "head", () => node.children[0]);
      defineShortcut(node, "body", () => node.children[1]);
      break;
    case "documentBody":
    case "sequenceItem":
    case "flowSequenceItem":
    case "mappingKey":
    case "mappingValue":
      defineShortcut(node, "content", () => node.children[0]);
      break;
    case "mappingItem":
    case "flowMappingItem":
      defineShortcut(node, "key", () => node.children[0]);
      defineShortcut(node, "value", () => node.children[1]);
      break;
  }
  return node;
}

export default preprocess;
