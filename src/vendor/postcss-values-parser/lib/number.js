// @nts-check
'use strict';

const Container = require('./container');
const Node = require('./node');

class NumberNode extends Node {
  constructor (opts) {
    super(opts);
    /** @type {string} */ this.type = 'number';
    /** @type {string} */ this.unit = Object(opts).unit || '';
  }

  toString () {
    return [
      this.raws.before,
      String(this.value),
      this.unit,
      this.raws.after
    ].join('');
  }
};

Container.registerWalker(NumberNode);

module.exports = NumberNode;
