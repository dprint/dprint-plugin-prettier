// @nts-check
const ALIAS = Symbol.for('yaml.alias');
const DOC = Symbol.for('yaml.document');
const MAP = Symbol.for('yaml.map');
const PAIR = Symbol.for('yaml.pair');
const SCALAR = Symbol.for('yaml.scalar');
const SEQ = Symbol.for('yaml.seq');
const NODE_TYPE = Symbol.for('yaml.node.type');
const isAlias = /** @returns {node is import("./Alias.js").Alias} */ (/** @type {any} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === ALIAS;
const isDocument = /** @returns {node is import("../doc/Document.js").Document} */ (/** @type {any} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === DOC;
// isMap and isSeq are not type predicates: the type checker takes a YAMLSeq to be a YAMLMap and the other way
// around, as they have the same members, so that a check that is false would leave out both
const isMap = /** @returns {boolean} */ (/** @type {any} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === MAP;
const isPair = /** @returns {node is import("./Pair.js").Pair} */ (/** @type {any} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === PAIR;
const isScalar = /** @returns {node is import("./Scalar.js").Scalar} */ (/** @type {any} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SCALAR;
const isSeq = /** @returns {boolean} */ (/** @type {any} */ node) => !!node && typeof node === 'object' && node[NODE_TYPE] === SEQ;
/** @returns {node is import("./YAMLMap.js").YAMLMap | import("./YAMLSeq.js").YAMLSeq} */ function isCollection(/** @type {any} */ node) {
    if (node && typeof node === 'object')
        switch (node[NODE_TYPE]) {
            case MAP:
            case SEQ:
                return true;
        }
    return false;
}
/** @returns {node is import("./Alias.js").Alias | import("./Scalar.js").Scalar | import("./YAMLMap.js").YAMLMap | import("./YAMLSeq.js").YAMLSeq} */ function isNode(/** @type {any} */ node) {
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
const hasAnchor = /** @returns {boolean} */ (/** @type {any} */ node) => (isScalar(node) || isCollection(node)) && !!node.anchor;

export { ALIAS, DOC, MAP, NODE_TYPE, PAIR, SCALAR, SEQ, hasAnchor, isAlias, isCollection, isDocument, isMap, isNode, isPair, isScalar, isSeq };
