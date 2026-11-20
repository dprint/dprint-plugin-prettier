// @nts-check
import {
  hasIgnorePragma as jsHasIgnorePragma,
  hasPragma as jsHasPragma,
  insertPragma as jsInsertPragma,
} from "../language-js/pragma.js";
import { parseFrontMatter } from "../main/front-matter/index.js";

const hasPragma = /** @returns {boolean} */ (/** @type {string} */ text) => jsHasPragma(parseFrontMatter(text).content);
const hasIgnorePragma = /** @returns {boolean} */ (/** @type {string} */ text) =>
  jsHasIgnorePragma(parseFrontMatter(text).content);
const insertPragma = /** @returns {string} */ (/** @type {string} */ text) => {
  const { frontMatter, content } = parseFrontMatter(text);
  return (
    (frontMatter ? frontMatter.raw + "\n\n" : "") + jsInsertPragma(content)
  );
};

export { hasIgnorePragma, hasPragma, insertPragma };
