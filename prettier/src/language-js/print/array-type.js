/*
- `TSArrayType`
- `ArrayTypeAnnotation`
*/
/** @returns {any[]} */ function printArrayType(/** @type {(a0?: any) => any} */ print) {
  return [print("elementType"), "[]"];
}

export { printArrayType };
