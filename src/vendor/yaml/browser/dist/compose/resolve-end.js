// @nts-check
/** @returns {import("yaml-cst-types").ResolvedEnd} */ function resolveEnd(/** @type {import("yaml-cst-types").Token[] | undefined} */ end, /** @type {number} */ offset, /** @type {boolean} */ reqSpace, /** @type {import("yaml-cst-types").ComposeErrorHandler} */ onError) {
    let comment = '';
    if (end) {
        /** @type {boolean} */ let hasSpace = false;
        /** @type {string} */ let sep = '';
        for (const token of end) {
            const { source, type } = token;
            switch (type) {
                case 'space':
                    hasSpace = true;
                    break;
                case 'comment': {
                    if (reqSpace && !hasSpace)
                        onError(token, 'MISSING_CHAR', 'Comments must be separated from other tokens by white space characters');
                    const cb = source.substring(1) || ' ';
                    if (!comment)
                        comment = cb;
                    else
                        comment += sep + cb;
                    sep = '';
                    break;
                }
                case 'newline':
                    if (comment)
                        sep += source;
                    hasSpace = true;
                    break;
                default:
                    onError(token, 'UNEXPECTED_TOKEN', `Unexpected ${type} at node end`);
            }
            offset += source.length;
        }
    }
    return { comment, offset };
}

export { resolveEnd };
