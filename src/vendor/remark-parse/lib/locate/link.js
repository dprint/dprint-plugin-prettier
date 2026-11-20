// @nts-check
'use strict'

module.exports = locate

/** @returns {number} */ function locate(/** @type {StringView} */ value, /** @type {number} */ fromIndex) {
  /** @type {number} */ var link = value.indexOf('[', fromIndex)
  /** @type {number} */ var image = value.indexOf('![', fromIndex)

  if (image === -1) {
    return link
  }

  // Link can never be `-1` if an image is found, so we don’t need to check
  // for that :)
  return link < image ? link : image
}
