// @nts-check
const locStart = /** @returns {number} */ (nodeOrToken) => nodeOrToken.loc.start;
const locEnd = /** @returns {number} */ (nodeOrToken) => nodeOrToken.loc.end;

export { locEnd, locStart };
