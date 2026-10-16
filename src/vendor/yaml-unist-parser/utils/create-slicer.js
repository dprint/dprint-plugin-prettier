// @nts-check
export function createSlicer(/** @type {any[]} */ array, /** @type {number} */ start) {
    /** @type {number} */ let index = start;
    return /** @returns {any[]} */ (/** @type {number} */ end) => array.slice(index, (index = end));
}
