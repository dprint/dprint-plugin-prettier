// @nts-check
"use strict";

exports.__esModule = true;
exports.default = sortAscending;
/** @returns {any[]} */ function sortAscending(/** @type {any[]} */ list) {
    return list.sort(/** @returns {number} */ function (a, b) {
        return a - b;
    });
};
module.exports = exports["default"];