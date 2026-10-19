// @nts-check
export function recordFromArray(array, mainKey) {
    const record = Object.create(null);
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
export function createAutoChecklist() {
    const map = Object.create(null);
    return (id) => {
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
export function comparePrimitive(a, b) {
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
export function normalizeInvalidHandler(invalidHandler) {
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
export function normalizeExpectedResult(result) {
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
export function normalizeValidateResult(/** @type {boolean} */ result, value) {
    return result === true ? true : result === false ? { value } : result;
}
export function normalizeDeprecatedResult(result, value, doNotNormalizeTrue = false) {
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
export function normalizeTransferResult(result, value) {
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
export function normalizeRedirectResult(result, value) {
    const redirect = normalizeForwardResult(typeof result === 'object' && 'redirect' in result
        ? result.redirect
        : result, value);
    return redirect.length === 0
        ? { remain: value, redirect }
        : typeof result === 'object' && 'remain' in result
            ? { remain: result.remain, redirect }
            : { redirect };
}
export function assert(isValid, message) {
    /* c8 ignore start */
    if (!isValid) {
        throw new Error(message);
    }
    /* c8 ignore stop */
}
