// @nts-check
import { invariant } from '../jsutils/invariant.mjs';
/** @type {RegExp} */ const LineRegExp = /\r\n|[\n\r]/g;
/**
 * Represents a location in a Source.
 */

/**
 * Takes a Source and a UTF-8 character offset, and returns the corresponding
 * line and column as a SourceLocation.
 */
export function getLocation(/** @type {import("./source.mjs").Source} */ source, /** @type {number} */ position) {
  /** @type {number} */ let lastLineStart = 0;
  /** @type {number} */ let line = 1;

  for (const match of source.body.matchAll(LineRegExp)) {
    typeof match.index === 'number' || invariant(false);

    if (match.index >= position) {
      break;
    }

    lastLineStart = match.index + match[0].length;
    line += 1;
  }

  return {
    line,
    column: position + 1 - lastLineStart,
  };
}
