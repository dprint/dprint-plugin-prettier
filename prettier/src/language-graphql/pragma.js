// @nts-check
import {
  FORMAT_PRAGMA_TO_INSERT,
  GRAPHQL_HAS_IGNORE_PRAGMA_REGEXP,
  GRAPHQL_HAS_PRAGMA_REGEXP,
} from "../utilities/pragma/pragma.evaluate.js";

const hasPragma = (/** @type {string} */ text) => GRAPHQL_HAS_PRAGMA_REGEXP.test(text);
const hasIgnorePragma = (/** @type {string} */ text) => GRAPHQL_HAS_IGNORE_PRAGMA_REGEXP.test(text);
const insertPragma = (/** @type {string} */ text) => `# @${FORMAT_PRAGMA_TO_INSERT}\n\n${text}`;

export { hasIgnorePragma, hasPragma, insertPragma };
