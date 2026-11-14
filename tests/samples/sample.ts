import type {Readable} from 'node:stream'
import {type A, B, type C as D} from "./types.ts"

/**
 * A  point in the plane.
 * @template T the kind of number
 */
export interface Point<T extends number = number> { x: T, y: T; readonly label?: string, [key: string]: unknown }

type Union = | 'a' | "b" | `c-${string}` | {kind: 'object', value: number} | readonly string[] | ((arg: number) => void)
type Mapped<T> = { readonly [K in keyof T]?: T[K] extends Function ? never : T[K] }
type Conditional<T> = T extends string ? 'string' : T extends number ? 'number' : T extends boolean ? 'boolean' : T extends undefined ? 'undefined' : 'object'
type LongFunction = (firstArgument: SomeLongTypeName, secondArgument: AnotherLongTypeName, ...rest: unknown[]) => Promise<void>

enum Color { Red = 'RED', Green = "GREEN", Blue = 1 << 2 }
declare module 'ambient' { export function f(a: number): string }
namespace NS.Inner { export const value = 1 }

abstract class Repository<TEntity extends {id: string}, TKey = string> implements Disposable, AsyncDisposable {
  private readonly items = new Map<TKey, TEntity>()
  protected abstract load(key: TKey): Promise<TEntity | undefined>
  constructor(private readonly name: string, public options?: Partial<Options>) {}
  @memoize() get size(): number { return this.items.size }
  async find<const T extends readonly unknown[]>(predicate: (entity: TEntity, index: number) => boolean, ...keys: T): Promise<TEntity[]> {
    const found = [...this.items.values()].filter(predicate) satisfies TEntity[]
    return found as unknown as TEntity[]
  }
  [Symbol.dispose](): void {}
  async [Symbol.asyncDispose]() {}
}

function overload(a: string): string
function overload(a: number): number
function overload(a: any) { return a! }

export const config = {
  retries: 3, 'time-out': 1000,
  handler: <T,>(value: T): value is NonNullable<T> => value != null,
} as const satisfies Record<string, unknown>

const assertion = <HTMLElement>document.getElementById('root')
let tuple: [first: string, second?: number, ...rest: boolean[]] = ['a']
let optional = object?.deeply?.nested?.[key]?.(argument) ?? defaultValue
for await (const chunk of stream as AsyncIterable<Readable>) using resource = acquire(chunk)
export = config
