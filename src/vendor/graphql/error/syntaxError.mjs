// @nts-check
import { GraphQLError } from "./GraphQLError.mjs";
/** @returns {GraphQLError} */ export function syntaxError(/** @type {import("../language/source.mjs").Source} */ source, /** @type {number} */ position, /** @type {string} */ description) {
    return new GraphQLError(`Syntax Error: ${description}`, {
        source,
        positions: [position],
    });
}
//# sourceMappingURL=syntaxError.js.map