// @nts-check
import escapeStringRegexp from "escape-string-regexp";

class WhitespaceUtils {
  #whitespaceCharacters;

  constructor(whitespaceCharacters) {
    this.#whitespaceCharacters = new Set(whitespaceCharacters);

    if (
      process.env.NODE_ENV !== "production" &&
      (this.#whitespaceCharacters.size === 0 ||
        Array.prototype.some.call(
          whitespaceCharacters,
          /** @returns {boolean} */ (character) => !/^\s$/u.test(character),
        ))
    ) {
      throw new TypeError(
        `Invalid characters: ${JSON.stringify(whitespaceCharacters)}`,
      );
    }
  }

  /** @returns {number} */ getLeadingWhitespaceCount(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    /** @type {number} */ let count = 0;

    for (
      let index = 0;
      index < text.length && whitespaceCharacters.has(text.charAt(index));
      index++
    ) {
      count++;
    }

    return count;
  }

  /** @returns {number} */ getTrailingWhitespaceCount(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    /** @type {number} */ let count = 0;

    for (
      let index = text.length - 1;
      index >= 0 && whitespaceCharacters.has(text.charAt(index));
      index--
    ) {
      count++;
    }

    return count;
  }

  /** @returns {string} */ getLeadingWhitespace(/** @type {string} */ text) {
    /** @type {number} */ const count = this.getLeadingWhitespaceCount(text);
    return text.slice(0, count);
  }

  /** @returns {string} */ getTrailingWhitespace(/** @type {string} */ text) {
    /** @type {number} */ const count = this.getTrailingWhitespaceCount(text);
    return text.slice(text.length - count);
  }

  /** @returns {boolean} */ hasLeadingWhitespace(/** @type {string} */ text) {
    return this.#whitespaceCharacters.has(text.charAt(0));
  }

  /** @returns {boolean} */ hasTrailingWhitespace(/** @type {string} */ text) {
    return this.#whitespaceCharacters.has(text.at(-1));
  }

  /** @returns {string} */ trimStart(/** @type {string | undefined} */ text) {
    /** @type {number} */ const count = this.getLeadingWhitespaceCount(text);
    return text.slice(count);
  }

  /** @returns {string} */ trimEnd(/** @type {string | undefined} */ text) {
    /** @type {number} */ const count = this.getTrailingWhitespaceCount(text);
    return text.slice(0, text.length - count);
  }

  /** @returns {string} */ trim(/** @type {string | undefined} */ text) {
    return this.trimEnd(this.trimStart(text));
  }

  /** @returns {any[]} */ split(/** @type {string} */ text, captureWhitespace = false) {
    /** @type {string} */ const pattern = `[${escapeStringRegexp(
      [...this.#whitespaceCharacters].join(""),
    )}]+`;
    /** @type {RegExp} */ const regexp = new RegExp(
      captureWhitespace ? `(${pattern})` : pattern,
      "u",
    );
    return text.split(regexp);
  }

  /** @returns {boolean} */ hasWhitespaceCharacter(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    return Array.prototype.some.call(text, /** @returns {boolean} */ (character) =>
      whitespaceCharacters.has(character),
    );
  }

  /** @returns {boolean} */ hasNonWhitespaceCharacter(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    return Array.prototype.some.call(
      text,
      /** @returns {boolean} */ (character) => !whitespaceCharacters.has(character),
    );
  }

  /** @returns {boolean} */ isWhitespaceOnly(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    return Array.prototype.every.call(text, /** @returns {boolean} */ (character) =>
      whitespaceCharacters.has(character),
    );
  }
}

export default WhitespaceUtils;
