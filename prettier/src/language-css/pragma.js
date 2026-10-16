// @nts-check
import {
  hasPragma as jsHasPragma,
  insertPragma as jsInsertPragma,
} from "../language-js/pragma.js";
import parseFrontMatter from "../utils/front-matter/parse.js";

/** @returns {boolean} */ function hasPragma(/** @type {string} */ text) {
  return jsHasPragma(parseFrontMatter(text).content);
}

/** @returns {string} */ function insertPragma(/** @type {string} */ text) {
  const { frontMatter, content } = parseFrontMatter(text);
  return (
    (frontMatter ? frontMatter.raw + "\n\n" : "") + jsInsertPragma(content)
  );
}

export { hasPragma, insertPragma };
