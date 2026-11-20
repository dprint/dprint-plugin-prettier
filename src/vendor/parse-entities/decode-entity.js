// @nts-check
'use strict'

var characterEntities = require('character-entities')

module.exports = decodeEntity

var own = {}.hasOwnProperty

function decodeEntity(/** @type {string} */ characters) {
  return own.call(characterEntities, characters)
    ? characterEntities[characters]
    : false
}
