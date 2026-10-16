import { Schema } from '../schema.js';
export class ArraySchema extends Schema {
    constructor({ valueSchema, name = valueSchema.name, ...handlers }) {
        super({ ...handlers, name });
        this._valueSchema = valueSchema;
    }
    expected(utils) {
        const { text, list } = utils.normalizeExpectedResult(this._valueSchema.expected(utils));
        return {
            text: text && `an array of ${text}`,
            list: list && {
                title: `an array of the following values`,
                values: [{ list }],
            },
        };
    }
    validate(value, utils) {
        if (!Array.isArray(value)) {
            return false;
        }
        const invalidValues = [];
        for (const subValue of value) {
            const subValidateResult = utils.normalizeValidateResult(this._valueSchema.validate(subValue, utils), subValue);
            if (subValidateResult !== true) {
                invalidValues.push(subValidateResult.value);
            }
        }
        return invalidValues.length === 0 ? true : { value: invalidValues };
    }
    deprecated(value, utils) {
        const deprecatedResult = [];
        for (const subValue of value) {
            const subDeprecatedResult = utils.normalizeDeprecatedResult(this._valueSchema.deprecated(subValue, utils), subValue);
            if (subDeprecatedResult !== false) {
                deprecatedResult.push(...subDeprecatedResult.map(({ value: deprecatedValue }) => ({
                    value: [deprecatedValue],
                })));
            }
        }
        return deprecatedResult;
    }
    forward(value, utils) {
        const forwardResult = [];
        for (const subValue of value) {
            const subForwardResult = utils.normalizeForwardResult(this._valueSchema.forward(subValue, utils), subValue);
            forwardResult.push(...subForwardResult.map(wrapTransferResult));
        }
        return forwardResult;
    }
    redirect(value, utils) {
        const remain = [];
        const redirect = [];
        for (const subValue of value) {
            const subRedirectResult = utils.normalizeRedirectResult(this._valueSchema.redirect(subValue, utils), subValue);
            if ('remain' in subRedirectResult) {
                remain.push(subRedirectResult.remain);
            }
            redirect.push(...subRedirectResult.redirect.map(wrapTransferResult));
        }
        return remain.length === 0 ? { redirect } : { redirect, remain };
    }
    overlap(currentValue, newValue) {
        return currentValue.concat(newValue);
    }
}
function wrapTransferResult({ from, to }) {
    return { from: [from], to };
}
