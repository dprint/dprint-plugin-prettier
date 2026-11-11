// @nts-check
import { hardline } from "../document/index.js";

/** @import AstPath from "../common/ast-path.js" */

function embed(/** @type {AstPath} */ path, options) {
  const { node } = path;

  // Try to format `.prettierrc`, `.stylelintrc`, and `.lintstagedrc` as `json` first
  if (
    node.type === "root" &&
    options.filepath &&
    /(?:[/\\]|^)\.(?:prettier|stylelint|lintstaged)rc$/.test(options.filepath)
  ) {
    return async (textToDoc) => {
      const doc = await textToDoc(options.originalText, { parser: "json" });
      return doc ? [doc, hardline] : undefined;
    };
  }
}

// Only "root" allow print as JSON
// Use `[]` to prevent `printEmbeddedLanguages` traverse deep
embed.getVisitorKeys = /** @returns {any[]} */ () => [];

export default embed;
