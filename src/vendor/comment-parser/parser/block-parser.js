// @nts-check
const reTag = /^@[^\s/]+(?=\s|$)/;
/**
 * Creates configured `Parser`
 * @param {Partial<Options>} options
 */
export default function getParser({ fence = '```', } = {}) {
    const fencer = getFencer(fence);
    const toggleFence = /** @returns {boolean} */ (/** @type {string} */ source, /** @type {boolean} */ isFenced) => fencer(source) ? !isFenced : isFenced;
    return function parseBlock(source) {
        // start with description section
        const sections = [[]];
        let isFenced = false;
        for (const line of source) {
            if (reTag.test(line.tokens.description) && !isFenced) {
                sections.push([line]);
            }
            else {
                sections[sections.length - 1].push(line);
            }
            isFenced = toggleFence(line.tokens.description, isFenced);
        }
        return sections;
    };
}
function getFencer(/** @type {string | ((source: string) => boolean)} */ fence) {
    if (typeof fence === 'string')
        return /** @returns {boolean} */ (/** @type {string} */ source) => source.split(fence).length % 2 === 0;
    return fence;
}
