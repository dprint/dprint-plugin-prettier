// @nts-check
/** @returns {boolean} */ function hasPragma(/** @type {string} */ text) {
  return /^\s*<!--\s*@(?:format|prettier)\s*-->/u.test(text);
}

/** @returns {string} */ function insertPragma(/** @type {string} */ text) {
  return "<!-- @format -->\n\n" + text;
}

export { hasPragma, insertPragma };
