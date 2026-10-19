// @nts-check
/** @import {Plugin, Settings} from "unified" */

/**
 * @type {Plugin<[], Settings>}
 */
const wikiLink = function () {
  /** @type {string} */ const entityType = "wikiLink";
  const wikiLinkRegex = /^\[\[(?<linkContents>.+?)\]\]/s;
  const proto = this.Parser.prototype;
  const methods = proto.inlineMethods;
  methods.splice(methods.indexOf("link"), 0, entityType);
  proto.inlineTokenizers.wikiLink = tokenizer;

  function tokenizer(/** @type {(a0?: any) => any} */ eat, /** @type {string | undefined} */ value) {
    const match = wikiLinkRegex.exec(value);

    if (match) {
      /** @type {string} */ const linkContents = match.groups.linkContents.trim();

      return eat(match[0])({
        type: entityType,
        value: linkContents,
      });
    }
  }

  tokenizer.locator = /** @returns {number} */ function (/** @type {StringView} */ value, /** @type {number} */ fromIndex) {
    return value.indexOf("[", fromIndex);
  };
};

export default wikiLink;
