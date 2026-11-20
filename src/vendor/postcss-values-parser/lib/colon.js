// @nts-check
'use strict';

const Container = require('./container');
const Node = require('./node');

class Colon extends Node {
  constructor (/** @type {any} */ opts) {
    super(opts);
    /** @type {string} */ this.type = 'colon';
  }
}

Container.registerWalker(Colon);

module.exports = Colon;
