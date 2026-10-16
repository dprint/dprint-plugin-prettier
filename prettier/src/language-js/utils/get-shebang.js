// @nts-check
/** @returns {string} */ function getShebang(/** @type {string} */ text) {
  if (!text.startsWith("#!")) {
    return "";
  }
  /** @type {number} */ const index = text.indexOf("\n");
  if (index === -1) {
    return text;
  }
  return text.slice(0, index);
}

export default getShebang;
