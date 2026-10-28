// @nts-check
import { devAssert } from "../jsutils/devAssert.mjs";
import { instanceOf } from "../jsutils/instanceOf.mjs";
const sourceSymbol = Symbol('Source');
export class Source {
    constructor(/** @type {string} */ body, /** @type {undefined | string} */ name = 'GraphQL request', locationOffset = { line: 1, column: 1 }) {
        this.__kind = sourceSymbol;
        /** @type {string} */ this.body = body;
        /** @type {string} */ this.name = name;
        this.locationOffset = locationOffset;
        if (!(this.locationOffset.line > 0))
            devAssert(false, 'line in locationOffset is 1-indexed and must be positive.');
        if (!(this.locationOffset.column > 0))
            devAssert(false, 'column in locationOffset is 1-indexed and must be positive.');
    }
    get [Symbol.toStringTag]() {
        return 'Source';
    }
}
/** @returns {boolean} */ export function isSource(/** @type {string} */ source) {
    return instanceOf(source, sourceSymbol, Source);
}
//# sourceMappingURL=source.js.map