// @types/mdast's index.d.ts, which src/nts.json names under `types`: mdast's nodes are objects that mdast-util-from-markdown
// and its extensions write out, and that prettier's markdown code copies and spreads, so every type of node is one
// object type, which nts compiles to a record whose members have types (a declaration file's interfaces are taken to
// be anything). The maps of content stay interfaces, as mdast-util-math adds to them.

export type AlignType = 'center' | 'left' | 'right' | null

export type ReferenceType = 'shortcut' | 'collapsed' | 'full'

/**
 * A place in the document, as unist says.
 */
export type Point = {
  line: number
  column: number
  offset?: number | undefined
}

/**
 * Where a node is in the document, as unist says.
 */
export type Position = {
  start: Point
  end: Point
}

/**
 * Any node of mdast, with what each kind of node may hold.
 */
export type MdastNode = {
  type: string
  value?: string
  children?: Array<MdastNode>
  position?: Position | undefined
  data?: any
  lang?: string | null | undefined
  meta?: string | null | undefined
  depth?: number
  ordered?: boolean | null | undefined
  start?: number | null | undefined
  spread?: boolean | null | undefined
  checked?: boolean | null | undefined
  url?: string
  title?: string | null | undefined
  alt?: string | null | undefined
  identifier?: string
  label?: string | null | undefined
  referenceType?: ReferenceType
  align?: Array<AlignType> | null | undefined
}

export type Alternative = MdastNode
export type Association = MdastNode
export type Reference = MdastNode
export type Resource = MdastNode
export type Data = any

export type BlockContent = MdastNode
export interface BlockContentMap {}
export type DefinitionContent = MdastNode
export interface DefinitionContentMap {}
export type FrontmatterContent = MdastNode
export interface FrontmatterContentMap {}
export type ListContent = MdastNode
export interface ListContentMap {}
export type PhrasingContent = MdastNode
export interface PhrasingContentMap {}
export type RootContent = MdastNode
export interface RootContentMap {}
export type RowContent = MdastNode
export interface RowContentMap {}
export type TableContent = MdastNode
export interface TableContentMap {}
export type Content = MdastNode
export type Literals = MdastNode
export type Nodes = MdastNode
export type Parents = MdastNode
export type TopLevelContent = MdastNode

export type Literal = MdastNode
export type Node = MdastNode
export type Parent = MdastNode
export type Blockquote = MdastNode
export type BlockquoteData = any
export type Break = MdastNode
export type BreakData = any
export type Code = MdastNode
export type CodeData = any
export type Definition = MdastNode
export type DefinitionData = any
export type Delete = MdastNode
export type DeleteData = any
export type Emphasis = MdastNode
export type EmphasisData = any
export type FootnoteDefinition = MdastNode
export type FootnoteDefinitionData = any
export type FootnoteReference = MdastNode
export type FootnoteReferenceData = any
export type Heading = MdastNode
export type HeadingData = any
export type Html = MdastNode
export type HtmlData = any
export type HTML = Html
export type Image = MdastNode
export type ImageData = any
export type ImageReference = MdastNode
export type ImageReferenceData = any
export type InlineCode = MdastNode
export type InlineCodeData = any
export type Link = MdastNode
export type LinkData = any
export type LinkReference = MdastNode
export type LinkReferenceData = any
export type List = MdastNode
export type ListData = any
export type ListItem = MdastNode
export type ListItemData = any
export type Paragraph = MdastNode
export type ParagraphData = any
export type Root = MdastNode
export type RootData = any
export type Strong = MdastNode
export type StrongData = any
export type Table = MdastNode
export type TableData = any
export type TableRow = MdastNode
export type TableRowData = any
export type TableCell = MdastNode
export type TableCellData = any
export type Text = MdastNode
export type TextData = any
export type ThematicBreak = MdastNode
export type ThematicBreakData = any
export type Yaml = MdastNode
export type YamlData = any
export type YAML = Yaml
