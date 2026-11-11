// @nts-check
'use strict';

const Container = require('./container');
const Node = require('./node');

class Operator extends Node {
  constructor (/** @type {any} */ opts) {
    super(opts);
    /** @type {string} */ this.type = 'operator';
  }
}

Container.registerWalker(Operator);

module.exports = Operator;
