// @nts-check
import { createNode } from '../doc/createNode.js';
import { stringifyPair } from '../stringify/stringifyPair.js';
import { addPairToJSMap } from './addPairToJSMap.js';
import { NODE_TYPE, PAIR, isNode } from './identity.js';

/** @returns {Pair} */ function createPair(key, value, /** @type {import("yaml-cst-types").CreateNodeContext} */ ctx) {
    const k = createNode(key, undefined, ctx);
    const v = createNode(value, undefined, ctx);
    return new Pair(k, v);
}
/**
 * the item of the source that composing made the pair from
 * @property {import("yaml-cst-types").CollectionItem} [srcToken]
 */
class Pair {
    constructor(/** @type {import("./Scalar.js").Scalar | import("./YAMLMap.js").YAMLMap | import("./Alias.js").Alias | import("./YAMLSeq.js").YAMLSeq} */ key, value = null) {
        Object.defineProperty(this, NODE_TYPE, { value: PAIR });
        /** @type {import("./Scalar.js").Scalar | import("./YAMLMap.js").YAMLMap | import("./Alias.js").Alias | import("./YAMLSeq.js").YAMLSeq} */ this.key = key;
        /** @type {import("./Scalar.js").Scalar | import("./YAMLMap.js").YAMLMap | import("./YAMLSeq.js").YAMLSeq | import("./Alias.js").Alias | import("../schema/yaml-1.1/omap.js").YAMLOMap | import("../schema/yaml-1.1/set.js").YAMLSet | null} */ this.value = value;
    }
    /** @returns {Pair} */ clone(schema) {
        let { key, value } = this;
        if (isNode(key))
            key = key.clone(schema);
        if (isNode(value))
            value = value.clone(schema);
        return new Pair(key, value);
    }
    toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? new Map() : {};
        return addPairToJSMap(ctx, pair, this);
    }
    /** @returns {string} */ toString(ctx, onComment, onChompKeep) {
        return ctx?.doc
            ? stringifyPair(this, ctx, onComment, onChompKeep)
            : JSON.stringify(this);
    }
}

export { Pair, createPair };
