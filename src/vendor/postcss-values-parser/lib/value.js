// @nts-check
'use strict';

const Container = require('./container');

module.exports = class Value extends Container {
  constructor (/** @type {any} */ opts) {
    super(opts);
    /** @type {string} */ this.type = 'value';
    /** @type {number} */ this.unbalanced = 0;
  }
};
