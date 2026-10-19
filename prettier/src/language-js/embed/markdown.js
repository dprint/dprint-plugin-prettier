// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import {
  dedentToRoot,
  indent,
  literalline,
  softline,
} from "../../document/index.js";
import { escapeTemplateCharacters } from "../print/template-literal.js";

async function printEmbedMarkdown(textToDoc, print, /** @type {AstPath} */ path /* , options*/) {
  const { node } = path;
  let text = node.quasis[0].value.raw.replaceAll(
    /((?:\\\\)*)\\`/g,
    /** @returns {string} */ (/** @type {string} */ _, /** @type {string} */ backslashes) => "\\".repeat(backslashes.length / 2) + "`",
  );
  const indentation = getIndentation(text);
  /** @type {boolean} */ const hasIndent = indentation !== "";
  if (hasIndent) {
    text = text.replaceAll(new RegExp(`^${indentation}`, "gm"), "");
  }
  const doc = escapeTemplateCharacters(
    await textToDoc(text, { parser: "markdown", __inJsTemplate: true }),
    true,
  );
  return [
    "`",
    hasIndent ? indent([softline, doc]) : [literalline, dedentToRoot(doc)],
    softline,
    "`",
  ];
}

/** @returns {string} */ function getIndentation(/** @type {string} */ str) {
  const firstMatchedIndent = str.match(/^([^\S\n]*)\S/m);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

/**
 * md`...`
 * markdown`...`
 * @returns {boolean}
 */
function isEmbedMarkdown({ node, parent }) {
  return (
    parent?.type === "TaggedTemplateExpression" &&
    node.quasis.length === 1 &&
    parent.tag.type === "Identifier" &&
    (parent.tag.name === "md" || parent.tag.name === "markdown")
  );
}

export { isEmbedMarkdown, printEmbedMarkdown };
