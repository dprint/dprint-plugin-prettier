/**
 * @returns {boolean}
 */
function isTsKeywordType(/** @type {{ type: string }} */ { type }) {
  return type.startsWith("TS") && type.endsWith("Keyword");
}

export default isTsKeywordType;
