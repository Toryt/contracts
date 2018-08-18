export interface Valuable {
  valueOf(): any
}

export type VoidAssert = () => void
export type Comparable = Number | string | Valuable
export type AnyAssert = (expected: any | null | undefined) => void
export type FunctionAssert = (expected: Function | null | undefined) => void
export type ComparableAssert = (expected: Comparable) => void
export type StringAssert = (expected: string) => void
export type StringValueAssert = (expected: string, value?: any) => void
export type ObjectAssert = (expected: object) => void
export type StringArrayAssert = (expected: string[]) => void
export type ErrorAssert = (
  constructor?: Function,
  expected?: string | RegExp | Function
) => void

export interface Must2 {
  a: FunctionAssert & this
  above: ComparableAssert
  after: ComparableAssert
  an: FunctionAssert & this
  array: VoidAssert
  at: this
  be: AnyAssert & this
  before: ComparableAssert
  below: ComparableAssert
  between(begin: Comparable, end: Comparable): void
  boolean: VoidAssert
  contain: AnyAssert
  date: VoidAssert
  empty: VoidAssert
  endWith: StringAssert
  enumerable: StringAssert
  enumerableProperty: StringAssert
  eql: AnyAssert
  equal: AnyAssert
  error: ErrorAssert
  eventually: this
  exist: VoidAssert
  false: VoidAssert
  falsy: VoidAssert
  function: VoidAssert
  frozen: VoidAssert
  gt: ComparableAssert
  gte: ComparableAssert
  have: this
  include: AnyAssert
  instanceof: FunctionAssert
  instanceOf: FunctionAssert
  is: AnyAssert
  keys: StringArrayAssert
  least: ComparableAssert
  length(expected: number): void
  lt: ComparableAssert
  lte: ComparableAssert
  match(regexp: RegExp | string): void
  most: ComparableAssert
  nan: VoidAssert
  // noinspection SpellCheckingInspection
  nonenumerable: StringAssert
  // noinspection SpellCheckingInspection
  nonenumerableProperty: StringAssert
  not: this
  null: VoidAssert
  number: VoidAssert
  object: VoidAssert
  own: StringValueAssert
  ownKeys: StringArrayAssert
  ownProperties: ObjectAssert
  ownProperty: StringValueAssert
  permutationOf(expected: any[]): void
  properties: ObjectAssert
  property: StringValueAssert
  regexp: VoidAssert
  reject: this
  resolve: this
  startWith: StringAssert
  string: VoidAssert
  symbol: VoidAssert
  the: this
  then: this
  throw: ErrorAssert
  to: this
  true: VoidAssert
  truthy: VoidAssert
  undefined: VoidAssert
  with: this
}

// noinspection FunctionNamingConventionJS
declare function must(actual: any | null | undefined, message?: string): Must2

declare global {
  interface Object {
    must: Must
  }
}

export default must
