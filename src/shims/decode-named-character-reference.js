// @nts-check
// decode-named-character-reference with the version of character-entities that it is written for, which nts.json
// cannot give it as `character-entities` is the older version that remark needs
import { characterEntities } from "../../prettier/node_modules/decode-named-character-reference/node_modules/character-entities/index.js";

const own = {}.hasOwnProperty;

/** @returns {string | false} */
export function decodeNamedCharacterReference(/** @type {string} */ value) {
  return own.call(characterEntities, value) ? characterEntities[value] : false;
}
