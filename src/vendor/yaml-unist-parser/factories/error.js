// @nts-check
export function createError(/** @type {string} */ message, /** @type {string} */ source, position) {
    const error = new SyntaxError(message);
    error.name = "YAMLSyntaxError";
    error.source = source;
    error.position = position;
    return error;
}
