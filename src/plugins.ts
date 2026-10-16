/// <reference path="../../nts/lib.d.ts" />
// the plugins that prettier has built in, put together from prettier's source as its own build does
import * as cssPlugin from "../prettier/src/language-css/index.js";
import * as graphqlPlugin from "../prettier/src/language-graphql/index.js";
import * as handlebarsPlugin from "../prettier/src/language-handlebars/index.js";
import * as htmlPlugin from "../prettier/src/language-html/index.js";
import jsOptions from "../prettier/src/language-js/options.js";
import { acorn } from "../prettier/src/language-js/parse/acorn.js";
import * as angularParsers from "../prettier/src/language-js/parse/angular.js";
import babelParsers from "../prettier/src/language-js/parse/babel.js";
import { espree } from "../prettier/src/language-js/parse/espree.js";
import { meriyah } from "../prettier/src/language-js/parse/meriyah.js";
import * as estreePrinter from "../prettier/src/language-js/printer.js";
import jsonParsers from "../prettier/src/language-json/parser-json.js";
import * as jsonPrinter from "../prettier/src/language-json/printer-estree-json.js";
import * as markdownPlugin from "../prettier/src/language-markdown/index.js";
import * as yamlPlugin from "../prettier/src/language-yaml/index.js";
import jsLanguages from "./generated/js-languages.js";
import jsonLanguages from "./generated/json-languages.js";
import { parsers as flowParsers } from "./prettier-plugins/flow.mjs";
import { parsers as typescriptParsers } from "./prettier-plugins/typescript.mjs";

// the parsers of JavaScript other than Babel's, which are given as what gives the parser so that a
// parser is only set up when it is first used
const otherJsParsers: any = {
  typescript: () => (typescriptParsers as any).typescript,
  flow: () => (flowParsers as any).flow,
  meriyah: () => meriyah,
  acorn,
  espree,
};

export const plugins: any[] = [
  { parsers: otherJsParsers },
  { parsers: angularParsers },
  { languages: jsLanguages, parsers: babelParsers, printers: { estree: estreePrinter }, options: jsOptions },
  { languages: jsonLanguages, parsers: jsonParsers, printers: { "estree-json": jsonPrinter } },
  cssPlugin,
  graphqlPlugin,
  handlebarsPlugin,
  htmlPlugin,
  markdownPlugin,
  yamlPlugin,
];
