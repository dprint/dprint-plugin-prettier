// @nts-check
'use strict'

/** @type {string} */ var attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*'
/** @type {string} */ var unquoted = '[^"\'=<>`\\u0000-\\u0020]+'
/** @type {string} */ var singleQuoted = "'[^']*'"
/** @type {string} */ var doubleQuoted = '"[^"]*"'
/** @type {string} */ var attributeValue =
  '(?:' + unquoted + '|' + singleQuoted + '|' + doubleQuoted + ')'
/** @type {string} */ var attribute =
  '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)'
/** @type {string} */ var openTag = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>'
/** @type {string} */ var closeTag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>'
/** @type {string} */ var comment = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->'
/** @type {string} */ var processing = '<[?].*?[?]>'
/** @type {string} */ var declaration = '<![A-Za-z]+\\s+[^>]*>'
/** @type {string} */ var cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'

exports.openCloseTag = new RegExp('^(?:' + openTag + '|' + closeTag + ')')

exports.tag = new RegExp(
  '^(?:' +
    openTag +
    '|' +
    closeTag +
    '|' +
    comment +
    '|' +
    processing +
    '|' +
    declaration +
    '|' +
    cdata +
    ')'
)
