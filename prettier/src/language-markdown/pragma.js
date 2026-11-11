// @nts-check
import { parseFrontMatter } from "../main/front-matter/index.js";
import {
  FORMAT_PRAGMA_TO_INSERT,
  MARKDOWN_HAS_IGNORE_PRAGMA_REGEXP,
  MARKDOWN_HAS_PRAGMA_REGEXP,
} from "../utilities/pragma/pragma.evaluate.js";

const hasPragma = /** @returns {boolean} */ (/** @type {string} */ text) =>
  parseFrontMatter(text).content.trimStart().match(MARKDOWN_HAS_PRAGMA_REGEXP)
    ?.index === 0;

const hasIgnorePragma = (text) =>
  parseFrontMatter(text)
    .content.trimStart()
    .match(MARKDOWN_HAS_IGNORE_PRAGMA_REGEXP)?.index === 0;

const insertPragma = /** @returns {string} */ (/** @type {string} */ text) => {
  const { frontMatter } = parseFrontMatter(text);
  const pragma = `<!-- @${FORMAT_PRAGMA_TO_INSERT} -->`;
  return frontMatter
    ? `${frontMatter.raw}\n\n${pragma}\n\n${text.slice(frontMatter.end.index)}`
    : `${pragma}\n\n${text}`;
};

export { hasIgnorePragma, hasPragma, insertPragma };
