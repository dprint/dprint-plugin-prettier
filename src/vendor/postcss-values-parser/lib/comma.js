// @nts-check
'use strict';

const Container = require('./container');
const Node = require('./node');

class Comma extends Node {
  constructor (/** @type {any} */ opts) {
    super(opts);
    /** @type {string} */ this.type = 'comma';
  }
}

Container.registerWalker(Comma);

module.exports = Comma;
