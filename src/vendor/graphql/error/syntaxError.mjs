// @nts-check
import { GraphQLError } from './GraphQLError.mjs';
/**
 * Produces a GraphQLError representing a syntax error, containing useful
 * descriptive information about the syntax error's position in the source.
 * @returns {GraphQLError}
 */

export function syntaxError(/** @type {import("../language/source.mjs").Source} */ source, /** @type {number} */ position, /** @type {string} */ description) {
  return new GraphQLError(`Syntax Error: ${description}`, {
    source,
    positions: [position],
  });
}
