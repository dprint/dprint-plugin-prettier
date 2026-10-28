// @nts-check
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (/** @type {any} */ obj) { return typeof obj; } : function (/** @type {any} */ obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cloneNode = /** @returns {any} */ function cloneNode(/** @type {any} */ obj, /** @type {any} */ parent) {
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
        return obj;
    }

    /** @type {any} */ var cloned = new obj.constructor();

    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) {
            continue;
        }
        /** @type {any} */ var value = obj[i];
        /** @type {string} */ var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

        if (i === 'parent' && type === 'object') {
            if (parent) {
                cloned[i] = parent;
            }
        } else if (value instanceof Array) {
            cloned[i] = value.map(/** @returns {any} */ function (/** @type {any} */ j) {
                return cloneNode(j, cloned);
            });
        } else {
            cloned[i] = cloneNode(value, cloned);
        }
    }

    return cloned;
};

var _class = function () {
    function _class() {
        /** @type {any} */ var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, _class);

        for (var key in opts) {
            this[key] = opts[key];
        }
        /** @type {any} */ var _opts$spaces = opts.spaces;
        _opts$spaces = _opts$spaces === undefined ? {} : _opts$spaces;
        /** @type {any} */ var _opts$spaces$before = _opts$spaces.before,
            /** @type {any} */ before = _opts$spaces$before === undefined ? '' : _opts$spaces$before,
            /** @type {any} */ _opts$spaces$after = _opts$spaces.after,
            /** @type {any} */ after = _opts$spaces$after === undefined ? '' : _opts$spaces$after;

        this.spaces = { before: before, after: after };
    }

    _class.prototype.remove = function remove() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.parent = undefined;
        return this;
    };

    _class.prototype.replaceWith = function replaceWith() {
        if (this.parent) {
            for (var index in arguments) {
                this.parent.insertBefore(this, arguments[index]);
            }
            this.remove();
        }
        return this;
    };

    _class.prototype.next = function next() {
        return this.parent.at(this.parent.index(this) + 1);
    };

    _class.prototype.prev = function prev() {
        return this.parent.at(this.parent.index(this) - 1);
    };

    _class.prototype.clone = function clone() {
        /** @type {any} */ var overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        /** @type {any} */ var cloned = cloneNode(this);
        for (var name in overrides) {
            cloned[name] = overrides[name];
        }
        return cloned;
    };

    _class.prototype.toString = /** @returns {string} */ function toString() {
        return [this.spaces.before, String(this.value), this.spaces.after].join('');
    };

    return _class;
}();

exports.default = _class;
module.exports = exports['default'];