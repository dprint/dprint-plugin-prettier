// `prettier/plugins/flow` as Prettier's package gives it to the Prettier plugins that import it, which also has what
// it exports as its default export
import { flow } from "../../prettier/src/language-js/parse/flow.js";
import { withOwnCommentCaches } from "./prettier-plugin-parsers.js";

export const parsers = withOwnCommentCaches({ flow });
export default { parsers };
