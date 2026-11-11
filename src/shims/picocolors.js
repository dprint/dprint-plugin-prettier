// @nts-check
// colors are left out, as they are when the output is not a terminal
/**
 * @template T
 * @param {T} text
 * @returns {T}
 */
const same = (text) => text;
const picocolors = { blue: same, gray: same, red: same, yellow: same, bold: same };

export default picocolors;
