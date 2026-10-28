"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPath = addPath;
exports.pathToArray = pathToArray;
function addPath(prev, key, typename) {
    return { prev, key, typename };
}
function pathToArray(path) {
    const flattened = [];
    let curr = path;
    while (curr) {
        flattened.push(curr.key);
        curr = curr.prev;
    }
    return flattened.reverse();
}
//# sourceMappingURL=Path.js.map