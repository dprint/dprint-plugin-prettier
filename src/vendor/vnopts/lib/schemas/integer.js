import { isInt } from '../utils.js';
import { NumberSchema } from './number.js';
export class IntegerSchema extends NumberSchema {
    expected() {
        return 'an integer';
    }
    validate(value, /** @type {import("../normalize.js").VnoptsUtils} */ utils) {
        return (utils.normalizeValidateResult(super.validate(value, utils), value) ===
            true && isInt(value));
    }
}
