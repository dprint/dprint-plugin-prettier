// @nts-check
'use strict';

class TokenizeError extends Error {
  constructor(/** @type {string} */ message) {
    super(message);

    /** @type {string} */ this.name = this.constructor.name;
    /** @type {string} */ this.message = message || 'An error ocurred while tokzenizing.';

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
    else {
      this.stack = (new Error(message)).stack;
    }
  }
}

module.exports = TokenizeError;
