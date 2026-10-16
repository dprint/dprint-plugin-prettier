// @nts-check
function isPragma(text) {
  return /^\s*@(?:prettier|format)\s*$/u.test(text);
}

/** @returns {boolean} */ function hasPragma(/** @type {string} */ text) {
  return /^\s*#[^\S\n]*@(?:prettier|format)\s*?(?:\n|$)/u.test(text);
}

/** @returns {string} */ function insertPragma(/** @type {string} */ text) {
  return `# @format\n\n${text}`;
}

export { hasPragma, insertPragma, isPragma };
