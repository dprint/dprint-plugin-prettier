"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectIteratorPromises = collectIteratorPromises;
const isPromise_ts_1 = require("../jsutils/isPromise.js");
function collectIteratorPromises(iterator) {
    const promises = [];
    try {
        while (true) {
            const iteration = iterator.next();
            if (iteration.done) {
                return promises;
            }
            if ((0, isPromise_ts_1.isPromiseLike)(iteration.value)) {
                promises.push(iteration.value);
            }
        }
    }
    catch {
        return promises;
    }
}
//# sourceMappingURL=collectIteratorPromises.js.map