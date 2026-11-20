import { SCALAR } from './identity.js';
import { NodeBase } from './Node.js';
import { toJS } from './toJS.js';

const isScalarValue = (value) => !value || (typeof value !== 'function' && typeof value !== 'object');
/**
 * what composing gives a scalar (yaml/dist/nodes/Scalar.d.ts)
 * @property {string} [source]
 * @property {string} [type]
 * @property {string} [tag]
 * @property {number} [minFractionDigits]
 */
class Scalar extends NodeBase {
    constructor(value) {
        super(SCALAR);
        this.value = value;
    }
    toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS(this.value, arg, ctx);
    }
    /** @returns {string} */ toString() {
        return String(this.value);
    }
}
Scalar.BLOCK_FOLDED = 'BLOCK_FOLDED';
Scalar.BLOCK_LITERAL = 'BLOCK_LITERAL';
Scalar.PLAIN = 'PLAIN';
Scalar.QUOTE_DOUBLE = 'QUOTE_DOUBLE';
Scalar.QUOTE_SINGLE = 'QUOTE_SINGLE';

export { Scalar, isScalarValue };
