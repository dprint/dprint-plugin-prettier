// @nts-check
'use strict';

const Container = require('./container');

module.exports = class Root extends Container {
  constructor (/** @type {any} */ opts) {
    super(opts);
    /** @type {string} */ this.type = 'root';
  }
};
