// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import { formatAttributeValue, shouldHugJsExpression } from "./utils.js";

function printAngularControlFlowBlockParameters(
  textToDoc,
  print,
  /** @type {AstPath} */ path,
  options,
) {
  const { node } = path;

  const content = options.originalText.slice(
    node.sourceSpan.start.offset,
    node.sourceSpan.end.offset,
  );
  /** @type {boolean} */ const isEmpty = /^\s*$/u.test(content);

  if (isEmpty) {
    return "";
  }

  return formatAttributeValue(
    content,
    textToDoc,
    {
      parser: "__ng_directive",
      __isInHtmlAttribute: false,
    },
    shouldHugJsExpression,
  );
}

export default printAngularControlFlowBlockParameters;
