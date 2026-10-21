// @nts-check
'use strict';

const Node = require('./node');

class Container extends Node {

  constructor (/** @type {any} */ opts) {
    super(opts);

    if (!this.nodes) {
      this.nodes = [];
    }
  }

  push (/** @type {any} */ child) {
    child.parent = this;
    this.nodes.push(child);
    return this;
  }

  each (/** @type {(node: any, index: number) => any} */ callback) {
    if (!this.lastEach) this.lastEach = 0;
    if (!this.indexes) this.indexes = { };

    this.lastEach += 1;

    /** @type {number} */ let id = this.lastEach,
      /** @type {number} */ index,
      /** @type {any} */ result;

    this.indexes[id] = 0;

    if (!this.nodes) return undefined;

    while (this.indexes[id] < this.nodes.length) {
      index  = this.indexes[id];
      result = callback(this.nodes[index], index);
      if (result === false) break;

      this.indexes[id] += 1;
    }

    delete this.indexes[id];

    return result;
  }

  walk (/** @type {(node: any, index: number) => any} */ callback) {
    return this.each((/** @type {any} */ child, /** @type {number} */ i) => {
      /** @type {any} */ let result = callback(child, i);
      if (result !== false && child.walk) {
        result = child.walk(callback);
      }
      return result;
    });
  }

  walkType (/** @type {any} */ type, /** @type {(node: any, index: number) => any} */ callback) {
    if (!type || !callback) {
      throw new Error('Parameters {type} and {callback} are required.');
    }

    // allow users to pass a constructor, or node type string; eg. Word.
    const isTypeCallable = typeof type === 'function';

    return this.walk((/** @type {any} */ node, /** @type {number} */ index) => {
      if (isTypeCallable && node instanceof type || !isTypeCallable && node.type === type) {
        return callback.call(this, node, index);
      }
    });
  }

  append (/** @type {any} */ node) {
    node.parent = this;
    this.nodes.push(node);
    return this;
  }

  prepend (/** @type {any} */ node) {
    node.parent = this;
    this.nodes.unshift(node);
    return this;
  }

  cleanRaws (/** @type {boolean | undefined} */ keepBetween) {
    super.cleanRaws(keepBetween);
    if (this.nodes) {
      for (let node of this.nodes) node.cleanRaws(keepBetween);
    }
  }

  insertAfter (/** @type {any} */ oldNode, /** @type {any} */ newNode) {
    /** @type {number} */ let oldIndex = this.index(oldNode),
      /** @type {number} */ index;

    this.nodes.splice(oldIndex + 1, 0, newNode);

    for (let id in this.indexes) {
      index = this.indexes[id];
      if (oldIndex <= index) {
        this.indexes[id] = index + this.nodes.length;
      }
    }

    return this;
  }

  insertBefore (/** @type {any} */ oldNode, /** @type {any} */ newNode) {
    /** @type {number} */ let oldIndex = this.index(oldNode),
      /** @type {number} */ index;

    this.nodes.splice(oldIndex, 0, newNode);

    for (let id in this.indexes) {
      index = this.indexes[id];
      if (oldIndex <= index) {
        this.indexes[id] = index + this.nodes.length;
      }
    }

    return this;
  }

  removeChild (/** @type {any} */ child) {
    child = this.index(child);
    this.nodes[child].parent = undefined;
    this.nodes.splice(child, 1);

    /** @type {number} */ let index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (index >= child) {
        this.indexes[id] = index - 1;
      }
    }

    return this;
  }

  removeAll () {
    for (let node of this.nodes) node.parent = undefined;
    this.nodes = [];
    return this;
  }

  every (/** @type {(node: any, index: number, nodes: any[]) => boolean} */ condition) {
    return this.nodes.every(condition);
  }

  some (/** @type {(node: any, index: number, nodes: any[]) => boolean} */ condition) {
    return this.nodes.some(condition);
  }

  /** @returns {number} */ index (/** @type {any} */ child) {
    if (typeof child === 'number') {
      return child;
    }
    else {
      return this.nodes.indexOf(child);
    }
  }

  get first () {
    if (!this.nodes) return undefined;
    return this.nodes[0];
  }

  get last () {
    if (!this.nodes) return undefined;
    return this.nodes[this.nodes.length - 1];
  }

  /** @returns {string} */ toString () {
    /** @type {string} */ let result = this.nodes.map(String).join('');

    if (this.value) {
      result = this.value + result;
    }

    if (this.raws.before) {
      result = this.raws.before + result;
    }

    if (this.raws.after) {
      result += this.raws.after;
    }

    return result;
  }
}

Container.registerWalker = (/** @type {any} */ constructor) => {
  /** @type {string} */ let walkerName = 'walk' + constructor.name;

  // plural sugar
  if (walkerName.lastIndexOf('s') !== walkerName.length - 1) {
    walkerName += 's';
  }

  if (Container.prototype[walkerName]) {
    return;
  }

  // we need access to `this` so we can't use an arrow function
  Container.prototype[walkerName] = function (/** @type {(node: any, index: number) => any} */ callback) {
    return this.walkType(constructor, callback);
  };
};

module.exports = Container;
