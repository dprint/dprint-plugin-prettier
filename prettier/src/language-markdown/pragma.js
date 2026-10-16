// @nts-check
import parseFrontMatter from "../utils/front-matter/parse.js";

const pragmas = ["format", "prettier"];

/** @returns {boolean} */ function startWithPragma(/** @type {string} */ text) {
  const pragma = `@(${pragmas.join("|")})`;
  const regex = new RegExp(
    // eslint-disable-next-line regexp/match-any
    [
      `<!--\\s*${pragma}\\s*-->`,
      `\\{\\s*\\/\\*\\s*${pragma}\\s*\\*\\/\\s*\\}`,
      `<!--.*\r?\n[\\s\\S]*(^|\n)[^\\S\n]*${pragma}[^\\S\n]*($|\n)[\\s\\S]*\n.*-->`,
    ].join("|"),
    "mu",
  );
  const matched = text.match(regex);
  return matched?.index === 0;
}

const hasPragma = /** @returns {boolean} */ (/** @type {string} */ text) =>
  startWithPragma(parseFrontMatter(text).content.trimStart());

const insertPragma = /** @returns {string} */ (/** @type {string} */ text) => {
  const extracted = parseFrontMatter(text);
  const pragma = `<!-- @${pragmas[0]} -->`;
  return extracted.frontMatter
    ? `${extracted.frontMatter.raw}\n\n${pragma}\n\n${extracted.content}`
    : `${pragma}\n\n${extracted.content}`;
};

export { hasPragma, insertPragma, startWithPragma };
