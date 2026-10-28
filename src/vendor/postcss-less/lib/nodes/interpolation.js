// @nts-check
/* eslint no-param-reassign: off */

module.exports = {
  /**
   * @this {import("../LessParser")}
   * @returns {boolean}
   */
  interpolation(/** @type {any[] | undefined} */ token) {
    /** @type {any[][]} */ const tokens = [token, this.tokenizer.nextToken()];
    /** @type {string[]} */ const validTypes = ['word', '}'];

    // look for @{ but not @[word]{
    if (tokens[0][1].length > 1 || tokens[1][0] !== '{') {
      this.tokenizer.back(tokens[1]);
      return false;
    }

    token = this.tokenizer.nextToken();
    while (token && validTypes.includes(token[0])) {
      tokens.push(token);
      token = this.tokenizer.nextToken();
    }

    /** @type {string[]} */ const words = tokens.map(/** @returns {string} */ (tokn) => tokn[1]);
    const [first] = tokens;
    const last = tokens.pop();
    /** @type {any[]} */ const newToken = ['word', words.join(''), first[2], last[2]];

    this.tokenizer.back(token);
    this.tokenizer.back(newToken);

    return true;
  }
};
