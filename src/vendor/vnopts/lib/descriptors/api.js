export const apiDescriptor = {
    key: key => /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(key) ? key : JSON.stringify(key),
    value(value) {
        if (value === null || typeof value !== 'object') {
            return JSON.stringify(value);
        }
        if (Array.isArray(value)) {
            return `[${value
                .map(subValue => apiDescriptor.value(subValue))
                .join(', ')}]`;
        }
        const keys = Object.keys(value);
        return keys.length === 0
            ? '{}'
            : `{ ${keys
                .map(key => `${apiDescriptor.key(key)}: ${apiDescriptor.value(value[key])}`)
                .join(', ')} }`;
    },
    pair: ({ key, value }) => apiDescriptor.value({ [key]: value }),
};
