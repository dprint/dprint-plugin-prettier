// @nts-check
/** @import {Doc} from "../document/index.js" */

import {
  breakParent,
  fill,
  group,
  hardline,
  join,
  line,
  lineSuffix,
  replaceEndOfLine,
} from "../document/index.js";
import isPreviousLineEmpty from "../utilities/is-previous-line-empty.js";
import UnexpectedNodeError from "../utilities/unexpected-node-error.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locStart } from "./loc.js";
import { massageAstNode } from "./massage-ast/index.js";
import { insertPragma } from "./pragma.js";
import printBlock from "./print/block.js";
import {
  printFlowMapping,
  printFlowSequence,
} from "./print/flow-mapping-sequence.js";
import printMappingItem from "./print/mapping-item.js";
import {
  alignWithSpaces,
  printNextEmptyLine,
  shouldPrintEndComments,
} from "./print/misc.js";
import preprocess from "./print-preprocess.js";
import {
  getFlowScalarLineContents,
  getLastDescendantNode,
  hasEndComments,
  hasLeadingComments,
  hasMiddleComments,
  hasPrettierIgnore,
  hasTrailingComment,
  isInlineNode,
  isLastDescendantNode,
  isNode,
} from "./utilities.js";

/** @import AstPath from "../common/ast-path.js" */
/** @import { YamlNode } from "../../../src/vendor/yaml-unist-parser/transforms/context.mjs" */
/** @import { YamlOptions, YamlPrint } from "./utilities.js" */

/** @returns {any[]} */ function genericPrint(/** @type {AstPath} */ path, /** @type {YamlOptions} */ options, /** @type {YamlPrint} */ print) {
  /** @type {{ node: YamlNode }} */ const { node } = path;

  /** @type {Doc[]} */
  const parts = [];

  if (node.type !== "mappingValue" && hasLeadingComments(node)) {
    parts.push([join(hardline, path.map(print, "leadingComments")), hardline]);
  }

  const { tag, anchor } = node;
  if (tag) {
    parts.push(print("tag"));
  }
  if (tag && anchor) {
    parts.push(" ");
  }
  if (anchor) {
    parts.push(print("anchor"));
  }

  /** @type {Doc} */
  let nextEmptyLine = "";

  if (
    isNode(node, [
      "mapping",
      "sequence",
      "comment",
      "directive",
      "mappingItem",
      "sequenceItem",
    ]) &&
    !isLastDescendantNode(path)
  ) {
    nextEmptyLine = printNextEmptyLine(path, options.originalText);
  }

  if (tag || anchor) {
    if (isNode(node, ["sequence", "mapping"]) && !hasMiddleComments(node)) {
      parts.push(hardline);
    } else {
      parts.push(" ");
    }
  }

  if (hasMiddleComments(node)) {
    parts.push([
      node.middleComments.length === 1 ? "" : hardline,
      join(hardline, path.map(print, "middleComments")),
      hardline,
    ]);
  }

  if (hasPrettierIgnore(path)) {
    parts.push(
      replaceEndOfLine(
        options.originalText
          .slice(node.position.start.offset, node.position.end.offset)
          .trimEnd(),
      ),
    );
  } else {
    parts.push(group(printNode(path, options, print)));
  }

  if (hasTrailingComment(node) && !isNode(node, ["document", "documentHead"])) {
    parts.push(
      lineSuffix([
        node.type === "mappingValue" && !node.content ? "" : " ",
        path.parent.type === "mappingKey" &&
        path.getParentNode(2).type === "mapping" &&
        isInlineNode(node)
          ? ""
          : breakParent,
        print("trailingComment"),
      ]),
    );
  }

  if (shouldPrintEndComments(node)) {
    parts.push(
      alignWithSpaces(node.type === "sequenceItem" ? 2 : 0, [
        hardline,
        join(
          hardline,
          path.map(
            /** @returns {any[]} */ ({ node }) => [
              isPreviousLineEmpty(options.originalText, locStart(node))
                ? hardline
                : "",
              print(),
            ],
            "endComments",
          ),
        ),
      ]),
    );
  }
  parts.push(nextEmptyLine);
  return parts;
}

function printNode(/** @type {AstPath} */ path, /** @type {YamlOptions} */ options, /** @type {YamlPrint} */ print) {
  /** @type {{ node: YamlNode }} */ const { node } = path;
  switch (node.type) {
    case "root": {
      const lastDescendantNode = getLastDescendantNode(node);
      const shouldPrintHardline = !(
        isNode(lastDescendantNode, ["blockLiteral", "blockFolded"]) &&
        lastDescendantNode.chomping === "keep"
      );
      const parts = [];
      path.each(({ node: document, isFirst }) => {
        if (!isFirst) {
          parts.push(hardline);
        }
        parts.push(print());
        if (shouldPrintDocumentEndMarker(path)) {
          if (shouldPrintHardline) {
            parts.push(hardline);
          }

          parts.push("...");
          if (hasTrailingComment(document)) {
            parts.push(" ", print("trailingComment"));
          }
        }
      }, "children");

      if (shouldPrintHardline) {
        parts.push(hardline);
      }

      return parts;
    }
    case "document": {
      const parts = [];
      if (shouldPrintDocumentHeadEndMarker(path)) {
        if (node.head.children.length > 0 || node.head.endComments.length > 0) {
          parts.push(print("head"));
        }

        if (hasTrailingComment(node.head)) {
          parts.push(["---", " ", print(["head", "trailingComment"])]);
        } else {
          parts.push("---");
        }
      }

      if (shouldPrintDocumentBody(node)) {
        parts.push(print("body"));
      }

      return join(hardline, parts);
    }
    case "documentHead":
      return join(hardline, [
        ...path.map(print, "children"),
        ...path.map(print, "endComments"),
      ]);
    case "documentBody": {
      const { children, endComments } = node;
      /** @type {Doc} */
      let separator = "";
      if (children.length > 0 && endComments.length > 0) {
        const lastDescendantNode = getLastDescendantNode(node);
        // there's already a newline printed at the end of blockValue (chomping=keep, lastDescendant=true)
        if (isNode(lastDescendantNode, ["blockFolded", "blockLiteral"])) {
          // an extra newline for better readability
          if (lastDescendantNode.chomping !== "keep") {
            separator = [hardline, hardline];
          }
        } else {
          // Check if we need to preserve empty line before end comments
          const lastChild = children.at(-1);
          const shouldPreserveEmptyLine =
            isNode(lastChild, ["mapping"]) &&
            isPreviousLineEmpty(options.originalText, locStart(endComments[0]));

          separator = shouldPreserveEmptyLine ? [hardline, hardline] : hardline;
        }
      }

      return [
        join(hardline, path.map(print, "children")),
        separator,
        join(hardline, path.map(print, "endComments")),
      ];
    }
    case "directive":
      return ["%", join(" ", [node.name, ...node.parameters])];
    case "comment":
      return ["#", node.value];
    case "alias":
      return ["*", node.value];
    case "tag":
      return options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset,
      );
    case "anchor":
      return ["&", node.value];
    case "plain":
      return printFlowScalarContent(
        node.type,
        options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset,
        ),
        options,
      );
    case "quoteDouble":
    case "quoteSingle": {
      /** @type {string} */ const singleQuote = "'";
      /** @type {string} */ const doubleQuote = '"';

      const raw = options.originalText.slice(
        node.position.start.offset + 1,
        node.position.end.offset - 1,
      );

      if (
        (node.type === "quoteSingle" && raw.includes("\\")) ||
        (node.type === "quoteDouble" && /\\[^"]/.test(raw))
      ) {
        // only quoteDouble can use escape chars
        // and quoteSingle do not need to escape backslashes
        /** @type {string} */ const originalQuote =
          node.type === "quoteDouble" ? doubleQuote : singleQuote;
        return [
          originalQuote,
          printFlowScalarContent(node.type, raw, options),
          originalQuote,
        ];
      }

      if (raw.includes(doubleQuote)) {
        return [
          singleQuote,
          printFlowScalarContent(
            node.type,
            node.type === "quoteDouble"
              ? raw
                  // double quote needs to be escaped by backslash in quoteDouble
                  .replaceAll(String.raw`\"`, doubleQuote)
                  .replaceAll("'", singleQuote.repeat(2))
              : raw,
            options,
          ),
          singleQuote,
        ];
      }

      if (raw.includes(singleQuote)) {
        return [
          doubleQuote,
          printFlowScalarContent(
            node.type,
            node.type === "quoteSingle"
              ? // single quote needs to be escaped by 2 single quotes in quoteSingle
                raw.replaceAll("''", singleQuote)
              : raw,
            options,
          ),
          doubleQuote,
        ];
      }

      /** @type {string} */ const quote = options.singleQuote ? singleQuote : doubleQuote;
      return [quote, printFlowScalarContent(node.type, raw, options), quote];
    }
    case "blockFolded":
    case "blockLiteral":
      return printBlock(path, options, print);

    case "mapping":
    case "sequence":
      return join(hardline, path.map(print, "children"));
    case "sequenceItem":
      return ["- ", alignWithSpaces(2, node.content ? print("content") : "")];
    case "mappingKey":
    case "mappingValue":
      return !node.content ? "" : print("content");
    case "mappingItem":
    case "flowMappingItem":
      return printMappingItem(path, options, print);

    case "flowMapping":
      return printFlowMapping(path, options, print);
    case "flowSequence":
      return printFlowSequence(path, options, print);
    case "flowSequenceItem":
      return print("content");
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "YAML");
  }
}

/** @returns {boolean} */ function shouldPrintDocumentBody(/** @type {YamlNode} */ document) {
  return document.body.children.length > 0 || hasEndComments(document.body);
}

/** @returns {boolean} */ function shouldPrintDocumentEndMarker(/** @type {AstPath} */ path) {
  /** @type {YamlNode} */ const document = path.node;

  if (document.documentEndMarker) {
    return true;
  }

  /**
   *... # trailingComment
   */
  if (hasTrailingComment(document)) {
    return true;
  }

  if (path.isLast) {
    return false;
  }

  const nextDocument = path.next;

  return (
    /**
     * ...
     * %DIRECTIVE
     * ---
     */
    nextDocument.head.children.length > 0 ||
    /**
     * ...
     * # endComment
     * ---
     */
    hasEndComments(nextDocument.head)
  );
}

/** @returns {boolean | null} */ function shouldPrintDocumentHeadEndMarker(/** @type {AstPath} */ path) {
  /** @type {YamlNode} */ const document = path.node;
  return (
    /**
     * ---
     * preserve the first document head end marker
     */
    document.directivesEndMarker ||
    /**
     * %DIRECTIVE
     * ---
     */
    document.head.children.length > 0 ||
    /**
     * # end comment
     * ---
     */
    hasEndComments(document.head) ||
    /**
     * --- # trailing comment
     */
    hasTrailingComment(document.head)
  );
}

/** @returns {any[]} */ function printFlowScalarContent(/** @type {string} */ nodeType, /** @type {string} */ content, /** @type {YamlOptions} */ options) {
  const lineContents = getFlowScalarLineContents(nodeType, content, options);
  return join(
    hardline,
    lineContents.map((/** @type {any[]} */ lineContentWords) => fill(join(line, lineContentWords))),
  );
}

const printer = {
  preprocess,
  embed,
  print: genericPrint,
  massageAstNode,
  insertPragma,
  getVisitorKeys,
};

export default printer;
