// @nts-check
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getModuleDocblock = getModuleDocblock;
exports.parseDocblockString = parseDocblockString;
const DIRECTIVE_REGEX = /^\s*@([a-zA-Z0-9_-]+)( +.+)?$/;
function parseDocblockString(/** @type {string} */ docblock) {
  const directiveLines = docblock.split('\n').map(/** @returns {string} */ (/** @type {string} */ line) => line.trimStart().replace(/^\* ?/, '').trim()).filter(/** @returns {boolean} */ (/** @type {string} */ line) => line.startsWith('@'));
  const directives = Object.create(null);
  for (const line of directiveLines) {
    var _match$;
    const match = DIRECTIVE_REGEX.exec(line);
    if (match == null) {
      continue;
    }
    const name = match[1];
    const value = ((_match$ = match[2]) != null ? _match$ : '').trim();
    if (directives[name]) {
      directives[name].push(value);
    } else {
      directives[name] = [value];
    }
  }
  return directives;
}
function getModuleDocblock(hermesProgram) {
  const docblockNode = (() => {
    if (hermesProgram.type !== 'Program') {
      return null;
    }
    const program = hermesProgram;
    if (program.comments.length === 0) {
      return null;
    }
    const firstComment = (() => {
      const first = program.comments[0];
      if (first.type === 'Block') {
        return first;
      }
      if (program.comments.length === 1) {
        return null;
      }
      const second = program.comments[1];
      if (first.type === 'Line' && first.range[0] === 0 && second.type === 'Block') {
        return second;
      }
      return null;
    })();
    if (firstComment == null) {
      return null;
    }
    if (program.body.length > 0 && program.body[0].range[0] < firstComment.range[0]) {
      return null;
    }
    return firstComment;
  })();
  if (docblockNode == null) {
    return null;
  }
  return {
    directives: parseDocblockString(docblockNode.value),
    comment: docblockNode
  };
}