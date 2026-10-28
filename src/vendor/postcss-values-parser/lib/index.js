// @nts-check
'use strict';

const Parser = require('./parser');
const AtWord = require('./atword');
const Colon = require('./colon');
const Comma = require('./comma');
const Comment = require('./comment');
const Func = require('./function');
const Num = require('./number');
const Operator = require('./operator');
const Paren = require('./paren');
const Str = require('./string');
const UnicodeRange = require('./unicode-range');
const Value = require('./value');
const Word = require('./word');

let parser = function (/** @type {string} */ source, /** @type {any} */ options) {
  return new Parser(source, options);
};

parser.atword = function (/** @type {any} */ opts) {
  return new AtWord(opts);
};

parser.colon = function (/** @type {any} */ opts) {
  return new Colon(Object.assign({ value: ':' }, opts));
};

parser.comma = function (/** @type {any} */ opts) {
  return new Comma(Object.assign({ value: ',' }, opts));
};

parser.comment = function (/** @type {any} */ opts) {
  return new Comment(opts);
};

parser.func = function (/** @type {any} */ opts) {
  return new Func(opts);
};

parser.number = function (/** @type {any} */ opts) {
  return new Num(opts);
};

parser.operator = function (/** @type {any} */ opts) {
  return new Operator(opts);
};

parser.paren = function (/** @type {any} */ opts) {
  return new Paren(Object.assign({ value: '(' }, opts));
};

parser.string = function (/** @type {any} */ opts) {
  return new Str(Object.assign({ quote: '\'' }, opts));
};

parser.value = function (/** @type {any} */ opts) {
  return new Value(opts);
};

parser.word = function (/** @type {any} */ opts) {
  return new Word(opts);
};

parser.unicodeRange = function (/** @type {any} */ opts) {
  return new UnicodeRange(opts);
};

module.exports = parser;
