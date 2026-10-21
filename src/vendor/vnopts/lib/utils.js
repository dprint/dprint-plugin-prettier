// @nts-check
/** @returns {Record<string, any>} */ export function recordFromArray(/** @type {any[]} */ array, /** @type {string} */ mainKey) {
    /** @type {Record<string, any>} */ const record = Object.create(null);
    for (const value of array) {
        const key = value[mainKey];
        /* c8 ignore start */
        if (record[key]) {
            throw new Error(`Duplicate ${mainKey} ${JSON.stringify(key)}`);
        }
        /* c8 ignore stop */
        // @ts-ignore
        record[key] = value;
    }
    return record;
}
export function mapFromArray(/** @type {any[]} */ array, /** @type {string} */ mainKey) {
    const map = new Map();
    for (const value of array) {
        const key = value[mainKey];
        /* c8 ignore start */
        if (map.has(key)) {
            throw new Error(`Duplicate ${mainKey} ${JSON.stringify(key)}`);
        }
        /* c8 ignore stop */
        map.set(key, value);
    }
    return map;
}
/** @returns {(id: any) => boolean} */ export function createAutoChecklist() {
    /** @type {Record<string, any>} */ const map = Object.create(null);
    return /** @returns {boolean} */ (id) => {
        const idString = JSON.stringify(id);
        if (map[idString]) {
            return true;
        }
        map[idString] = true;
        return false;
    };
}
/** @returns {any[]} */ export function partition(/** @type {any[]} */ array, /** @type {(a0?: any) => any} */ predicate) {
    const trueArray = [];
    const falseArray = [];
    for (const value of array) {
        if (predicate(value)) {
            trueArray.push(value);
        }
        else {
            falseArray.push(value);
        }
    }
    return [trueArray, falseArray];
}
/** @returns {boolean} */ export function isInt(/** @type {number} */ value) {
    return value === Math.floor(value);
}
/** @returns {number} */ export function comparePrimitive(a, b) {
    if (a === b) {
        return 0;
    }
    const typeofA = typeof a;
    const typeofB = typeof b;
    const orders = [
        'undefined',
        'object', // null
        'boolean',
        'number',
        'string',
    ];
    if (typeofA !== typeofB) {
        return orders.indexOf(typeofA) - orders.indexOf(typeofB);
    }
    if (typeofA !== 'string') {
        return Number(a) - Number(b);
    }
    return a.localeCompare(b);
}
export function normalizeInvalidHandler(/** @type {(...args: any[]) => any} */ invalidHandler) {
    return (...args) => {
        const errorMessageOrError = invalidHandler(...args);
        return typeof errorMessageOrError === 'string'
            ? new Error(errorMessageOrError) /* c8 ignore start */
            : errorMessageOrError; /* c8 ignore stop */
    };
}
export function normalizeDefaultResult(result) {
    return result === undefined ? {} : result;
}
/**
 * What a schema expects, as the handler of invalid options reads it
 * @typedef {{ text?: string, list?: { title: string, values: VnoptsExpected[] } }} VnoptsExpected
 * What a schema says it expects, where it may write what it expects or the values of a list as text alone
 * @typedef {string | { text?: string, list?: { title: string, values: VnoptsExpectedResult[] } }} VnoptsExpectedResult
 */
/** @returns {VnoptsExpected} */ export function normalizeExpectedResult(/** @type {VnoptsExpectedResult} */ result) {
    if (typeof result === 'string') {
        return { text: result };
    }
    const { text, list } = result;
    assert((text || list) !== undefined, 'Unexpected `expected` result, there should be at least one field.');
    if (!list) {
        return { text };
    }
    return {
        text,
        list: {
            title: list.title,
            values: list.values.map(normalizeExpectedResult),
        },
    };
}
/** @returns {true | { value: any }} */ export function normalizeValidateResult(/** @type {boolean | { value: any }} */ result, value) {
    return result === true ? true : result === false ? { value } : result;
}
/** @returns {boolean | any[]} */ export function normalizeDeprecatedResult(result, value, doNotNormalizeTrue = false) {
    return result === false
        ? false
        : result === true
            ? doNotNormalizeTrue
                ? true
                : [{ value }]
            : 'value' in result
                ? [result]
                : result.length === 0
                    ? false
                    : result;
}
/** @returns {{ from: any, to: any }} */ export function normalizeTransferResult(result, value) {
    return typeof result === 'string' || 'key' in result
        ? { from: value, to: result }
        : 'from' in result
            ? { from: result.from, to: result.to }
            : { from: value, to: result.to };
}
/** @returns {any[]} */ export function normalizeForwardResult(/** @type {any[] | undefined} */ result, value) {
    return result === undefined
        ? []
        : Array.isArray(result)
            ? result.map(transferResult => normalizeTransferResult(transferResult, value))
            : [normalizeTransferResult(result, value)];
}
/** @returns {{ remain?: any, redirect: any[] }} */ export function normalizeRedirectResult(result, value) {
    const redirect = normalizeForwardResult(typeof result === 'object' && 'redirect' in result
        ? result.redirect
        : result, value);
    return redirect.length === 0
        ? { remain: value, redirect }
        : typeof result === 'object' && 'remain' in result
            ? { remain: result.remain, redirect }
            : { redirect };
}
export function assert(isValid, /** @type {string} */ message) {
    /* c8 ignore start */
    if (!isValid) {
        throw new Error(message);
    }
    /* c8 ignore stop */
}
