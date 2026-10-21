// @nts-check
/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {MdastNode, MarkdownOptions} from "../utilities.js"
 */
import { hardline } from "../../document/index.js";
import { isSetextHeading } from "../utilities.js";
import { printChildren } from "./children.js";

function printAtxHeading(/** @type {AstPath} */ path, options, /** @type {(selector?: any, args?: any) => any} */ print) {
  return [
    "#".repeat(/** @type {MdastNode} */ (path.node).depth) + " ",
    printChildren(path, options, print),
  ];
}

function printSetextHeading(
  /** @type {AstPath} */ path,
  /** @type {MarkdownOptions} */ options,
  /** @type {(selector?: any, args?: any) => any} */ print,
) {
  const { originalText } = options;
  /** @type {{ node: MdastNode }} */ const { node } = path;
  const end = node.position.end.offset;
  const lineStart = originalText.lastIndexOf("\n", end - 1) + 1;
  const lastLine = originalText.slice(lineStart, end);
  const start = Math.max(lastLine.indexOf("="), lastLine.indexOf("-"));
  const underline = lastLine.slice(start);
  return [printChildren(path, options, print), hardline, underline];
}

function printHeading(/** @type {AstPath} */ path, /** @type {MarkdownOptions} */ options, /** @type {(selector?: any, args?: any) => any} */ print) {
  if (options.parser !== "mdx" && isSetextHeading(path.node)) {
    return printSetextHeading(path, options, print);
  }

  return printAtxHeading(path, options, print);
}

export { printHeading };
