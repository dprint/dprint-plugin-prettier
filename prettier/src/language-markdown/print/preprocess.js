// @nts-check
/** @import {MdastNode, MdastPosition, MarkdownOptions} from "../utilities.js" */
import htmlWhitespace from "../../utilities/html-whitespace.js";
import { getOrderedListItemInfo, mapAst, splitText } from "../utilities.js";
import { getBlockquoteRawText } from "../utilities/get-blockquote-raw-text.js";

// 0x0 ~ 0x10ffff
const isSingleCharRegex = /^\\?.$/su;
const isNewLineBlockquoteRegex = /^\n *>[ >]*$/;

/** @returns {MdastNode} */ function preprocess(/** @type {MdastNode} */ ast, /** @type {MarkdownOptions} */ options) {
  if (options.parser === "mdx") {
    ast = restoreUnescapedCharacter(ast, options);
  } else {
    ast = addRawToText(ast, options);
  }
  ast = mergeContinuousTexts(ast);
  if (options.parser === "mdx") {
    ast = transformIndentedCodeblockAndMarkItsParentList(ast, options);
  } else {
    ast = transformIndentedCodeblock(ast, options);
  }
  if (options.parser !== "mdx") {
    ast = markOriginalImageAndLinkAlt(ast, options);
  }
  if (options.parser === "mdx") {
    ast = markAlignedListLegacy(ast, options);
  } else {
    ast = markAlignedList(ast, options);
  }
  if (options.parser === "mdx") {
    ast = splitTextIntoSentencesLegacy(ast);
  } else {
    ast = splitTextIntoSentences(ast);
  }
  return ast;
}

/** @returns {MdastNode} */ function restoreUnescapedCharacter(/** @type {MdastNode} */ ast, /** @type {MarkdownOptions} */ options) {
  return mapAst(ast, (node) => {
    if (node.type !== "text") {
      return node;
    }

    const { value } = node;

    if (
      value === "*" ||
      value === "_" || // handle these cases in printer
      !isSingleCharRegex.test(value) ||
      node.position.end.offset - node.position.start.offset === value.length
    ) {
      return node;
    }

    const text = options.originalText.slice(
      node.position.start.offset,
      node.position.end.offset,
    );

    if (isNewLineBlockquoteRegex.test(text)) {
      return node;
    }

    return { ...node, value: text };
  });
}

/** @returns {MdastNode} */ function addRawToText(/** @type {MdastNode} */ ast, /** @type {MarkdownOptions} */ options) {
  return mapAst(ast, (node) => {
    if (node.type === "text") {
      // https://github.com/remarkjs/remark-gfm/issues/16
      node.raw = options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset,
      );
    }
    return node;
  });
}

/** @returns {MdastNode} */ function mergeChildren(/** @type {MdastNode} */ ast, /** @type {(a0: MdastNode, a1: MdastNode) => boolean} */ shouldMerge, /** @type {(a0: MdastNode, a1: MdastNode) => MdastNode} */ mergeNode) {
  return mapAst(ast, (node) => {
    if (!node.children) {
      return node;
    }

    /** @type {MdastNode[]} */
    const children = [];
    /** @type {MdastNode | undefined} */
    let lastChild;
    /** @type {boolean | undefined} */
    let changed;
    for (let child of node.children) {
      if (lastChild && shouldMerge(lastChild, child)) {
        child = mergeNode(lastChild, child);
        // Replace the previous node
        // eslint-disable-next-line unicorn/no-confusing-array-splice
        children.splice(-1, 1, child);
        changed ||= true;
      } else {
        children.push(child);
      }

      lastChild = child;
    }

    return changed ? { ...node, children } : node;
  });
}

/** @returns {MdastNode} */ function mergeContinuousTexts(/** @type {MdastNode} */ ast) {
  return mergeChildren(
    ast,
    /** @returns {boolean} */ (prevNode, node) => prevNode.type === "text" && node.type === "text",
    (prevNode, node) => ({
      type: "text",
      value: prevNode.value + node.value,
      position: {
        start: prevNode.position.start,
        end: node.position.end,
      },
    }),
  );
}

/** @returns {MdastNode} */ function splitTextIntoSentencesLegacy(/** @type {MdastNode} */ ast) {
  return mapAst(ast, (node, index, [parentNode]) => {
    if (node.type !== "text") {
      return node;
    }

    let { value } = node;

    if (parentNode.type === "paragraph") {
      // CommonMark doesn't remove trailing/leading \f, but it should be
      // removed in the HTML rendering process
      if (index === 0) {
        value = htmlWhitespace.trimStart(value);
      }
      if (index === parentNode.children.length - 1) {
        value = htmlWhitespace.trimEnd(value);
      }
    }

    return {
      type: "sentence",
      position: node.position,
      children: splitText(value),
    };
  });
}

/** @returns {MdastNode} */ function splitTextIntoSentences(/** @type {MdastNode} */ ast) {
  /** @type {Set<MdastNode>} */
  const canOpenAccidentalWikiLink = new Set();
  /** @type {Set<MdastPosition>} */
  const riskyParagraphPositions = new Set(); // we can't use nodes themselves because they will be cloned.

  walkAst(ast, (node, parentStack) => {
    if (node.type === "wikiLink") {
      markAncestors(parentStack); // word wrapping can accidentally merge nodes like `[[foo\n[[wiki link]]`
      return;
    }

    if (node.type !== "text") {
      return;
    }

    if (node.raw.includes("[[")) {
      for (const ancestor of parentStack) {
        if (ancestor.type === "paragraph") {
          canOpenAccidentalWikiLink.add(ancestor);
        }
      }
    }

    if (node.raw.includes("]]")) {
      markAncestors(parentStack);
    }
  });

  return mapAst(ast, (node, index, parentStack) => {
    if (node.type !== "text") {
      return node;
    }

    // NOTE: there's trade-off between using `node.value` or `node.raw` here.
    // Using `node.raw`, we can better preserve the original text, especially escaped characters.
    // Using `node.value`, we don't need to care about markers like `\n > ` in `blockquote`s.
    let text = node.raw;

    // A setext heading's text can span multiple raw source lines too, e.g.
    // `> Title\n> continued\n> ===`.
    const paragraphIndex = parentStack.findIndex(
      /** @returns {boolean} */ (ancestor) =>
        ancestor?.type === "paragraph" || ancestor?.type === "heading",
    );

    const paragraphNode =
      paragraphIndex === -1 ? undefined : parentStack[paragraphIndex];

    if (paragraphNode) {
      if (
        parentStack
          .slice(paragraphIndex + 1)
          .some(/** @returns {boolean} */ (ancestor) => ancestor?.type === "blockquote")
      ) {
        text = getBlockquoteRawText(text, node);
      }

      const parentNode = parentStack[0];

      if (parentNode?.type === "paragraph") {
        if (index === 0) {
          text = htmlWhitespace.trimStart(text);
        }
        if (index === parentNode.children.length - 1) {
          text = htmlWhitespace.trimEnd(text);
        }
      }
    }

    if (paragraphNode && riskyParagraphPositions.has(paragraphNode.position)) {
      return {
        type: "text",
        position: node.position,
        value: text,
      };
    }

    return {
      type: "sentence",
      position: node.position,
      children: splitText(text),
    };
  });

  function walkAst(/** @type {MdastNode} */ ast, /** @type {(node: MdastNode, parentStack: MdastNode[]) => void} */ handler) {
    return (function preorder(/** @type {MdastNode} */ node, /** @type {MdastNode[]} */ parentStack) {
      handler(node, parentStack);
      if (node.children) {
        for (const child of node.children) {
          preorder(child, [node, ...parentStack]);
        }
      }
    })(ast, []);
  }

  function markAncestors(/** @type {MdastNode[]} */ parentStack) {
    for (const ancestor of parentStack) {
      if (
        ancestor.type === "paragraph" &&
        canOpenAccidentalWikiLink.has(ancestor)
      ) {
        riskyParagraphPositions.add(ancestor.position);
      }
    }
  }
}

/** @returns {MdastNode} */ function transformIndentedCodeblock(/** @type {MdastNode} */ ast, /** @type {MarkdownOptions} */ options) {
  return mapAst(ast, (node) => {
    if (node.type !== "code") {
      return node;
    }
    // the first char may point to `\n`, e.g. `\n\t\tbar`, just ignore it
    const isIndented = /^\n?(?: {4,}|\t)/.test(
      options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset,
      ),
    );

    node.isIndented = isIndented;
    return node;
  });
}

/** @returns {MdastNode} */ function transformIndentedCodeblockAndMarkItsParentList(/** @type {MdastNode} */ ast, /** @type {MarkdownOptions} */ options) {
  return mapAst(ast, (node, index, parentStack) => {
    if (node.type === "code") {
      // the first char may point to `\n`, e.g. `\n\t\tbar`, just ignore it
      const isIndented = /^\n?(?: {4,}|\t)/.test(
        options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset,
        ),
      );

      node.isIndented = isIndented;

      if (isIndented) {
        for (let i = 0; i < parentStack.length; i++) {
          const parent = parentStack[i];

          // no need to check checked items
          if (parent.hasIndentedCodeblock) {
            break;
          }

          if (parent.type === "list") {
            parent.hasIndentedCodeblock = true;
          }
        }
      }
    }
    return node;
  });
}

// remark 11 removes nested links so we need to recover the original alt text
/** @returns {MdastNode} */ function markOriginalImageAndLinkAlt(/** @type {MdastNode} */ ast, /** @type {MarkdownOptions} */ options) {
  const { originalText } = options;
  return mapAst(ast, (node) => {
    if (node.type === "image" || node.type === "imageReference") {
      node.originalAltText = getBracketContent(
        originalText,
        node.position.start.offset,
        node.position.end.offset,
      );
      return node;
    }

    if (node.type !== "link" || !node.url) {
      return node;
    }

    const originalAlt = getBracketContent(
      originalText,
      node.position.start.offset,
      node.position.end.offset,
    );

    if (originalAlt && /[[\]]/.test(originalAlt)) {
      node.originalLabelText = originalAlt;
    }

    return node;
  });
}

/** @returns {string | null} */ function getBracketContent(/** @type {string} */ text, /** @type {number} */ startOffset, /** @type {number} */ endOffset) {
  const firstBracket = text.indexOf("[", startOffset);

  if (firstBracket === -1 || firstBracket >= endOffset) {
    return null;
  }

  let depth = 1;
  let index = firstBracket + 1;

  while (index < endOffset) {
    const char = text[index];

    if (char === "\\") {
      index += 2;
      continue;
    }

    if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;
      if (depth === 0) {
        return text.slice(firstBracket + 1, index);
      }
    }

    index++;
  }

  return null;
}

/** @returns {MdastNode} */ function markAlignedList(/** @type {MdastNode} */ ast, /** @type {MarkdownOptions} */ options) {
  return mapAst(ast, (node, index, parentStack) => {
    if (node.type === "list" && node.children.length > 0) {
      // if one of its parents is not aligned, it's not possible to be aligned in sub-lists
      for (let i = 0; i < parentStack.length; i++) {
        const parent = parentStack[i];
        if (parent.type === "list" && !parent.isAligned) {
          node.isAligned = false;
          return node;
        }
      }

      const next = parentStack[0]?.children[index + 1];
      if (next?.type === "code" && next.isIndented) {
        // hard to align in this case
        node.isAligned = false;
        return node;
      }

      node.isAligned = isAligned(node);
    }

    return node;
  });

  /** @returns {number} */ function getListItemStart(/** @type {MdastNode} */ listItem) {
    return listItem.children.length === 0
      ? -1
      : listItem.children[0].position.start.column - 1;
  }

  /** @returns {boolean} */ function isAligned(/** @type {MdastNode} */ list) {
    if (!list.ordered) {
      /**
       * - 123
       * - 123
       */
      return true;
    }

    const [firstItem, secondItem] = list.children;

    const firstInfo = getOrderedListItemInfo(firstItem, options);

    if (firstInfo.leadingSpaces.length > 1) {
      /**
       * 1.   123
       *
       * 1.   123
       * 1. 123
       */
      return true;
    }

    /** @type {number} */ const firstStart = getListItemStart(firstItem);

    if (firstStart === -1) {
      /**
       * 1.
       *
       * 1.
       * 1.
       */
      return false;
    }

    if (list.children.length === 1) {
      /**
       * aligned:
       *
       * 11. 123
       *
       * not aligned:
       *
       * 1. 123
       */
      return firstStart % options.tabWidth === 0;
    }

    /** @type {number} */ const secondStart = getListItemStart(secondItem);

    if (firstStart !== secondStart) {
      /**
       * 11. 123
       * 1. 123
       *
       * 1. 123
       * 11. 123
       */
      return false;
    }

    if (firstStart % options.tabWidth === 0) {
      /**
       * 11. 123
       * 12. 123
       */
      return true;
    }

    /**
     * aligned:
     *
     * 11. 123
     * 1.  123
     *
     * not aligned:
     *
     * 1. 123
     * 2. 123
     */
    const secondInfo = getOrderedListItemInfo(secondItem, options);
    return secondInfo.leadingSpaces.length > 1;
  }
}

/** @returns {MdastNode} */ function markAlignedListLegacy(/** @type {MdastNode} */ ast, /** @type {MarkdownOptions} */ options) {
  return mapAst(ast, (node, index, parentStack) => {
    if (node.type === "list" && node.children.length > 0) {
      // if one of its parents is not aligned, it's not possible to be aligned in sub-lists
      for (let i = 0; i < parentStack.length; i++) {
        const parent = parentStack[i];
        if (parent.type === "list" && !parent.isAligned) {
          node.isAligned = false;
          return node;
        }
      }

      node.isAligned = isAligned(node);
    }

    return node;
  });

  /** @returns {number} */ function getListItemStart(/** @type {MdastNode} */ listItem) {
    return listItem.children.length === 0
      ? -1
      : listItem.children[0].position.start.column - 1;
  }

  /** @returns {boolean} */ function isAligned(/** @type {MdastNode} */ list) {
    if (!list.ordered) {
      /**
       * - 123
       * - 123
       */
      return true;
    }

    const [firstItem, secondItem] = list.children;

    const firstInfo = getOrderedListItemInfo(firstItem, options);

    if (firstInfo.leadingSpaces.length > 1) {
      /**
       * 1.   123
       *
       * 1.   123
       * 1. 123
       */
      return true;
    }

    /** @type {number} */ const firstStart = getListItemStart(firstItem);

    if (firstStart === -1) {
      /**
       * 1.
       *
       * 1.
       * 1.
       */
      return false;
    }

    if (list.children.length === 1) {
      /**
       * aligned:
       *
       * 11. 123
       *
       * not aligned:
       *
       * 1. 123
       */
      return firstStart % options.tabWidth === 0;
    }

    /** @type {number} */ const secondStart = getListItemStart(secondItem);

    if (firstStart !== secondStart) {
      /**
       * 11. 123
       * 1. 123
       *
       * 1. 123
       * 11. 123
       */
      return false;
    }

    if (firstStart % options.tabWidth === 0) {
      /**
       * 11. 123
       * 12. 123
       */
      return true;
    }

    /**
     * aligned:
     *
     * 11. 123
     * 1.  123
     *
     * not aligned:
     *
     * 1. 123
     * 2. 123
     */
    const secondInfo = getOrderedListItemInfo(secondItem, options);
    return secondInfo.leadingSpaces.length > 1;
  }
}

export default preprocess;
