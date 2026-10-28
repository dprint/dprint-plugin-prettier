// @nts-check
import { fill } from "../../document/index.js";
import {
  getTextValueParts,
  getUnescapedAttributeValue,
} from "../utilities/index.js";
import {
  isAngularInterpolation,
  printAngularInterpolation,
} from "./angular-interpolation.js";
import {
  formatAttributeValue,
  printExpand,
  shouldHugJsExpression,
} from "./utilities.js";

/**
@import {AttributeValuePrinter} from "./attribute.js"
*/

const createAngularPrinter =
  (/** @type {string} */ parser) => (textToDoc, print, /** @type {import("../../common/ast-path.js").default} */ path /* , options*/) =>
    formatAttributeValue(
      getUnescapedAttributeValue(path.node),
      textToDoc,
      { parser },
      shouldHugJsExpression,
    );

/** @type {AttributeValuePrinter[]} */
const printers = [
  {
    /*
    - `(click)="angularStatement"`
    - `on-click="angularStatement"`
    */
    /** @returns {boolean} */ test(/** @type {import("../../common/ast-path.js").default} */ path /* , options */) {
      /** @type {string} */ const name = /** @type {import("../parse/ast.js").Node} */ (path.node).fullName;
      return (
        (name.startsWith("(") && name.endsWith(")")) || name.startsWith("on-")
      );
    },
    print: createAngularPrinter("__ng_action"),
  },
  {
    /*
    - `[target]="angularExpression"`
    - `bind-target="angularExpression"`
    - `[(target)]="angularExpression"`
    - `bindon-target="angularExpression"`
    */
    /** @returns {boolean} */ test(/** @type {import("../../common/ast-path.js").default} */ path /* , options */) {
      /** @type {string} */ const name = /** @type {import("../parse/ast.js").Node} */ (path.node).fullName;
      return (
        (name.startsWith("[") && name.endsWith("]")) ||
        /^bind(?:on)?-/.test(name) ||
        // Unofficial rudimentary support for some of the most used directives of AngularJS 1.x
        /^ng-(?:if|show|hide|class|style)$/.test(name)
      );
    },
    print: createAngularPrinter("__ng_binding"),
  },
  {
    /*
    - `*directive="angularDirective"`
    */
    test: /** @returns {boolean} */ (/** @type {import("../../common/ast-path.js").default} */ path /* , options */) => /** @type {import("../parse/ast.js").Node} */ (path.node).fullName.startsWith("*"),
    print: createAngularPrinter("__ng_directive"),
  },
  {
    /*
    - `i18n="longDescription"`
    - `i18n-attr="longDescription"`
    */
    test: /** @returns {boolean} */ (/** @type {import("../../common/ast-path.js").default} */ path /* , options */) => /^i18n(?:-.+)?$/.test(/** @type {import("../parse/ast.js").Node} */ (path.node).fullName),
    print: printAngularI18n,
  },
  {
    test: isAngularInterpolation,
    print: printAngularInterpolation,
  },
].map(({ test, print }) => ({
  test: /** @returns {boolean} */ (/** @type {import("../../common/ast-path.js").default} */ path, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) =>
    options.parser === "angular" && test(path /* , options */),
  print,
}));

function printAngularI18n(textToDoc, print, /** @type {import("../../common/ast-path.js").default} */ { node } /* , options */) {
  /** @type {string} */ const value = getUnescapedAttributeValue(node);
  return printExpand(
    // @ts-expect-error -- Need investigate how `replaceEndOfLine` works
    fill(getTextValueParts(node, value.trim())),
    !value.includes("@@"),
  );
}

export default printers;
