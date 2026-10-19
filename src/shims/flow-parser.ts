/// <reference path="../types/flow-native.d.ts" />
// The flow-parser package, whose parse function is that of its dist/index.js, for what prettier asks of it (an
// ESTree AST rather than Babel's), and of its dist/FlowParser.js with Flow's parser compiled into the plugin
// (`flowNative`) in place of the Wasm module that Emscripten's JavaScript runs there. What reads the parser's
// answer into an AST is the package's own.
import * as deserializerModule from "../vendor/flow-parser/FlowParserDeserializer.js";
import { getModuleDocblock } from "../vendor/flow-parser/getModuleDocblock.js";

const FlowParserDeserializer: any = (deserializerModule as any).default;

const DEFAULTS = {
  flow: "detect",
};

export function parse(code: string, opts: any): any {
  const options = getOptions(opts);
  if (options.flow === "all") {
    options.enableTypes = true;
  } else {
    options.enableTypesPragmaDetection = true;
  }
  if (options.babel === true) {
    throw new Error("Parsing into Babel's AST is not supported");
  }
  return parseFlow(code, options);
}

function getOptions(opts: any): any {
  const options: any = {
    ...DEFAULTS,
    ...(opts != null ? opts : {}),
  };
  if (options.flow !== "all" && options.flow !== "detect") {
    throw new Error("flow option must be \"all\" or \"detect\"");
  }
  if (options.sourceType === "unambiguous") {
    delete options.sourceType;
  } else if (options.sourceType != null && options.sourceType !== "script" && options.sourceType !== "module") {
    throw new Error("sourceType option must be \"script\", \"module\", or \"unambiguous\" if set");
  }
  if (options.enableExperimentalComponentSyntax == null) {
    options.enableExperimentalComponentSyntax = true;
  }
  if (options.enableExperimentalFlowMatchSyntax == null) {
    options.enableExperimentalFlowMatchSyntax = true;
  }
  if (options.enableExperimentalFlowRecordSyntax == null) {
    options.enableExperimentalFlowRecordSyntax = true;
  }
  options.enableRecords = options.enableExperimentalFlowRecordSyntax;
  if (options.enableEnums == null) {
    options.enableEnums = true;
  }
  if (options.enableExperimentalDecorators == null) {
    options.enableExperimentalDecorators = true;
  }
  options.tokens = options.tokens === true;
  options.allowReturnOutsideFunction = options.allowReturnOutsideFunction === true;
  return options;
}

/** FlowParser.parse */
function parseFlow(source: string, options: any): any {
  flowNative.start();
  const filename = typeof options.sourceFilename === "string" ? options.sourceFilename : "";
  let sourceAddr = 0;
  let filenameAddr = 0;
  let filenameLen = 0;
  let parseResult = 0;
  try {
    sourceAddr = flowNative.writeText(source);
    if (!sourceAddr) {
      throw new Error("Parser out of memory");
    }
    const sourceLen = flowNative.writtenLength();
    if (filename.length > 0) {
      filenameAddr = flowNative.writeText(filename);
      if (!filenameAddr) {
        throw new Error("Parser out of memory");
      }
      filenameLen = flowNative.writtenLength();
    }
    const enableTypes = options.enableTypes === false ? 0 : 1;
    const sourceTypeCode = options.sourceType === "script" ? 1 : options.sourceType === "module" ? 2 : 0;
    parseResult = flowNative.parse(
      sourceAddr,
      sourceLen,
      filenameAddr,
      filenameLen,
      flag(options.enableExperimentalComponentSyntax),
      flag(options.enableExperimentalFlowMatchSyntax),
      flag(options.enableExperimentalDecorators),
      flag(options.tokens),
      flag(options.allowReturnOutsideFunction),
      flag(options.assertOperator),
      flag(options.enableEnums),
      flag(options.enableRecords),
      enableTypes,
      sourceTypeCode,
      flag(options.enableTypesPragmaDetection),
      0,
    );
    const programBuffer = flowNative.resultProgramBuffer(parseResult);
    if (!programBuffer) {
      const err = flowNative.resultError(parseResult);
      const syntaxError: any = new SyntaxError(err || "unknown parse error");
      syntaxError.loc = {
        line: flowNative.resultErrorLine(parseResult),
        column: flowNative.resultErrorColumn(parseResult),
      };
      throw syntaxError;
    }
    // what the deserializer reads of Emscripten's module
    const wasmParser = { HEAPU8: flowNative.heap(1), HEAPU32: flowNative.heap(4), HEAPF64: flowNative.heap(8) };
    const deserializer = new FlowParserDeserializer(
      programBuffer,
      flowNative.resultPositionBuffer(parseResult),
      flowNative.resultPositionBufferSize(parseResult),
      flowNative.resultStringBuffer(parseResult),
      wasmParser,
      options,
    );
    const ast = deserializer.deserialize();
    if (ast.type !== "Program") {
      throw new Error(`Expected Program, got ${ast.type}`);
    }
    const sourceFilename = typeof options.sourceFilename === "string" ? options.sourceFilename : null;
    const visitedNodes = new WeakSet<object>();
    const locRanges = new WeakMap<object, any>();
    function fixLocs(node: any): void {
      if (node == null || typeof node !== "object") {
        return;
      }
      const wireNode = node;
      if (visitedNodes.has(wireNode)) {
        return;
      }
      visitedNodes.add(wireNode);
      if (wireNode.loc != null) {
        const loc = wireNode.loc;
        let range = locRanges.get(loc);
        if (range == null) {
          const rangeStart = loc.rangeStart;
          const rangeEnd = loc.rangeEnd;
          if (rangeStart == null || rangeEnd == null) {
            throw new Error("Expected serialized source range");
          }
          loc.source = sourceFilename;
          range = [rangeStart, rangeEnd];
          locRanges.set(loc, range);
          delete loc.rangeStart;
          delete loc.rangeEnd;
        }
        wireNode.range = range;
      }
      for (const key of Object.keys(wireNode)) {
        const val = wireNode[key];
        if (Array.isArray(val)) {
          for (const child of val) {
            fixLocs(child);
          }
        } else {
          fixLocs(val);
        }
      }
    }
    fixLocs(ast);
    if (options.throwOnParseErrors !== false) {
      const errors = ast.errors;
      if (errors != null && errors.length > 0) {
        const first = errors[0];
        const start = first.loc.start;
        if (start == null) {
          throw new Error("Expected serialized parser error start location");
        }
        const line = start.line;
        const column = start.column;
        const syntaxError: any = new SyntaxError(`${first.message} (${line}:${column})`);
        syntaxError.loc = {
          line,
          column,
        };
        throw syntaxError;
      }
    }
    if (options.sourceType === "script" || options.sourceType === "module") {
      ast.sourceType = options.sourceType;
    } else {
      ast.sourceType = detectSourceType(ast);
    }
    ast.docblock = getModuleDocblock(ast);
    return ast;
  } finally {
    if (parseResult !== 0) {
      flowNative.resultFree(parseResult);
    }
    if (sourceAddr !== 0) {
      flowNative.free(sourceAddr);
    }
    if (filenameAddr !== 0) {
      flowNative.free(filenameAddr);
    }
  }
}

function flag(v: unknown): int {
  return v === true ? 1 : 0;
}

function detectSourceType(program: any): string {
  if (!Array.isArray(program.body)) {
    return "script";
  }
  for (const stmt of program.body) {
    if (stmt == null) {
      continue;
    }
    switch (stmt.type) {
      case "ImportDeclaration":
        if (stmt.importKind === "value" || stmt.importKind == null) {
          return "module";
        }
        break;
      case "ExportDefaultDeclaration":
        return "module";
      case "ExportNamedDeclaration":
      case "ExportAllDeclaration":
        if (stmt.exportKind === "value" || stmt.exportKind == null) {
          return "module";
        }
        break;
    }
  }
  return "script";
}
