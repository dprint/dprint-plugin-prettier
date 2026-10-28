// @nts-check
import { isScalar } from '../nodes/identity.js';

/** @returns {boolean} */ function mapIncludes(/** @type {import("yaml-cst-types").ComposeContext} */ ctx, /** @type {any[]} */ items, /** @type {import("../nodes/Scalar.js").Scalar | import("../nodes/YAMLMap.js").YAMLMap | import("../nodes/Alias.js").Alias | import("../nodes/YAMLSeq.js").YAMLSeq} */ search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
        return false;
    const isEqual = typeof uniqueKeys === 'function'
        ? uniqueKeys
        : (a, b) => a === b || (isScalar(a) && isScalar(b) && a.value === b.value);
    return items.some(pair => isEqual(pair.key, search));
}

export { mapIncludes };
