// @nts-check
/** @type {string} */ var LF = '\n';
/** @type {string} */ var CR = '\r';
var LinesAndColumns = /** @class */ (function () {
    function LinesAndColumns(/** @type {string} */ string) {
        this.length = string.length;
        /** @type {number[]} */ var offsets = [0];
        for (var offset = 0; offset < string.length;) {
            switch (string[offset]) {
                case LF:
                    offset += LF.length;
                    offsets.push(offset);
                    break;
                case CR:
                    offset += CR.length;
                    if (string[offset] === LF) {
                        offset += LF.length;
                    }
                    offsets.push(offset);
                    break;
                default:
                    offset++;
                    break;
            }
        }
        this.offsets = offsets;
    }
    LinesAndColumns.prototype.locationForIndex = function (/** @type {number} */ index) {
        if (index < 0 || index > this.length) {
            return null;
        }
        /** @type {number} */ var line = 0;
        /** @type {number[]} */ var offsets = this.offsets;
        while (offsets[line + 1] <= index) {
            line++;
        }
        /** @type {number} */ var column = index - offsets[line];
        return { line: line, column: column };
    };
    LinesAndColumns.prototype.indexForLocation = /** @returns {number | null} */ function (location) {
        var line = location.line, column = location.column;
        if (line < 0 || line >= this.offsets.length) {
            return null;
        }
        if (column < 0 || column > this.lengthOfLine(line)) {
            return null;
        }
        return this.offsets[line] + column;
    };
    LinesAndColumns.prototype.lengthOfLine = /** @returns {number} */ function (/** @type {number} */ line) {
        /** @type {number} */ var offset = this.offsets[line];
        /** @type {number} */ var nextOffset = line === this.offsets.length - 1
            ? this.length
            : this.offsets[line + 1];
        return nextOffset - offset;
    };
    return LinesAndColumns;
}());
export { LinesAndColumns };
