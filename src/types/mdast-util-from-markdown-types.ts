// mdast-util-from-markdown's lib/types.d.ts, which nts.json names under `types`, with its interfaces written as object
// types: the compile context is an object that the compiler writes out and copies for each event, so it is a record
// whose members have types rather than a class, and its functions are called as what they are rather than by name
import type {Nodes, Parent, PhrasingContent, Root} from '../../prettier/node_modules/@types/mdast/index.js'
import type {ParseOptions, Token} from './micromark-util-types.js'

export type CompileContext = {
  config: Config
  data: CompileData
  stack: Array<Fragment | Nodes>
  tokenStack: Array<TokenTuple>
  buffer: (this: CompileContext) => undefined
  enter: (
    this: CompileContext,
    node: Nodes,
    token: Token,
    onError?: OnEnterError | null | undefined
  ) => undefined
  exit: (this: CompileContext, token: Token, onError?: OnExitError | null | undefined) => undefined
  resume: (this: CompileContext) => string
  sliceSerialize: (token: Pick<Token, 'end' | 'start'>, expandTabs?: boolean | undefined) => string
}

export type CompileData = {
  atHardBreak?: boolean | undefined
  characterReferenceType?:
    | 'characterReferenceMarkerHexadecimal'
    | 'characterReferenceMarkerNumeric'
    | undefined
  expectingFirstListItemValue?: boolean | undefined
  flowCodeInside?: boolean | undefined
  inReference?: boolean | undefined
  setextHeadingSlurpLineEnding?: boolean | undefined
  referenceType?: 'collapsed' | 'full' | undefined
}

export type Config = {
  canContainEols: Array<string>
  enter: Handles
  exit: Handles
  transforms: Array<Transform>
}

export type Extension = {
  canContainEols?: Array<string> | null | undefined
  enter?: Handles | null | undefined
  exit?: Handles | null | undefined
  transforms?: Array<Transform> | null | undefined
}

export type Fragment = Parent & {
  type: 'fragment'
  children: Array<PhrasingContent>
}

export type Handles = Record<string, Handle>

// a handler is called on the compile context with `call`, which a function of C# is not, so it is held as anything
export type Handle = any

// called on the compile context with `call` as handlers are
export type OnEnterError = any

export type OnExitError = any

export type Options = ParseOptions & {
  mdastExtensions?: Array<Extension | Array<Extension>> | null | undefined
}

// a token and what is done when it is not closed, which the compiler creates and reads as an array
export type TokenTuple = any

export type Transform = (tree: Root) => Root | null | undefined | void
