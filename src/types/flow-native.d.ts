/**
 * Flow's parser, the Wasm module of the flow-parser package, which is compiled into the plugin and which
 * `wasm/FlowParser.cs` gives these functions of. Addresses are in the parser's memory.
 */
declare namespace flowNative {
  /** Creates the parser the first time that it is used. */
  function start(): void;
  /** Writes text as UTF-8 with a zero after it and gives its address, or 0 when there is no room for it. */
  function writeText(text: string): int;
  /** How many bytes the text that was written last is, with the zero. */
  function writtenLength(): int;
  function free(address: int): void;
  function parse(
    source: int,
    sourceLength: int,
    filename: int,
    filenameLength: int,
    componentSyntax: int,
    matchSyntax: int,
    decorators: int,
    tokens: int,
    returnOutsideFunction: int,
    assertOperator: int,
    enums: int,
    records: int,
    types: int,
    sourceType: int,
    typesPragmaDetection: int,
    last: int,
  ): int;
  function resultFree(result: int): void;
  function resultError(result: int): string | undefined;
  function resultErrorLine(result: int): int;
  function resultErrorColumn(result: int): int;
  function resultProgramBuffer(result: int): int;
  function resultPositionBuffer(result: int): int;
  function resultPositionBufferSize(result: int): int;
  function resultStringBuffer(result: int): int;
  /** The memory as Emscripten's HEAPU8 (1), HEAPU32 (4) or HEAPF64 (8) has it, until something else is parsed. */
  function heap(elementSize: int): any;
}
