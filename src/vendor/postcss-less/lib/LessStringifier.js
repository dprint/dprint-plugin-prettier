// @nts-check
/* eslint-disable import/no-extraneous-dependencies */

const Stringifier = require('postcss/lib/stringifier');

module.exports = class LessStringifier extends Stringifier {
  atrule(/** @type {import("postcss/lib/node")} */ node, /** @type {undefined | boolean} */ semicolon) {
    if (!node.mixin && !node.variable && !node.function) {
      super.atrule(node, semicolon);
      return;
    }

    /** @type {string} */ const identifier = node.function ? '' : node.raws.identifier || '@';
    /** @type {string} */ let name = `${identifier}${node.name}`;
    /** @type {string} */ let params = node.params ? this.rawValue(node, 'params') : '';
    /** @type {string} */ const important = node.raws.important || '';

    if (node.variable) {
      params = node.value;
    }

    if (typeof node.raws.afterName !== 'undefined') {
      name += node.raws.afterName;
    } else if (params) {
      name += ' ';
    }

    if (node.nodes) {
      this.block(node, name + params + important);
    } else {
      /** @type {string} */ const end = (node.raws.between || '') + important + (semicolon ? ';' : '');
      this.builder(name + params + end, node);
    }
  }

  comment(/** @type {import("postcss/lib/node")} */ node) {
    if (node.inline) {
      /** @type {string} */ const left = this.raw(node, 'left', 'commentLeft');
      /** @type {string} */ const right = this.raw(node, 'right', 'commentRight');
      this.builder(`//${left}${node.text}${right}`, node);
    } else {
      super.comment(node);
    }
  }
};
