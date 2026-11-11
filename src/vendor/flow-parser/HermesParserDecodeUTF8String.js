// @nts-check
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = HermesParserDecodeUTF8String;
/** @returns {string} */ function HermesParserDecodeUTF8String(/** @type {number} */ ptrIn, /** @type {number} */ length, heap) {
  let ptr = ptrIn;
  const endPtr = ptr + length;
  let str = '';
  while (ptr < endPtr) {
    let u0 = heap[ptr++];
    if (!(u0 & 0x80)) {
      str += String.fromCharCode(u0);
      continue;
    }
    const u1 = heap[ptr++] & 0x3f;
    if ((u0 & 0xe0) === 0xc0) {
      str += String.fromCharCode((u0 & 0x1f) << 6 | u1);
      continue;
    }
    const u2 = heap[ptr++] & 0x3f;
    if ((u0 & 0xf0) === 0xe0) {
      u0 = (u0 & 0x0f) << 12 | u1 << 6 | u2;
    } else {
      u0 = (u0 & 0x07) << 18 | u1 << 12 | u2 << 6 | heap[ptr++] & 0x3f;
    }
    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      u0 -= 0x10000;
      str += String.fromCharCode(0xd800 | u0 >> 10, 0xdc00 | u0 & 0x3ff);
    }
  }
  return str;
}