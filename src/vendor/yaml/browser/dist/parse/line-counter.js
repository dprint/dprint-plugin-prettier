// @nts-check
/**
 * Tracks newlines during parsing in order to provide an efficient API for
 * determining the one-indexed `{ line, col }` position for any offset
 * within the input.
 */
/**
 * a one-indexed line and column, which is only read where it is given, so that it is a struct
 * @typedef {Readonly<{ line: number, col: number }>} LinePos
 */
class LineCounter {
    constructor() {
        /** @type {number[]} */ this.lineStarts = [];
        /**
         * Should be called in ascending order. Otherwise, call
         * `lineCounter.lineStarts.sort()` before calling `linePos()`.
         */
        /** @type {(offset: number) => number} */ this.addNewLine = /** @returns {number} */ (/** @type {number} */ offset) => this.lineStarts.push(offset);
        /**
         * Performs a binary search and returns the 1-indexed { line, col }
         * position of `offset`. If `line === 0`, `addNewLine` has never been
         * called or `offset` is before the first known newline.
         */
        /** @type {(offset: number) => LinePos} */ this.linePos = (/** @type {number} */ offset) => {
            /** @type {number} */ let low = 0;
            /** @type {number} */ let high = this.lineStarts.length;
            while (low < high) {
                /** @type {number} */ const mid = (low + high) >> 1; // Math.floor((low + high) / 2)
                if (this.lineStarts[mid] < offset)
                    low = mid + 1;
                else
                    high = mid;
            }
            if (this.lineStarts[low] === offset)
                return { line: low + 1, col: 1 };
            if (low === 0)
                return { line: 0, col: offset };
            /** @type {number} */ const start = this.lineStarts[low - 1];
            return { line: low, col: offset - start + 1 };
        };
    }
}

export { LineCounter };
