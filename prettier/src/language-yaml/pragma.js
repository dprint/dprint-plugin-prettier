// @nts-check
import {
  FORMAT_PRAGMA_TO_INSERT,
  YAML_HAS_IGNORE_PRAGMA_REGEXP,
  YAML_HAS_PRAGMA_REGEXP,
  YAML_IS_PRAGMA_REGEXP,
} from "../utilities/pragma/pragma.evaluate.js";

const isPragma = /** @returns {boolean} */ (/** @type {string} */ text) => YAML_IS_PRAGMA_REGEXP.test(text);
const hasPragma = /** @returns {boolean} */ (/** @type {string} */ text) => YAML_HAS_PRAGMA_REGEXP.test(text);
const hasIgnorePragma = /** @returns {boolean} */ (/** @type {string} */ text) => YAML_HAS_IGNORE_PRAGMA_REGEXP.test(text);
const insertPragma = /** @returns {string} */ (/** @type {string} */ text) => `# @${FORMAT_PRAGMA_TO_INSERT}\n\n${text}`;

export { hasIgnorePragma, hasPragma, insertPragma, isPragma };
