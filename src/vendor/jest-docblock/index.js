// @nts-check
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


/** @type {RegExp} */ const commentEndRe = /\*\/$/;
/** @type {RegExp} */ const commentStartRe = /^\/\*\*?/;
/** @type {RegExp} */ const docblockRe = /^\s*(\/\*\*?(.|\r?\n)*?\*\/)/;
/** @type {RegExp} */ const lineCommentRe = /(^|\s+)\/\/([^\n\r]*)/g;
/** @type {RegExp} */ const ltrimNewlineRe = /^(\r?\n)+/;
/** @type {RegExp} */ const multilineRe = /(?:^|\r?\n) *(@[^\n\r]*?) *\r?\n *(?![^\n\r@]*\/\/[^]*)([^\s@][^\n\r@]+?) *\r?\n/g;
/** @type {RegExp} */ const propertyRe = /(?:^|\r?\n) *@(\S+) *([^\n\r]*)/g;
/** @type {RegExp} */ const stringStartRe = /(\r?\n|^) *\* ?/g;
const STRING_ARRAY = [];
/** @returns {string} */ function extract(/** @type {string} */ contents) {
  const match = contents.match(docblockRe);
  return match ? match[0].trimStart() : '';
}
/** @returns {string} */ function strip(/** @type {string} */ contents) {
  const matchResult = contents.match(docblockRe);
  const match = matchResult?.[0];
  return match == null ? contents : contents.slice(match.length);
}
function parse(/** @type {string} */ docblock) {
  return parseWithComments(docblock).pragmas;
}
function parseWithComments(/** @type {string} */ docblock) {
  const line = detectNewline(docblock) ?? "\n";
  docblock = docblock.replace(commentStartRe, '').replace(commentEndRe, '').replaceAll(stringStartRe, '$1');

  // Normalize multi-line directives
  let prev = '';
  while (prev !== docblock) {
    prev = docblock;
    docblock = docblock.replaceAll(multilineRe, `${line}$1 $2${line}`);
  }
  docblock = docblock.replace(ltrimNewlineRe, '').trimEnd();
  const result = Object.create(null);
  const comments = docblock.replaceAll(propertyRe, '').replace(ltrimNewlineRe, '').trimEnd();
  let match;
  while (match = propertyRe.exec(docblock)) {
    // strip linecomments from pragmas
    const nextPragma = match[2].replaceAll(lineCommentRe, '');
    if (typeof result[match[1]] === 'string' || Array.isArray(result[match[1]])) {
      const resultElement = result[match[1]];
      result[match[1]] = [...STRING_ARRAY, ...(Array.isArray(resultElement) ? resultElement : [resultElement]), nextPragma];
    } else {
      result[match[1]] = nextPragma;
    }
  }
  return {
    comments,
    pragmas: result
  };
}
function print({
  comments = '',
  pragmas = {}
}) {
  const line = detectNewline(comments) ?? "\n";
  const head = '/**';
  const start = ' *';
  const tail = ' */';
  const keys = Object.keys(pragmas);
  const printedObject = keys.flatMap(key => printKeyValues(key, pragmas[key])).map(keyValue => `${start} ${keyValue}${line}`).join('');
  if (!comments) {
    if (keys.length === 0) {
      return '';
    }
    if (keys.length === 1 && !Array.isArray(pragmas[keys[0]])) {
      const value = pragmas[keys[0]];
      return `${head} ${printKeyValues(keys[0], value)[0]}${tail}`;
    }
  }
  const printedComments = comments.split(line).map(textLine => `${start} ${textLine}`).join(line) + line;
  return head + line + (comments ? printedComments : '') + (comments && keys.length > 0 ? start + line : '') + printedObject + tail;
}
function printKeyValues(/** @type {string} */ key, valueOrArray) {
  return [...STRING_ARRAY, ...(Array.isArray(valueOrArray) ? valueOrArray : [valueOrArray])].map(value => `@${key} ${value}`.trim());
}

/** @returns {string | undefined} */ function detectNewline(/** @type {string} */ string) {
  const newlines = string.match(/(?:\r?\n)/g) || [];
  if (newlines.length === 0) {
    return;
  }
  const crlf = newlines.filter(/** @returns {boolean} */ newline => newline === "\r\n").length;
  const lf = newlines.length - crlf;
  return crlf > lf ? "\r\n" : "\n";
}

export { extract, parse, parseWithComments, print, strip };
