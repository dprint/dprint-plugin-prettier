// @nts-check
export { createScalarToken, resolveAsScalar, setScalarValue } from './cst-scalar.js';
export { stringify } from './cst-stringify.js';
export { visit } from './cst-visit.js';

/** The byte order mark */
/** @type {string} */ const BOM = '\u{FEFF}';
/** Start of doc-mode */
/** @type {string} */ const DOCUMENT = '\x02'; // C0: Start of Text
/** Unexpected end of flow-mode */
/** @type {string} */ const FLOW_END = '\x18'; // C0: Cancel
/** Next token is a scalar value */
/** @type {string} */ const SCALAR = '\x1f'; // C0: Unit Separator
/** @returns `true` if `token` is a flow or block collection */
const isCollection = /** @returns {boolean} */ (/** @type {import("yaml-cst-types").Token | null | undefined} */ token) => !!token && 'items' in token;
/** @returns `true` if `token` is a flow or block scalar; not an alias */
const isScalar = /** @returns {boolean} */ (/** @type {import("yaml-cst-types").Token | null | undefined} */ token) => !!token &&
    (token.type === 'scalar' ||
        token.type === 'single-quoted-scalar' ||
        token.type === 'double-quoted-scalar' ||
        token.type === 'block-scalar');
/* istanbul ignore next */
/** Get a printable representation of a lexer token */
/** @returns {string} */ function prettyToken(/** @type {string} */ token) {
    switch (token) {
        case BOM:
            return '<BOM>';
        case DOCUMENT:
            return '<DOC>';
        case FLOW_END:
            return '<FLOW_END>';
        case SCALAR:
            return '<SCALAR>';
        default:
            return JSON.stringify(token);
    }
}
/** Identify the type of a lexer token. May return `null` for unknown tokens. @returns {string | null} */
function tokenType(/** @type {string} */ source) {
    switch (source) {
        case BOM:
            return 'byte-order-mark';
        case DOCUMENT:
            return 'doc-mode';
        case FLOW_END:
            return 'flow-error-end';
        case SCALAR:
            return 'scalar';
        case '---':
            return 'doc-start';
        case '...':
            return 'doc-end';
        case '':
        case '\n':
        case '\r\n':
            return 'newline';
        case '-':
            return 'seq-item-ind';
        case '?':
            return 'explicit-key-ind';
        case ':':
            return 'map-value-ind';
        case '{':
            return 'flow-map-start';
        case '}':
            return 'flow-map-end';
        case '[':
            return 'flow-seq-start';
        case ']':
            return 'flow-seq-end';
        case ',':
            return 'comma';
    }
    switch (source[0]) {
        case ' ':
        case '\t':
            return 'space';
        case '#':
            return 'comment';
        case '%':
            return 'directive-line';
        case '*':
            return 'alias';
        case '&':
            return 'anchor';
        case '!':
            return 'tag';
        case "'":
            return 'single-quoted-scalar';
        case '"':
            return 'double-quoted-scalar';
        case '|':
        case '>':
            return 'block-scalar-header';
    }
    return null;
}

export { BOM, DOCUMENT, FLOW_END, SCALAR, isCollection, isScalar, prettyToken, tokenType };
