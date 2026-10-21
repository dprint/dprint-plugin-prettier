/**
 * @param {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} options
 * @param {("es5" | "all")} [level]
 * @returns {boolean}
 */
function shouldPrintTrailingComma(options, level = "es5") {
  return (
    (options.trailingComma === "es5" && level === "es5") ||
    (options.trailingComma === "all" && (level === "all" || level === "es5"))
  );
}

export { shouldPrintTrailingComma };
