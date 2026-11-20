"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lexicographicSortSchema = lexicographicSortSchema;
const naturalCompare_ts_1 = require("../jsutils/naturalCompare.js");
const schema_ts_1 = require("../type/schema.js");
const mapSchemaConfig_ts_1 = require("./mapSchemaConfig.js");
function lexicographicSortSchema(schema) {
    return new schema_ts_1.GraphQLSchema((0, mapSchemaConfig_ts_1.mapSchemaConfig)(schema.toConfig(), () => ({
        [mapSchemaConfig_ts_1.SchemaElementKind.OBJECT]: (config) => ({
            ...config,
            interfaces: () => sortByName(config.interfaces()),
            fields: () => sortObjMap(config.fields()),
        }),
        [mapSchemaConfig_ts_1.SchemaElementKind.FIELD]: (config) => ({
            ...config,
            args: sortObjMap(config.args),
        }),
        [mapSchemaConfig_ts_1.SchemaElementKind.INTERFACE]: (config) => ({
            ...config,
            interfaces: () => sortByName(config.interfaces()),
            fields: () => sortObjMap(config.fields()),
        }),
        [mapSchemaConfig_ts_1.SchemaElementKind.UNION]: (config) => ({
            ...config,
            types: () => sortByName(config.types()),
        }),
        [mapSchemaConfig_ts_1.SchemaElementKind.ENUM]: (config) => ({
            ...config,
            values: () => sortObjMap(config.values()),
        }),
        [mapSchemaConfig_ts_1.SchemaElementKind.INPUT_OBJECT]: (config) => ({
            ...config,
            fields: () => sortObjMap(config.fields()),
        }),
        [mapSchemaConfig_ts_1.SchemaElementKind.DIRECTIVE]: (config) => ({
            ...config,
            locations: sortBy(config.locations, (x) => x),
            args: sortObjMap(config.args),
        }),
        [mapSchemaConfig_ts_1.SchemaElementKind.SCHEMA]: (config) => ({
            ...config,
            types: sortByName(config.types),
            directives: sortByName(config.directives),
        }),
    })));
}
function sortObjMap(map) {
    const sortedMap = Object.create(null);
    for (const key of Object.keys(map).sort(naturalCompare_ts_1.naturalCompare)) {
        sortedMap[key] = map[key];
    }
    return sortedMap;
}
function sortByName(array) {
    return sortBy(array, (obj) => obj.name);
}
function sortBy(array, mapToKey) {
    return array.slice().sort((obj1, obj2) => {
        const key1 = mapToKey(obj1);
        const key2 = mapToKey(obj2);
        return (0, naturalCompare_ts_1.naturalCompare)(key1, key2);
    });
}
//# sourceMappingURL=lexicographicSortSchema.js.map