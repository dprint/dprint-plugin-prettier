// `prettier/plugins/babel` as Prettier's package gives it to the Prettier plugins that import it, which also has what
// it exports as its default export
import { parsers as babelParsers } from "../../prettier/src/plugins/babel.js";
import { withOwnCommentCaches } from "./prettier-plugin-parsers.js";

export const parsers = withOwnCommentCaches(babelParsers);
export default { parsers };
