import { containsNewline } from './util-contains-newline.js';

function flowIndentCheck(/** @type {number} */ indent, /** @type {undefined | null | import("yaml-cst-types").Token} */ fc, /** @type {import("yaml-cst-types").ComposeErrorHandler} */ onError) {
    if (fc?.type === 'flow-collection') {
        const end = fc.end[0];
        if (end.indent === indent &&
            (end.source === ']' || end.source === '}') &&
            containsNewline(fc)) {
            const msg = 'Flow end indicator should be more indented than parent';
            onError(end, 'BAD_INDENT', msg, true);
        }
    }
}

export { flowIndentCheck };
