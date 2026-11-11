// @nts-check
import { locEnd, locStart } from "../loc.js";
import { hasIgnorePragma, hasPragma } from "../pragma.js";
import { HTML_PARSE_OPTIONS, parse, parseHtml, parseVue } from "./parse.js";
import { normalizeParseOptions } from "./parse-options.js";

/**
@import { ParseOptions } from "./parse-options.js";
*/

/**
 * @param {any} rawParseOptions
 */
function createParser(rawParseOptions) {
  /** @type {import("./ast.js").NormalizedParseOptions} */
  const parseOptions = normalizeParseOptions(rawParseOptions);
  const parser = parseOptions.name === "vue" ? parseVue : parseHtml;
  return {
    parse: /** @returns {import("./ast.js").Node} */ (/** @type {string | undefined} */ text, /** @type {any} */ options) => parse(text, parser, parseOptions, options),
    hasPragma,
    hasIgnorePragma,
    astFormat: "html",
    locStart,
    locEnd,
  };
}

// HTML
const htmlParser = createParser(HTML_PARSE_OPTIONS);

const MJML_RAW_TAGS = new Set(["mj-style", "mj-raw"]);
// MJML https://mjml.io/
const mjmlParser = createParser({
  ...HTML_PARSE_OPTIONS,
  name: "mjml",
  shouldParseAsRawText: (/** @type {string} */ tagName) => MJML_RAW_TAGS.has(tagName),
});

// Angular
const angularParser = createParser({
  name: "angular",
  tokenizeAngularBlocks: true,
  tokenizeAngularLetDeclaration: true,
  allowStartTagComments: true,
});

// Vue.js
const vueParser = createParser({
  name: "vue",
  isTagNameCaseSensitive: true,
  /** @returns {boolean} */ shouldParseAsRawText(/** @type {string | undefined} */ tagName, /** @type {string | undefined} */ prefix, hasParent, /** @type {any[] | undefined} */ attrs) {
    return (
      tagName.toLowerCase() !== "html" &&
      !hasParent &&
      (tagName !== "template" ||
        attrs.some(
          /** @returns {boolean} */ ({ name, value }) =>
            name === "lang" &&
            value !== "html" &&
            value !== "" &&
            value !== undefined,
        ))
    );
  },
});

// Lightning Web Components
const lwcParser = createParser({ name: "lwc", canSelfClose: false });

export {
  angularParser as angular,
  htmlParser as html,
  lwcParser as lwc,
  mjmlParser as mjml,
  vueParser as vue,
};
