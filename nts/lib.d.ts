type int = number & {};
declare namespace sys {
    function readTextFileSync(path: string): string;
    function writeTextFileSync(path: string, text: string): void;
    function args(): string[];
    function readStdinText(): string;
    function readStdinLine(): string | undefined;
    function readStdinTextOf(byteCount: int): string;
    function byteLength(text: string): int;
    function writeStdout(text: string): void;
    function exit(code: int): void;
    function delay(milliseconds: int): Promise<void>;
    function settle(nextSize?: number): void;
}
declare namespace process {
    const env: Record<string, string | undefined>;
    function cwd(): string;
    const emitWarning: undefined;
}
declare namespace Intl {
    class ListFormat {
        constructor(locale: string, options?: {
            type?: string;
        });
        format(list: string[]): string;
    }
}
declare namespace console {
    function log(...values: unknown[]): void;
    function warn(...values: unknown[]): void;
    function error(...values: unknown[]): void;
}
declare namespace Math {
    const PI: number;
    const E: number;
    const LN2: number;
    const LN10: number;
    const LOG2E: number;
    const LOG10E: number;
    const SQRT2: number;
    const SQRT1_2: number;
    function floor(value: number): number;
    function ceil(value: number): number;
    function trunc(value: number): number;
    function round(value: number): number;
    function sqrt(value: number): number;
    function pow(value: number, exponent: number): number;
    function random(): number;
    function abs(value: number): number;
    function min(...values: number[]): number;
    function max(...values: number[]): number;
    function sign(value: number): number;
    function imul(a: number, b: number): number;
    function log(value: number): number;
    function log2(value: number): number;
    function log10(value: number): number;
    function exp(value: number): number;
    function expm1(value: number): number;
    function log1p(value: number): number;
    function cbrt(value: number): number;
    function hypot(...values: number[]): number;
    function sin(value: number): number;
    function cos(value: number): number;
    function tan(value: number): number;
    function asin(value: number): number;
    function acos(value: number): number;
    function atan(value: number): number;
    function atan2(y: number, x: number): number;
    function sinh(value: number): number;
    function cosh(value: number): number;
    function tanh(value: number): number;
    function asinh(value: number): number;
    function acosh(value: number): number;
    function atanh(value: number): number;
    function clz32(value: number): number;
    function fround(value: number): number;
}
declare class Date {
    static now(): number;
}
declare class Error {
    constructor(message?: string, options?: {
        cause?: unknown;
    });
    readonly message: string;
}
declare class TypeError extends Error {
}
declare class RangeError extends Error {
}
declare class SyntaxError extends Error {
}
declare class ReferenceError extends Error {
}
declare class URIError extends Error {
}
declare function parallel<TIn, TResult>(values: TIn[], withValue: (value: TIn) => TResult): TResult[];
declare function parseInt(text: string, radix?: number): number;
declare function parseFloat(text: string): number;
declare function isNaN(value: number): boolean;
declare function isFinite(value: number): boolean;
declare function decodeURIComponent(text: string): string;
declare function encodeURIComponent(text: string): string;
declare const Infinity: number;
declare const NaN: number;
declare function BigInt(value: unknown): any;
declare function setTimeout(callback: () => void, delay?: number): number;
declare function atob(data: string): string;
declare function btoa(data: string): string;
declare function structuredClone<T>(value: T): T;
declare function String(value?: unknown): string;
declare namespace String {
    function fromCharCode(...codes: number[]): string;
    function fromCodePoint(...codes: number[]): string;
    function raw(strings: string[], ...values: unknown[]): string;
}
declare function Number(value: unknown): number;
declare namespace Number {
    const MAX_SAFE_INTEGER: number;
    const MAX_VALUE: number;
    const MIN_VALUE: number;
    const EPSILON: number;
    const MIN_SAFE_INTEGER: number;
    const POSITIVE_INFINITY: number;
    const NEGATIVE_INFINITY: number;
    const NaN: number;
    function isNaN(value: number): boolean;
    function isFinite(value: number): boolean;
    function isInteger(value: number): boolean;
    function isSafeInteger(value: unknown): boolean;
    function parseInt(text: string, radix?: number): number;
    function parseFloat(text: string): number;
}
declare function Boolean(value: unknown): boolean;
declare namespace JSON {
    function stringify(value: unknown): string;
    function parse(text: string): unknown;
}
interface StringView {
    readonly length: int;
    charCodeAt(index: int): number;
    charAt(index: int): string;
    slice(start: int): StringView;
    slice(start: int, end: int): string;
    indexOf(search: string, position?: int): int;
    match(regex: RegExp): RegExpMatchArray | null;
    toString(): string;
}
interface String {
    readonly length: int;
    [Symbol.iterator](): IterableIterator<string>;
    readonly [index: number]: string;
    charCodeAt(index: int): int;
    charAt(index: int): string;
    at(index: int): string | undefined;
    codePointAt(index: int): int;
    localeCompare(other: string): int;
    toString(): string;
    slice(start?: int, end?: int): string;
    substring(start: int, end?: int): string;
    substr(start: int, length?: int): string;
    indexOf(search: string, position?: int): int;
    lastIndexOf(search: string, position?: number): int;
    includes(search: string, position?: number): boolean;
    startsWith(search: string, position?: number): boolean;
    endsWith(search: string, endPosition?: number): boolean;
    repeat(count: int): string;
    split(separator: string | RegExp, limit?: number): string[];
    match(regex: RegExp): RegExpMatchArray | null;
    matchAll(regex: RegExp): Iterable<RegExpMatchArray>;
    search(regex: RegExp): int;
    replace(search: string | RegExp, replacement: string): string;
    replace(search: RegExp, replacer: (match: string, group1: string, group2: string) => string): string;
    trim(): string;
    trimStart(): string;
    trimEnd(): string;
    isWellFormed(): boolean;
    toWellFormed(): string;
    toUpperCase(): string;
    toLowerCase(): string;
    toLocaleUpperCase(): string;
    toLocaleLowerCase(): string;
    padStart(length: int, fill?: string): string;
    padEnd(length: int, fill?: string): string;
    replaceAll(search: string | RegExp, replacement: string): string;
    replaceAll(search: RegExp, replacer: (match: string, group1: string, group2: string) => string): string;
}
interface Array<T> {
    [n: number]: T;
    length: int;
    pop(): T | undefined;
    push(...items: T[]): int;
    shift(): T | undefined;
    unshift(...items: T[]): int;
    slice(start?: int, end?: int): T[];
    concat(other: T[]): T[];
    join(separator?: string): string;
    indexOf(item: T, fromIndex?: int): int;
    includes(item: T, fromIndex?: int): boolean;
    reverse(): T[];
    toReversed(): T[];
    toSorted(compare?: (a: T, b: T) => number): T[];
    toSpliced(start: int, deleteCount?: int, ...items: T[]): T[];
    with(index: int, value: T): T[];
    map<U>(callbackfn: (value: T, index: int) => U): U[];
    filter(predicate: (value: T, index: int) => boolean): T[];
    forEach(callbackfn: (value: T, index: int) => void): void;
    some(predicate: (value: T, index: int) => boolean): boolean;
    every(predicate: (value: T, index: int) => boolean): boolean;
    at(index: int): T | undefined;
    lastIndexOf(item: T, fromIndex?: int): int;
    find(predicate: (value: T) => boolean): T | undefined;
    findLast(predicate: (value: T) => boolean): T | undefined;
    findIndex(predicate: (value: T) => boolean): int;
    findLastIndex(predicate: (value: T) => boolean): int;
    flatMap<U>(callbackfn: (value: T, index: int) => U[]): U[];
    flat<U>(this: U[][]): U[];
    reduce(callbackfn: (previous: T, current: T) => T): T;
    reduce<U>(callbackfn: (previous: U, current: T, index: int) => U, initial: U): U;
    reduceRight(callbackfn: (previous: T, current: T) => T): T;
    reduceRight<U>(callbackfn: (previous: U, current: T, index: int) => U, initial: U): U;
    sort(compare?: (a: T, b: T) => number): T[];
    fill(value: T, start?: int, end?: int): T[];
    splice(start?: int, deleteCount?: int, ...items: T[]): T[];
    entries(): Iterable<[
        int,
        T
    ]>;
    keys(): Iterable<int>;
    values(): Iterable<T>;
    [Symbol.iterator](): IterableIterator<T>;
}
interface ReadonlyArray<T> {
    readonly [n: number]: T;
    readonly length: int;
    slice(start?: int, end?: int): T[];
    concat(other: readonly T[]): T[];
    join(separator?: string): string;
    indexOf(item: T, fromIndex?: int): int;
    lastIndexOf(item: T, fromIndex?: int): int;
    includes(item: T, fromIndex?: int): boolean;
    toReversed(): T[];
    map<U>(callbackfn: (value: T, index: int) => U): U[];
    filter(predicate: (value: T, index: int) => boolean): T[];
    forEach(callbackfn: (value: T, index: int) => void): void;
    some(predicate: (value: T, index: int) => boolean): boolean;
    every(predicate: (value: T, index: int) => boolean): boolean;
    at(index: int): T | undefined;
    find(predicate: (value: T) => boolean): T | undefined;
    findLast(predicate: (value: T) => boolean): T | undefined;
    findIndex(predicate: (value: T) => boolean): int;
    findLastIndex(predicate: (value: T) => boolean): int;
    flatMap<U>(callbackfn: (value: T, index: int) => U[]): U[];
    reduce<U>(callbackfn: (previous: U, current: T, index: int) => U, initial: U): U;
    [Symbol.iterator](): IterableIterator<T>;
}
type Record<K extends string | number, T> = {
    [P in K]: T;
};
type PropertyKey = string | number | symbol;
type Partial<T> = {
    [P in keyof T]?: T[P];
};
type Required<T> = {
    [P in keyof T]-?: T[P];
};
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type Omit<T, K extends PropertyKey> = Pick<T, Exclude<keyof T, K>>;
type NonNullable<T> = T & {};
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;
interface ObjectConstructor {
    readonly prototype: Object;
    keys(value: object): string[];
    values<T>(value: Record<string, T>): T[];
    values(value: object): unknown[];
    entries<T>(value: Record<string, T>): [
        string,
        T
    ][];
    entries(value: object): [
        string,
        unknown
    ][];
    hasOwn(value: object, key: string): boolean;
    getOwnPropertySymbols(value: object): symbol[];
    assign<T>(target: Record<string, T>, ...sources: Record<string, T>[]): Record<string, T>;
    assign<T extends object>(target: T, ...sources: unknown[]): T;
    fromEntries<T>(entries: Iterable<[
        string,
        T
    ]> | [
        string,
        T
    ][]): Record<string, T>;
    create(prototype: unknown, descriptors?: any): any;
    setPrototypeOf(target: unknown, prototype: unknown): any;
    defineProperty(target: unknown, key: unknown, descriptor: any): any;
    defineProperties(target: unknown, descriptors: any): any;
    freeze<T>(value: T): T;
    getPrototypeOf(value: unknown): any;
}
declare var Object: ObjectConstructor;
interface ArrayConstructor {
    readonly prototype: any[];
    isArray(value: unknown): value is unknown[];
    from<T>(values: Iterable<T> | T[]): T[];
    from<T, TResult>(values: Iterable<T> | T[], map: (value: T, index: int) => TResult): TResult[];
    from(arrayLike: {
        readonly length: number;
    }): undefined[];
    from<TResult>(arrayLike: {
        readonly length: number;
    }, map: (value: undefined, index: int) => TResult): TResult[];
}
declare var Array: ArrayConstructor;
interface Uint32Array {
    readonly length: int;
    [index: number]: number;
}
interface Uint32ArrayConstructor {
    new (length: number): Uint32Array;
}
declare var Uint32Array: Uint32ArrayConstructor;
interface Int32Array {
    readonly length: int;
    [index: number]: number;
}
interface Int32ArrayConstructor {
    new (length: number): Int32Array;
}
declare var Int32Array: Int32ArrayConstructor;
interface Uint8Array {
    readonly length: int;
    [index: number]: number;
    reduce<U>(callback: (previous: U, value: number, index: int) => U, initial: U): U;
}
interface Uint8ArrayConstructor {
    new (length: number): Uint8Array;
    from(values: string | number[], map: (value: any, index: int) => number): Uint8Array;
}
declare class TextEncoder {
    encode(input?: string): Uint8Array;
}
declare class TextDecoder {
    constructor(label?: string);
    decode(input?: Uint8Array): string;
}
declare var Uint8Array: Uint8ArrayConstructor;
interface Float64Array {
    readonly length: int;
    [index: number]: number;
}
interface Float64ArrayConstructor {
    new (length: number): Float64Array;
}
declare var Float64Array: Float64ArrayConstructor;
interface Map<K, V> {
    readonly size: int;
    get(key: K): V | undefined;
    set(key: K, value: V): Map<K, V>;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    forEach(callbackfn: (value: V, key: K) => void): void;
    entries(): Iterable<[
        K,
        V
    ]>;
    keys(): Iterable<K>;
    values(): Iterable<V>;
    [Symbol.iterator](): IterableIterator<[
        K,
        V
    ]>;
}
interface MapConstructor {
    new <K, V>(entries?: Iterable<[
        K,
        V
    ]> | [
        K,
        V
    ][]): Map<K, V>;
}
declare var Map: MapConstructor;
interface Set<T> {
    readonly size: int;
    add(value: T): Set<T>;
    has(value: T): boolean;
    delete(value: T): boolean;
    clear(): void;
    forEach(callbackfn: (value: T) => void): void;
    values(): Iterable<T>;
    [Symbol.iterator](): IterableIterator<T>;
}
interface SetConstructor {
    new <T>(values?: Iterable<T> | T[]): Set<T>;
}
declare var Set: SetConstructor;
interface WeakMap<K extends object, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): WeakMap<K, V>;
    has(key: K): boolean;
    delete(key: K): boolean;
}
interface WeakMapConstructor {
    new <K extends object, V>(): WeakMap<K, V>;
}
declare var WeakMap: WeakMapConstructor;
interface WeakSet<T extends object> {
    add(value: T): WeakSet<T>;
    has(value: T): boolean;
    delete(value: T): boolean;
}
interface WeakSetConstructor {
    new <T extends object>(): WeakSet<T>;
}
declare var WeakSet: WeakSetConstructor;
interface SymbolConstructor {
    (description?: string): symbol;
    for(key: string): symbol;
    readonly iterator: unique symbol;
    readonly toStringTag: unique symbol;
    readonly toPrimitive: unique symbol;
}
interface Symbol {
    readonly description: string | undefined;
    toString(): string;
}
declare var Symbol: SymbolConstructor;
interface IteratorYieldResult<TYield> {
    done?: false;
    value: TYield;
}
interface IteratorReturnResult<TReturn> {
    done: true;
    value: TReturn;
}
type IteratorResult<T, TReturn = any> = IteratorYieldResult<T> | IteratorReturnResult<TReturn>;
interface Iterator<T, TReturn = any, TNext = any> {
    next(value?: TNext): IteratorResult<T, TReturn>;
}
interface Iterable<T, TReturn = any, TNext = any> {
    [Symbol.iterator](): Iterator<T, TReturn, TNext>;
}
interface IterableIterator<T, TReturn = any, TNext = any> extends Iterator<T, TReturn, TNext> {
    [Symbol.iterator](): IterableIterator<T, TReturn, TNext>;
}
interface Generator<T = unknown, TReturn = any, TNext = any> extends IterableIterator<T, TReturn, TNext> {
    next(value?: TNext): IteratorResult<T, TReturn>;
    return(value: TReturn): IteratorResult<T, TReturn>;
    throw(error: any): IteratorResult<T, TReturn>;
    [Symbol.iterator](): Generator<T, TReturn, TNext>;
}
interface Promise<T> {
    then<U>(onFulfilled: (value: T) => U | Promise<U>): Promise<U>;
    catch(onRejected: (error: Error) => T): Promise<T>;
    finally(onFinally: () => void): Promise<T>;
}
interface PromiseLike<T> {
}
interface PromiseConstructor {
    new <T>(executor: (resolve: (value: T) => void, reject: (reason: Error) => void) => void): Promise<T>;
    resolve(): Promise<void>;
    resolve<T>(value: T): Promise<T>;
    all<T>(promises: Promise<T>[]): Promise<T[]>;
}
declare var Promise: PromiseConstructor;
interface TemplateStringsArray extends ReadonlyArray<string> {
}
interface Function {
}
interface CallableFunction extends Function {
    call<T, A extends unknown[], R>(this: (this: T, ...args: A) => R, thisArg: T, ...args: A): R;
    bind<T, A0, A extends unknown[], R>(this: (this: T, arg0: A0, ...args: A) => R, thisArg: T, arg0: A0): (...args: A) => R;
    bind<T, A extends unknown[], R>(this: (this: T, ...args: A) => R, thisArg: T): (...args: A) => R;
}
interface NewableFunction extends Function {
}
interface IArguments {
    readonly length: int;
    readonly [index: number]: unknown;
    [Symbol.iterator](): IterableIterator<unknown>;
}
interface Boolean {
    toString(): string;
}
interface Number {
    toString(radix?: int): string;
    toFixed(digits?: int): string;
    toExponential(digits?: int): string;
    toPrecision(precision?: int): string;
}
interface Object {
    toString(): string;
}
interface RegExp {
    readonly source: string;
    readonly flags: string;
    readonly global: boolean;
    readonly ignoreCase: boolean;
    readonly multiline: boolean;
    readonly sticky: boolean;
    lastIndex: int;
    test(text: unknown): boolean;
    exec(text: string): RegExpMatchArray | null;
    exec(text: StringView): RegExpMatchArray | null;
}
interface RegExpConstructor {
    new (pattern: string, flags?: string): RegExp;
}
declare var RegExp: RegExpConstructor;
interface RegExpMatchArray extends Array<string> {
    readonly index: int;
    readonly input: string;
    readonly groups: Record<string, string> | undefined;
}
