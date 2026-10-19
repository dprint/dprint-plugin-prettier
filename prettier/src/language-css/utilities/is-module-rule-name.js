// @nts-check
const moduleRuleNames = new Set(["import", "use", "forward"]);

/** @returns {boolean} */ function isModuleRuleName(/** @type {string} */ name) {
  return moduleRuleNames.has(name);
}

export default isModuleRuleName;
