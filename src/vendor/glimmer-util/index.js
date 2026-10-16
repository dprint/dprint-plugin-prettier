const EMPTY_ARRAY = Object.freeze([]);

function emptyArray() {
    return EMPTY_ARRAY;
}

const EMPTY_STRING_ARRAY = emptyArray(), EMPTY_NUMBER_ARRAY = emptyArray();

/**
 * This function returns `true` if the input array is the special empty array sentinel,
 * which is sometimes used for optimizations.
 */
function isEmptyArray(input) {
    return input === EMPTY_ARRAY;
}

function* reverse(input) {
    for (let i = input.length - 1; i >= 0; i--) yield input[i];
}

function* enumerate(input) {
    let i = 0;
    for (const item of input) yield [ i++, item ];
}

/**
 * Zip two tuples with the same type and number of elements.
 */ function* zipTuples(left, right) {
    for (let i = 0; i < left.length; i++) yield [ i, left[i], right[i] ];
}

function* zipArrays(left, right) {
    for (let i = 0; i < left.length; i++) {
        const perform = i < right.length ? "retain" : "pop";
        yield [ perform, i, left[i], right[i] ];
    }
    for (let i = left.length; i < right.length; i++) yield [ "push", i, void 0, right[i] ];
}

function isPresentArray(list) {
    return list.length > 0;
}

function getLast(list) {
    return 0 === list.length ? void 0 : list[list.length - 1];
}

function dict() {
    return Object.create(null);
}

function isDict(u) {
    return null != u;
}

function isIndexable(u) {
    return "function" == typeof u || "object" == typeof u && null !== u;
}

class StackImpl {
    stack;
    current=null;
    constructor(values = []) {
        this.stack = values;
    }
    get size() {
        return this.stack.length;
    }
    push(item) {
        this.current = item, this.stack.push(item);
    }
    pop() {
        let item = this.stack.pop();
        return this.current = getLast(this.stack) ?? null, void 0 === item ? null : item;
    }
    nth(from) {
        let len = this.stack.length;
        return len < from ? null : this.stack[len - from];
    }
    isEmpty() {
        return 0 === this.stack.length;
    }
    snapshot() {
        return [ ...this.stack ];
    }
    toArray() {
        return this.stack;
    }
}

/// <reference types="qunit" />
let beginTestSteps, endTestSteps, verifySteps, logStep;

function clearElement(parent) {
    let current = parent.firstChild;
    for (;current; ) {
        let next = current.nextSibling;
        parent.removeChild(current), current = next;
    }
}

/**
  Strongly hint runtimes to intern the provided string.

  When do I need to use this function?

  For the most part, never. Pre-mature optimization is bad, and often the
  runtime does exactly what you need it to, and more often the trade-off isn't
  worth it.

  Why?

  Runtimes store strings in at least 2 different representations:
  Ropes and Symbols (interned strings). The Rope provides a memory efficient
  data-structure for strings created from concatenation or some other string
  manipulation like splitting.

  Unfortunately checking equality of different ropes can be quite costly as
  runtimes must resort to clever string comparison algorithms. These
  algorithms typically cost in proportion to the length of the string.
  Luckily, this is where the Symbols (interned strings) shine. As Symbols are
  unique by their string content, equality checks can be done by pointer
  comparison.

  How do I know if my string is a rope or symbol?

  Typically (warning general sweeping statement, but truthy in runtimes at
  present) static strings created as part of the JS source are interned.
  Strings often used for comparisons can be interned at runtime if some
  criteria are met.  One of these criteria can be the size of the entire rope.
  For example, in chrome 38 a rope longer then 12 characters will not
  intern, nor will segments of that rope.

  Some numbers: http://jsperf.com/eval-vs-keys/8

  Known Trick™

  @private
  @return {String} interned version of the provided string
*/ function intern(str) {
    let obj = {};
    obj[str] = 1;
    for (let key in obj) if (key === str) return key;
    return str;
}

const SERIALIZATION_FIRST_NODE_STRING = "%+b:0%";

function isSerializationFirstNode(node) {
    return "%+b:0%" === node.nodeValue;
}

let assign = Object.assign;

function values(obj) {
    return Object.values(obj);
}

function entries(dict) {
    return Object.entries(dict);
}

function keys(obj) {
    return Object.keys(obj);
}

function strip(strings, ...args) {
    let out = "";
    for (const [i, string] of enumerate(strings)) out += `${string}${void 0 !== args[i] ? String(args[i]) : ""}`;
    let lines = out.split("\n");
    for (;isPresentArray(lines) && /^\s*$/u.test(0 === (list = lines).length ? void 0 : list[0]); ) lines.shift();
    for (var list; isPresentArray(lines) && /^\s*$/u.test(getLast(lines)); ) lines.pop();
    let min = 1 / 0;
    for (let line of lines) {
        let leading = /^\s*/u.exec(line)[0].length;
        min = Math.min(min, leading);
    }
    let stripped = [];
    for (let line of lines) stripped.push(line.slice(min));
    return stripped.join("\n");
}

/**
 * This constant exists to make it easier to differentiate normal logs from
 * errant console.logs. LOCAL_LOGGER should only be used inside a
 * LOCAL_TRACE_LOGGING check.
 *
 * It does not alleviate the need to check LOCAL_TRACE_LOGGING, which is used
 * for stripping.
 */ const LOCAL_LOGGER = console, LOGGER = console;

/**
 * This constant exists to make it easier to differentiate normal logs from
 * errant console.logs. LOGGER can be used outside of LOCAL_TRACE_LOGGING checks,
 * and is meant to be used in the rare situation where a console.* call is
 * actually appropriate.
 */ function assertNever(value, desc = "unexpected unreachable branch") {
    throw LOGGER.log("unreachable", value), LOGGER.log(`${desc} :: ${JSON.stringify(value)} (${value})`), 
    new Error("code reached unreachable");
}

export { EMPTY_ARRAY, EMPTY_NUMBER_ARRAY, EMPTY_STRING_ARRAY, LOCAL_LOGGER, LOGGER, SERIALIZATION_FIRST_NODE_STRING, StackImpl as Stack, assertNever, assign, beginTestSteps, clearElement, dict, emptyArray, endTestSteps, entries, enumerate, intern, isDict, isEmptyArray, isIndexable, isSerializationFirstNode, keys, logStep, reverse, strip, values, verifySteps, zipArrays, zipTuples };
//# sourceMappingURL=index.js.map
