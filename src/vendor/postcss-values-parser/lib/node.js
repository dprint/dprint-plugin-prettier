// @nts-check
'use strict';

let cloneNode = function (/** @type {any} */ obj, /** @type {any} */ parent) {
  /** @type {any} */ let cloned = new obj.constructor();

  for (let i in obj) {
    if (!obj.hasOwnProperty(i)) continue;

    /** @type {any} */ let value = obj[i],
      /** @type {string} */ type  = typeof value;

    if (i === 'parent' && type === 'object') {
      if (parent) cloned[i] = parent;
    }
    else if (i === 'source') {
      cloned[i] = value;
    }
    else if (value instanceof Array) {
      cloned[i] = value.map(/** @returns {any} */ (/** @type {any} */ j) => cloneNode(j, cloned));
    }
    else if (i !== 'before'  && i !== 'after' && i !== 'between' && i !== 'semicolon') {
      if (type === 'object' && value !== null) value = cloneNode(value);
      cloned[i] = value;
    }
  }

  return cloned;
};

module.exports = class Node {

  constructor (/** @type {any} */ defaults) {
    defaults = defaults || {};
    this.raws = { before: '', after: '' };

    for (let name in defaults) {
      this[name] = defaults[name];
    }
  }

  remove () {
    if (this.parent) {
      this.parent.removeChild(this);
    }

    this.parent = undefined;

    return this;
  }

  /** @returns {string} */ toString () {
    return [
      this.raws.before,
      String(this.value),
      this.raws.after
    ].join('');
  }

  clone (/** @type {any} */ overrides) {
    overrides = overrides || {};

    /** @type {any} */ let cloned = cloneNode(this);

    for (let name in overrides) {
      cloned[name] = overrides[name];
    }

    return cloned;
  }

  cloneBefore (/** @type {any} */ overrides) {
    overrides = overrides || {};

    /** @type {any} */ let cloned = this.clone(overrides);

    this.parent.insertBefore(this, cloned);
    return cloned;
  }

  cloneAfter (/** @type {any} */ overrides) {
    overrides = overrides || {};

    /** @type {any} */ let cloned = this.clone(overrides);

    this.parent.insertAfter(this, cloned);
    return cloned;
  }

  replaceWith () {
    /** @type {any[]} */ let nodes = Array.prototype.slice.call(arguments);

    if (this.parent) {
      for (let node of nodes) {
        this.parent.insertBefore(this, node);
      }

      this.remove();
    }

    return this;
  }

  moveTo (/** @type {any} */ container) {
    this.cleanRaws(this.root() === container.root());
    this.remove();

    container.append(this);

    return this;
  }

  moveBefore (/** @type {any} */ node) {
    this.cleanRaws(this.root() === node.root());
    this.remove();

    node.parent.insertBefore(node, this);

    return this;
  }

  moveAfter (/** @type {any} */ node) {
    this.cleanRaws(this.root() === node.root());
    this.remove();
    node.parent.insertAfter(node, this);
    return this;
  }

  next () {
    /** @type {number} */ let index = this.parent.index(this);

    return this.parent.nodes[index + 1];
  }

  prev () {
    /** @type {number} */ let index = this.parent.index(this);

    return this.parent.nodes[index - 1];
  }

  toJSON () {
    /** @type {Record<string, any>} */ let fixed = { };

    for (let name in this) {
      if (!this.hasOwnProperty(name)) continue;
      if (name === 'parent') continue;
      /** @type {any} */ let value = this[name];

      if (value instanceof Array) {
        fixed[name] = value.map(/** @returns {any} */ (/** @type {any} */ i) => {
          if (typeof i === 'object' && i.toJSON) {
            return i.toJSON();
          }
          else {
            return i;
          }
        });
      }
      else if (typeof value === 'object' && value.toJSON) {
        fixed[name] = value.toJSON();
      }
      else {
        fixed[name] = value;
      }
    }

    return fixed;
  }

  root () {
    /** @type {any} */ let result = this;

    while (result.parent) result = result.parent;

    return result;
  }

  cleanRaws (/** @type {boolean | undefined} */ keepBetween) {
    delete this.raws.before;
    delete this.raws.after;
    if (!keepBetween) delete this.raws.between;
  }

  positionInside (/** @type {number} */ index) {
    /** @type {string} */ let string = this.toString(),
      /** @type {number} */ column = this.source.start.column,
      /** @type {number} */ line   = this.source.start.line;

    for (let i = 0; i < index; i++) {
      if (string[i] === '\n') {
        column = 1;
        line  += 1;
      }
      else {
        column += 1;
      }
    }

    return { line, column };
  }

  positionBy (/** @type {any} */ opts) {
    /** @type {any} */ let pos = this.source.start;

    if (Object(opts).index) {
      pos = this.positionInside(opts.index);
    }
    else if (Object(opts).word) {
      /** @type {number} */ let index = this.toString().indexOf(opts.word);
      if (index !== -1) pos = this.positionInside(index);
    }

    return pos;
  }
};
