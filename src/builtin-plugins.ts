/// <reference path="../../nts/lib.d.ts" />
// the plugins that prettier has built in, put together from prettier's source as its own build does
import * as cssPlugin from "../prettier/src/language-css/index.js";
import * as graphqlPlugin from "../prettier/src/language-graphql/index.js";
import * as handlebarsPlugin from "../prettier/src/language-handlebars/index.js";
import * as htmlPlugin from "../prettier/src/language-html/index.js";
import jsLanguages from "../prettier/src/language-js/languages.evaluate.js";
import jsOptions from "../prettier/src/language-js/options.js";
import { acorn } from "../prettier/src/language-js/parse/acorn.js";
import * as angularParsers from "../prettier/src/language-js/parse/angular.js";
import * as babelParsers from "../prettier/src/language-js/parse/babel.js";
import { espree } from "../prettier/src/language-js/parse/espree.js";
import { flow } from "../prettier/src/language-js/parse/flow.js";
import { meriyah } from "../prettier/src/language-js/parse/meriyah.js";
import * as jsPrinters from "../prettier/src/language-js/printers.js";
import * as jsonPlugin from "../prettier/src/language-json/index.js";
import * as markdownPlugin from "../prettier/src/language-markdown/index.js";
import * as yamlPlugin from "../prettier/src/language-yaml/index.js";
import { parsers as typescriptParsers } from "./prettier-plugins/typescript.mjs";

// the parsers of JavaScript other than Babel's, which are given as what gives the parser so that a
// parser is only set up when it is first used
const otherJsParsers: any = {
  typescript: () => (typescriptParsers as any).typescript,
  flow: () => flow,
  meriyah: () => meriyah,
  acorn,
  espree,
};

export const builtinPlugins: any[] = [
  { parsers: otherJsParsers },
  { parsers: angularParsers },
  { languages: jsLanguages, parsers: babelParsers, printers: jsPrinters, options: jsOptions },
  jsonPlugin,
  cssPlugin,
  graphqlPlugin,
  handlebarsPlugin,
  htmlPlugin,
  markdownPlugin,
  yamlPlugin,
];
