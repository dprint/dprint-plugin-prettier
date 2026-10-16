// @nts-check
/** @returns {boolean} */ function hasPragma(/** @type {string} */ text) {
  return /^\s*#[^\S\n]*@(?:format|prettier)\s*(?:\n|$)/u.test(text);
}

/** @returns {string} */ function insertPragma(/** @type {string} */ text) {
  return "# @format\n\n" + text;
}

export { hasPragma, insertPragma };
