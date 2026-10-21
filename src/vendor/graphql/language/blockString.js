"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dedentBlockStringLines = dedentBlockStringLines;
exports.isPrintableAsBlockString = isPrintableAsBlockString;
exports.printBlockString = printBlockString;
const characterClasses_ts_1 = require("./characterClasses.js");
function dedentBlockStringLines(lines) {
    /** @type {number} */ let commonIndent = Number.MAX_SAFE_INTEGER;
    /** @type {number | null} */ let firstNonEmptyLine = null;
    /** @type {number} */ let lastNonEmptyLine = -1;
    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        /** @type {number} */ const indent = leadingWhitespace(line);
        if (indent === line.length) {
            continue;
        }
        firstNonEmptyLine ??= i;
        lastNonEmptyLine = i;
        if (i !== 0 && indent < commonIndent) {
            commonIndent = indent;
        }
    }
    return (lines
        .map((line, i) => (i === 0 ? line : line.slice(commonIndent)))
        .slice(firstNonEmptyLine ?? 0, lastNonEmptyLine + 1));
}
/** @returns {number} */ function leadingWhitespace(/** @type {string} */ str) {
    let i = 0;
    while (i < str.length && (0, characterClasses_ts_1.isWhiteSpace)(str.charCodeAt(i))) {
        ++i;
    }
    return i;
}
/** @returns {boolean} */ function isPrintableAsBlockString(/** @type {string} */ value) {
    if (value === '') {
        return true;
    }
    let isEmptyLine = true;
    let hasIndent = false;
    let hasCommonIndent = true;
    let seenNonEmptyLine = false;
    for (let i = 0; i < value.length; ++i) {
        switch (value.codePointAt(i)) {
            case 0x0000:
            case 0x0001:
            case 0x0002:
            case 0x0003:
            case 0x0004:
            case 0x0005:
            case 0x0006:
            case 0x0007:
            case 0x0008:
            case 0x000b:
            case 0x000c:
            case 0x000e:
            case 0x000f:
                return false;
            case 0x000d:
                return false;
            case 10:
                if (isEmptyLine && !seenNonEmptyLine) {
                    return false;
                }
                seenNonEmptyLine = true;
                isEmptyLine = true;
                hasIndent = false;
                break;
            case 9:
            case 32:
                hasIndent ||= isEmptyLine;
                break;
            default:
                hasCommonIndent &&= hasIndent;
                isEmptyLine = false;
        }
    }
    if (isEmptyLine) {
        return false;
    }
    if (hasCommonIndent && seenNonEmptyLine) {
        return false;
    }
    return true;
}
/** @returns {string} */ function printBlockString(/** @type {string} */ value, options) {
    const escapedValue = value.replaceAll('"""', '\\"""');
    const lines = escapedValue.split(/\r\n|[\n\r]/g);
    const isSingleLine = lines.length === 1;
    const forceLeadingNewLine = lines.length > 1 &&
        lines
            .slice(1)
            .every((line) => line.length === 0 || (0, characterClasses_ts_1.isWhiteSpace)(line.charCodeAt(0)));
    const hasTrailingTripleQuotes = escapedValue.endsWith('\\"""');
    const hasTrailingQuote = value.endsWith('"') && !hasTrailingTripleQuotes;
    const hasTrailingSlash = value.endsWith('\\');
    const forceTrailingNewline = hasTrailingQuote || hasTrailingSlash;
    const printAsMultipleLines = !options?.minimize &&
        (!isSingleLine ||
            value.length > 70 ||
            forceTrailingNewline ||
            forceLeadingNewLine ||
            hasTrailingTripleQuotes);
    let result = '';
    const skipLeadingNewLine = isSingleLine && (0, characterClasses_ts_1.isWhiteSpace)(value.charCodeAt(0));
    if ((printAsMultipleLines && !skipLeadingNewLine) || forceLeadingNewLine) {
        result += '\n';
    }
    result += escapedValue;
    if (printAsMultipleLines || forceTrailingNewline) {
        result += '\n';
    }
    return '"""' + result + '"""';
}
//# sourceMappingURL=blockString.js.map