/*
- `TSArrayType`
- `ArrayTypeAnnotation`
*/
/** @returns {any[]} */ function printArrayType(/** @type {import("../print-options.js").JsPrint} */ print) {
  return [print("elementType"), "[]"];
}

export { printArrayType };
