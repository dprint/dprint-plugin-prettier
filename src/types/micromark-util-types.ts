import type {Event} from './micromark-events.js'

// Note: this file is authored manually, not generated from `index.js`.

/**
 * A character code.
 *
 * This is often the same as what `String#charCodeAt()` yields but micromark
 * adds meaning to certain other values.
 *
 * `null` represents the end of the input stream (called eof).
 * Negative integers are used instead of certain sequences of characters (such
 * as line endings and tabs).
 */
export type Code = number | null

/**
 * A chunk is either a character code or a slice of a buffer in the form of a
 * string.
 *
 * Chunks are used because strings are more efficient storage that character
 * codes, but limited in what they can represent.
 */
export type Chunk = Code | string

/**
 * Enumeration of the content types.
 *
 * Technically `document` is also a content type, which includes containers
 * (lists, block quotes) and flow.
 * As `ContentType` is used on tokens to define the type of subcontent but
 * `document` is the highest level of content, so it’s not listed here.
 *
 * Containers in markdown come from the margin and include more constructs
 * on the lines that define them.
 * Take for example a block quote with a paragraph inside it (such as
 * `> asd`).
 *
 * `flow` represents the sections, such as headings, code, and content, which
 * is also parsed per line
 * An example is HTML, which has a certain starting condition (such as
 * `<script>` on its own line), then continues for a while, until an end
 * condition is found (such as `</style>`).
 * If that line with an end condition is never found, that flow goes until
 * the end.
 *
 * `content` is zero or more definitions, and then zero or one paragraph.
 * It’s a weird one, and needed to make certain edge cases around definitions
 * spec compliant.
 * Definitions are unlike other things in markdown, in that they behave like
 * `text` in that they can contain arbitrary line endings, but *have* to end
 * at a line ending.
 * If they end in something else, the whole definition instead is seen as a
 * paragraph.
 *
 * The content in markdown first needs to be parsed up to this level to
 * figure out which things are defined, for the whole document, before
 * continuing on with `text`, as whether a link or image reference forms or
 * not depends on whether it’s defined.
 * This unfortunately prevents a true streaming markdown to HTML compiler.
 *
 * `text` contains phrasing content such as attention (emphasis, strong),
 * media (links, images), and actual text.
 *
 * `string` is a limited `text` like content type which only allows character
 * references and character escapes.
 * It exists in things such as identifiers (media references, definitions),
 * titles, or URLs.
 */
export type ContentType = 'content' | 'document' | 'flow' | 'string' | 'text'

/**
 * A location in the document (`line`/`column`/`offset`) and chunk (`_index`,
 * `_bufferIndex`).
 *
 * (dprint-plugin-prettier: this file is micromark-util-types' `index.d.ts` as a module that nts compiles, which
 * src/nts.json maps the package to. `Point`, `Token` and `Effects` are interfaces, which nts compiles to classes
 * whose properties are fields, `Point`'s with its properties in the order micromark creates them in: micromark
 * creates its tokens as objects written out or given to `enter` as its fields, which nts creates as tokens, and gives
 * them nothing that `Token` does not declare (the fields that its extensions add to the interface are written in
 * it). The tokenizer's context is an object type, which is a record as it was, with what it holds typed, as the
 * context that constructs that interrupt are given is a record made with `Object.create` of it; its functions are
 * properties rather than methods, so that they are called as what they are. `Event` is in micromark-events.js; and
 * the types of constructs, extensions, the parser, the compiler and the state functions are `any`, which is what
 * nts made of them before, as some of them are created as something else than they say.)
 *
 * `_bufferIndex` is `-1` when `_index` points to a code chunk and it’s a
 * non-negative integer when pointing to a string chunk.
 *
 * The interface for the location in the document comes from unist `Point`:
 * <https://github.com/syntax-tree/unist#point>
 */
export interface Point {
  /**
   * Position in a string chunk (or `-1` when pointing to a numeric chunk).
   */
  _bufferIndex: number

  /**
   * Position in a list of chunks.
   */
  _index: number

  /**
   * 1-indexed line number.
   */
  line: number

  /**
   * 1-indexed column number.
   */
  column: number

  /**
   * 0-indexed position in the document.
   */
  offset: number
}

/**
 * A token: a span of chunks.
 *
 * Tokens are what the core of micromark produces: the built in HTML compiler
 * or other tools can turn them into different things.
 *
 * Tokens are essentially names attached to a slice of chunks, such as
 * `lineEndingBlank` for certain line endings, or `codeFenced` for a whole
 * fenced code.
 *
 * Sometimes, more info is attached to tokens, such as `_open` and `_close`
 * by `attention` (strong, emphasis) to signal whether the sequence can open
 * or close an attention run.
 *
 * Linked tokens are used because outer constructs are parsed first.
 * Take for example:
 *
 * ```markdown
 * > *a
 * b*.
 * ```
 *
 * 1.  The block quote marker and the space after it is parsed first
 * 2.  The rest of the line is a `chunkFlow` token
 * 3.  The two spaces on the second line are a `linePrefix`
 * 4.  The rest of the line is another `chunkFlow` token
 *
 * The two `chunkFlow` tokens are linked together.
 * The chunks they span are then passed through the flow tokenizer.
 */
export interface Token {
  /**
   * Token type.
   */
  type: TokenType

  /**
   * Point where the token starts.
   */
  start: Point

  /**
   * Point where the token ends.
   */
  end: Point

  /**
   * The previous token in a list of linked tokens.
   */
  previous?: Token | undefined

  /**
   * The next token in a list of linked tokens.
   */
  next?: Token | undefined

  /**
   * Declares a token as having content of a certain type.
   */
  contentType?: ContentType | undefined

  /**
   * Declares that trailing whitespace is sensitive,
   * is allowed,
   * when `contentType` is `text` (or `string`).
   * Normally,
   * trailing spaces and tabs are dropped.
   */
  _contentTypeTextTrailing?: boolean | undefined

  /**
   * Connected tokenizer.
   *
   * Used when dealing with linked tokens.
   * A child tokenizer is needed to tokenize them, which is stored on those
   * tokens.
   */
  _tokenizer?: TokenizeContext | undefined

  /**
   * Field to help parse attention.
   *
   * Depending on the character before sequences (`**`), the sequence can open,
   * close, both, or none.
   */
  _open?: boolean | undefined

  /**
   * Field to help parse attention.
   *
   * Depending on the character before sequences (`**`), the sequence can open,
   * close, both, or none.
   */
  _close?: boolean | undefined

  /**
   * Field to help parse GFM task lists.
   *
   * This boolean is used internally to figure out if a token is in the first
   * content of a list item construct.
   */
  _isInFirstContentOfListItem?: boolean | undefined

  /**
   * Field to help parse containers.
   *
   * This boolean is used internally to figure out if a token is a container
   * token.
   */
  _container?: boolean | undefined

  /**
   * Field to help parse lists.
   *
   * This boolean is used internally to figure out if a list is loose or not.
   */
  _loose?: boolean | undefined

  /**
   * Field to help parse links.
   *
   * This boolean is used internally to figure out if a link opening
   * can’t be used (because links in links are incorrect).
   */
  _inactive?: boolean | undefined

  /**
   * Field to help parse links.
   *
   * This boolean is used internally to figure out if a link opening is
   * balanced: it’s not a link opening but has a balanced closing.
   */
  _balanced?: boolean | undefined

  // (dprint-plugin-prettier: the fields that micromark-extension-gfm-table, mdast-util-from-markdown and
  // micromark-extension-gfm-autolink-literal give tokens, which their declarations add to the interface)
  _align?: Array<'center' | 'left' | 'none' | 'right'> | undefined

  _spread?: boolean | undefined

  _gfmAutolinkLiteralWalkedInto?: boolean | undefined
}

/**
 * The start or end of a token amongst other events.
 *
 * Tokens can “contain” other tokens, even though they are stored in a flat
 * list, through `enter`ing before them, and `exit`ing after them.
 */
export type {Event}

/**
 * Open a token.
 *
 * @param type
 *   Token type.
 * @param fields
 *   Extra fields.
 * @returns {Token}
 *   Token.
 */
export type Enter = (
  type: TokenType,
  fields?: Omit<Partial<Token>, 'type'> | undefined
) => Token

/**
 * Close a token.
 *
 * @param type
 *   Token type.
 * @returns
 *   Token.
 */
export type Exit = (type: TokenType) => Token

/**
 * Deal with the character and move to the next.
 *
 * @param code
 *   Current code.
 */
export type Consume = (code: Code) => undefined

/**
 * Attempt deals with several values, and tries to parse according to those
 * values.
 *
 * If a value resulted in `ok`, it worked, the tokens that were made are used,
 * and `ok` is switched to.
 * If the result is `nok`, the attempt failed, so we revert to the original
 * state, and `nok` is used.
 *
 * @param construct
 *   Construct(s) to try.
 * @param ok
 *   State to move to when successful.
 * @param nok
 *   State to move to when unsuccessful.
 * @returns
 *   Next state.
 */
export type Attempt = (
  construct: Array<Construct> | ConstructRecord | Construct,
  ok: State,
  nok?: State | undefined
) => State

/**
 * A context object to transition the state machine.
 */
export interface Effects {
  /**
   * Try to tokenize a construct.
   */
  attempt: Attempt

  /**
   * Attempt, then revert.
   */
  check: Attempt

  /**
   * Deal with the character and move to the next.
   */
  consume: Consume

  /**
   * Start a new token.
   */
  enter: Enter

  /**
   * End a started token.
   */
  exit: Exit

  /**
   * Interrupt is used for stuff right after a line of content.
   */
  interrupt: Attempt
}

/**
 * The main unit in the state machine: a function that gets a character code
 * and has certain effects.
 *
 * A state function should return another function: the next
 * state-as-a-function to go to.
 *
 * But there is one case where they return `undefined`: for the eof character
 * code (at the end of a value).
 * The reason being: well, there isn’t any state that makes sense, so
 * `undefined` works well.
 * Practically that has also helped: if for some reason it was a mistake, then
 * an exception is throw because there is no next function, meaning it
 * surfaces early.
 *
 * @param code
 *   Current code.
 * @returns
 *   Next state.
 */
// (dprint-plugin-prettier: `(code: Code) => State | undefined` in the package, a function type that names itself,
// which nts has no C# type for, so the next state is held as anything)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type State = (code: Code) => any

/**
 * A resolver handles and cleans events coming from `tokenize`.
 *
 * @param events
 *   List of events.
 * @param context
 *   Tokenize context.
 * @returns
 *   The given, modified, events.
 */
export type Resolver = (
  events: Array<Event>,
  context: TokenizeContext
) => Array<Event>

/**
 * A tokenize function sets up a state machine to handle character codes streaming in.
 *
 * @param this
 *   Tokenize context.
 * @param effects
 *   Effects.
 * @param ok
 *   State to go to when successful.
 * @param nok
 *   State to go to when unsuccessful.
 * @returns
 *   First state.
 */
export type Tokenizer = (
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State
) => State

/**
 * Like a tokenizer, but without `ok` or `nok`.
 *
 * @param this
 *   Tokenize context.
 * @param effects
 *   Effects.
 * @returns
 *   First state.
 */
export type Initializer = (this: TokenizeContext, effects: Effects) => State

/**
 * Like a tokenizer, but without `ok` or `nok`, and returning `undefined`.
 *
 * This is the final hook when a container must be closed.
 *
 * @param this
 *   Tokenize context.
 * @param effects
 *   Effects.
 * @returns
 *   Nothing.
 */
export type Exiter = (this: TokenizeContext, effects: Effects) => undefined

/**
 * Guard whether `code` can come before the construct.
 *
 * In certain cases a construct can hook into many potential start characters.
 * Instead of setting up an attempt to parse that construct for most
 * characters, this is a speedy way to reduce that.
 *
 * @param this
 *   Tokenize context.
 * @param code
 *   Previous code.
 * @returns
 *   Whether `code` is allowed before.
 */
export type Previous = (this: TokenizeContext, code: Code) => boolean

/**
 * An object describing how to parse a markdown construct.
 */
export type Construct = any

/**
 * Like a construct, but `tokenize` does not accept `ok` or `nok`.
 */
export type InitialConstruct = any

/**
 * Several constructs, mapped from their initial codes.
 */
export type ConstructRecord = any

/**
 * State shared between container calls.
 */
export type ContainerState = any

/**
 * A context object that helps w/ tokenizing markdown constructs.
 */
export type TokenizeContext = {
  // To do: next major: remove `_gfmTableDynamicInterruptHack` (no longer
  // needed in micromark-extension-gfm-table@1.0.6).
  /**
   * Internal boolean shared with `micromark-extension-gfm-table` whose body
   * rows are not affected by normal interruption rules.
   * “Normal” rules are, for example, that an empty list item can’t interrupt:
   *
   * ````markdown
   * a
   * *
   * ````
   *
   * The above is one paragraph.
   * These rules don’t apply to table body rows:
   *
   * ````markdown
   * | a |
   * | - |
   * *
   * ````
   *
   * The above list interrupts the table.
   */
  _gfmTableDynamicInterruptHack?: boolean

  /**
   * Internal boolean shared with `micromark-extension-gfm-task-list-item` to
   * signal whether the tokenizer is tokenizing the first content of a list item
   * construct.
   */
  _gfmTasklistFirstContentOfListItem?: boolean | undefined

  /**
   * Declares that trailing whitespace is sensitive,
   * is allowed,
   * when tokenizing `text` (or `string`).
   * Normally,
   * trailing spaces and tabs are dropped.
   */
  _contentTypeTextTrailing?: boolean | undefined

  /**
   * Current code.
   */
  code: Code

  /**
   * Share state set when parsing containers.
   *
   * Containers are parsed in separate phases: their first line (`tokenize`),
   * continued lines (`continuation.tokenize`), and finally `exit`.
   * This record can be used to store some information between these hooks.
   */
  containerState?: ContainerState | undefined

  /**
   * The current construct.
   *
   * Constructs that are not `partial` are set here.
   */
  currentConstruct?: Construct | undefined

  /**
   * Current list of events.
   */
  events: Array<Event>

  /**
   * Whether we’re currently interrupting.
   *
   * Take for example:
   *
   * ```markdown
   * a
   * # b
   * ```
   *
   * At 2:1, we’re “interrupting”.
   */
  interrupt?: boolean | undefined

  /**
   * The relevant parsing context.
   */
  parser: ParseContext

  /**
   * The previous code.
   */
  previous: Code

  /**
   * Define a skip
   *
   * As containers (block quotes, lists), “nibble” a prefix from the margins,
   * where a line starts after that prefix is defined here.
   * When the tokenizers moves after consuming a line ending corresponding to
   * the line number in the given point, the tokenizer shifts past the prefix
   * based on the column in the shifted point.
   *
   * @param point
   *   Skip.
   * @returns
   *   Nothing.
   */
  defineSkip: (point: Point) => undefined

  /**
   * Get the current place.
   *
   * @returns
   *   Current point.
   */
  now: () => Point

  /**
   * Get the source text that spans a token (or location).
   *
   * @param token
   *   Start/end in stream.
   * @param expandTabs
   *   Whether to expand tabs.
   * @returns
   *   Serialized chunks.
   */
  sliceSerialize: (
    token: Pick<Token, 'end' | 'start'>,
    expandTabs?: boolean | undefined
  ) => string

  /**
   * Get the chunks that span a token (or location).
   *
   * @param token
   *   Start/end in stream.
   * @returns
   *   List of chunks.
   */
  sliceStream: (token: Pick<Token, 'end' | 'start'>) => Array<Chunk>

  /**
   * Write a slice of chunks.
   *
   * The eof code (`null`) can be used to signal the end of the stream.
   *
   * @param slice
   *   Chunks.
   * @returns
   *   Events.
   */
  write: (slice: Array<Chunk>) => Array<Event>
}

/**
 * Encodings supported by `TextEncoder`.
 *
 * Arbitrary encodings can be supported depending on how the engine is built.
 * So any string *could* be valid.
 * But you probably want `utf-8`.
 */
export type Encoding =
  // Encodings supported in Node by default or when built with the small-icu option.
  // Does not include aliases.
  | 'utf-8' // Always supported in Node.
  | 'utf-16le' // Always supported in Node.
  | 'utf-16be' // Not supported when ICU is disabled.
  // Everything else (depends on browser, or full ICU data).
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {})

/**
 * Contents of the file.
 *
 * Can either be text, or a `Uint8Array` like structure.
 */
export type Value = Uint8Array | string

/**
 * A syntax extension changes how markdown is tokenized.
 *
 * See: <https://github.com/micromark/micromark#syntaxextension>
 */
export type Extension = any

/**
 * A filtered, combined, extension.
 */
export type NormalizedExtension = any

/**
 * A full, filtereed, normalized, extension.
 */
export type FullNormalizedExtension = any

/**
 * Create a context.
 *
 * @param from
 *   Where to create from.
 * @returns
 *   Context.
 */
export type Create = any

/**
 * Config defining how to parse.
 */
export type ParseOptions = any

/**
 * A context object that helps w/ parsing markdown.
 */
export type ParseContext = any

/**
 * HTML compiler context.
 */
export type CompileContext = any

/**
 * Serialize micromark events as HTML.
 */
export type Compile = any

/**
 * Handle one token.
 *
 * @param token
 *   Token.
 * @returns
 *   Nothing.
 */
export type Handle = any

/**
 * Handle the whole document.
 *
 * @returns
 *   Nothing.
 */
export type DocumentHandle = any

/**
 * Token types mapping to handles.
 */
export type Handles = any

/**
 * Normalized extenion.
 */
export type HtmlExtension = any

/**
 * An HTML extension changes how markdown tokens are serialized.
 */
export type NormalizedHtmlExtension = any

/**
 * Definition.
 */
export type Definition = any

/**
 * State tracked to compile events as HTML.
 */
export type CompileData = any

/**
 * Type of line ending in markdown.
 */
export type LineEnding = '\r' | '\n' | '\r\n'

/**
 * Compile options.
 */
export type CompileOptions = any

/**
 * Configuration.
 */
export type Options = CompileOptions & ParseOptions

/**
 * Enum of allowed token types.
 */
export type TokenType = keyof TokenTypeMap

// Note: when changing the next interface, you likely also have to change
// `micromark-util-symbol`.
/**
 * Map of allowed token types.
 */
export interface TokenTypeMap {
  // Note: these are compiled away.
  attentionSequence: 'attentionSequence' // To do: remove.
  space: 'space' // To do: remove.

  data: 'data'
  whitespace: 'whitespace'
  lineEnding: 'lineEnding'
  lineEndingBlank: 'lineEndingBlank'
  linePrefix: 'linePrefix'
  lineSuffix: 'lineSuffix'
  atxHeading: 'atxHeading'
  atxHeadingSequence: 'atxHeadingSequence'
  atxHeadingText: 'atxHeadingText'
  autolink: 'autolink'
  autolinkEmail: 'autolinkEmail'
  autolinkMarker: 'autolinkMarker'
  autolinkProtocol: 'autolinkProtocol'
  characterEscape: 'characterEscape'
  characterEscapeValue: 'characterEscapeValue'
  characterReference: 'characterReference'
  characterReferenceMarker: 'characterReferenceMarker'
  characterReferenceMarkerNumeric: 'characterReferenceMarkerNumeric'
  characterReferenceMarkerHexadecimal: 'characterReferenceMarkerHexadecimal'
  characterReferenceValue: 'characterReferenceValue'
  codeFenced: 'codeFenced'
  codeFencedFence: 'codeFencedFence'
  codeFencedFenceSequence: 'codeFencedFenceSequence'
  codeFencedFenceInfo: 'codeFencedFenceInfo'
  codeFencedFenceMeta: 'codeFencedFenceMeta'
  codeFlowValue: 'codeFlowValue'
  codeIndented: 'codeIndented'
  codeText: 'codeText'
  codeTextData: 'codeTextData'
  codeTextPadding: 'codeTextPadding'
  codeTextSequence: 'codeTextSequence'
  content: 'content'
  definition: 'definition'
  definitionDestination: 'definitionDestination'
  definitionDestinationLiteral: 'definitionDestinationLiteral'
  definitionDestinationLiteralMarker: 'definitionDestinationLiteralMarker'
  definitionDestinationRaw: 'definitionDestinationRaw'
  definitionDestinationString: 'definitionDestinationString'
  definitionLabel: 'definitionLabel'
  definitionLabelMarker: 'definitionLabelMarker'
  definitionLabelString: 'definitionLabelString'
  definitionMarker: 'definitionMarker'
  definitionTitle: 'definitionTitle'
  definitionTitleMarker: 'definitionTitleMarker'
  definitionTitleString: 'definitionTitleString'
  emphasis: 'emphasis'
  emphasisSequence: 'emphasisSequence'
  emphasisText: 'emphasisText'
  escapeMarker: 'escapeMarker'
  hardBreakEscape: 'hardBreakEscape'
  hardBreakTrailing: 'hardBreakTrailing'
  htmlFlow: 'htmlFlow'
  htmlFlowData: 'htmlFlowData'
  htmlText: 'htmlText'
  htmlTextData: 'htmlTextData'
  image: 'image'
  label: 'label'
  labelText: 'labelText'
  labelLink: 'labelLink'
  labelImage: 'labelImage'
  labelMarker: 'labelMarker'
  labelImageMarker: 'labelImageMarker'
  labelEnd: 'labelEnd'
  link: 'link'
  paragraph: 'paragraph'
  reference: 'reference'
  referenceMarker: 'referenceMarker'
  referenceString: 'referenceString'
  resource: 'resource'
  resourceDestination: 'resourceDestination'
  resourceDestinationLiteral: 'resourceDestinationLiteral'
  resourceDestinationLiteralMarker: 'resourceDestinationLiteralMarker'
  resourceDestinationRaw: 'resourceDestinationRaw'
  resourceDestinationString: 'resourceDestinationString'
  resourceMarker: 'resourceMarker'
  resourceTitle: 'resourceTitle'
  resourceTitleMarker: 'resourceTitleMarker'
  resourceTitleString: 'resourceTitleString'
  setextHeading: 'setextHeading'
  setextHeadingText: 'setextHeadingText'
  setextHeadingLine: 'setextHeadingLine'
  setextHeadingLineSequence: 'setextHeadingLineSequence'
  strong: 'strong'
  strongSequence: 'strongSequence'
  strongText: 'strongText'
  thematicBreak: 'thematicBreak'
  thematicBreakSequence: 'thematicBreakSequence'
  blockQuote: 'blockQuote'
  blockQuotePrefix: 'blockQuotePrefix'
  blockQuoteMarker: 'blockQuoteMarker'
  blockQuotePrefixWhitespace: 'blockQuotePrefixWhitespace'
  listOrdered: 'listOrdered'
  listUnordered: 'listUnordered'
  listItemIndent: 'listItemIndent'
  listItemMarker: 'listItemMarker'
  listItemPrefix: 'listItemPrefix'
  listItemPrefixWhitespace: 'listItemPrefixWhitespace'
  listItemValue: 'listItemValue'
  chunkDocument: 'chunkDocument'
  chunkContent: 'chunkContent'
  chunkFlow: 'chunkFlow'
  chunkText: 'chunkText'
  chunkString: 'chunkString'
}
