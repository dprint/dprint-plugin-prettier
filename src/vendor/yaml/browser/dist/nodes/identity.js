// @nts-check
const ALIAS = Symbol.for('yaml.alias');
const DOC = Symbol.for('yaml.document');
const MAP = Symbol.for('yaml.map');
const PAIR = Symbol.for('yaml.pair');
const SCALAR = Symbol.for('yaml.scalar');
const SEQ = Symbol.for('yaml.seq');
const NODE_TYPE = Symbol.for('yaml.node.type');
const isAlias = /** @returns {boolean} */ (/** @type {import("./YAMLMap.js").YAMLMap | import("./Scalar.js").Scalar | import("./YAMLSeq.js").YAMLSeq | import("./Alias.js").Alias | import("../schema/yaml-1.1/omap.js").YAMLOMap | import("../schema/yaml-1.1/set.js").YAMLSet} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === ALIAS;
const isDocument = (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === DOC;
const isMap = /** @returns {boolean} */ (/** @type {import("./YAMLMap.js").YAMLMap | import("./Scalar.js").Scalar | import("./YAMLSeq.js").YAMLSeq | import("../schema/yaml-1.1/set.js").YAMLSet | import("../schema/yaml-1.1/omap.js").YAMLOMap | undefined} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === MAP;
const isPair = /** @returns {boolean} */ (/** @type {import("./YAMLMap.js").YAMLMap | import("./Scalar.js").Scalar | import("./YAMLSeq.js").YAMLSeq | import("./Pair.js").Pair | import("./Alias.js").Alias} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === PAIR;
const isScalar = /** @returns {boolean} */ (node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SCALAR;
const isSeq = /** @returns {boolean} */ (/** @type {import("./Scalar.js").Scalar | import("./YAMLSeq.js").YAMLSeq | import("../schema/yaml-1.1/omap.js").YAMLOMap} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SEQ;
/** @returns {boolean} */ function isCollection(/** @type {import("./YAMLMap.js").YAMLMap | import("./Scalar.js").Scalar | import("./YAMLSeq.js").YAMLSeq} */ node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case MAP:
            case SEQ:
                return true;
        }
    return false;
}
/** @returns {boolean} */ function isNode(/** @type {import("../schema/yaml-1.1/omap.js").YAMLOMap | import("./YAMLSeq.js").YAMLSeq | import("../schema/yaml-1.1/set.js").YAMLSet} */ node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case ALIAS:
            case MAP:
            case SCALAR:
            case SEQ:
                return true;
        }
    return false;
}
const hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;

export { ALIAS, DOC, MAP, NODE_TYPE, PAIR, SCALAR, SEQ, hasAnchor, isAlias, isCollection, isDocument, isMap, isNode, isPair, isScalar, isSeq };
