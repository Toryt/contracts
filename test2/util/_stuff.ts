/*
  Copyright 2015–2025 Jan Dockx

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

const getGlobal = new Function('return this;')
export const global: object = getGlobal()

export type Primitive = undefined | string | number | boolean | symbol | bigint // according to `typeof`, `null` is an `object`
export type PrimitiveOrNull = Primitive | null

export interface StuffWrapper2<T extends PrimitiveOrNull = PrimitiveOrNull> {
  subject: T
  description: string
  primitive: boolean
  mutable: boolean
}

function buildPrimitiveStuff(): StuffWrapper2<Primitive>[] {
  const base: Omit<StuffWrapper2<Primitive>, 'primitive' | 'mutable'>[] = [
    { subject: undefined, description: 'undefined' },
    { subject: 'abc', description: 'string' },
    { subject: '', description: 'empty string' },
    { subject: 0, description: 'zero (0)' },
    { subject: 1, description: 'one (1)' },
    { subject: -1, description: 'minus one (-1)' },
    { subject: 4, description: 'natural' },
    { subject: -456, description: 'negative integer' },
    { subject: Math.PI, description: 'positive float' },
    { subject: -Math.E, description: 'negative float' },
    { subject: 0.1, description: 'non-decimal float' },
    { subject: Number.POSITIVE_INFINITY, description: 'positive infinity' },
    { subject: Number.NEGATIVE_INFINITY, description: 'negative infinity' },
    { subject: Number.MAX_SAFE_INTEGER, description: 'max safe integer' },
    { subject: Number.MIN_SAFE_INTEGER, description: 'min safe integer' },
    { subject: Number.MAX_VALUE, description: 'max number' },
    { subject: Number.MIN_VALUE, description: 'min number' },
    { subject: Number.EPSILON, description: 'epsilon' },
    { subject: Number.NaN, description: 'NaN' },
    { subject: false, description: 'false' },
    { subject: true, description: 'true' },
    { subject: Symbol('isolated symbol as stuff'), description: 'symbol' },
    { subject: 0n, description: 'zero bigint (0n)' },
    { subject: 1n, description: 'one bigint (1n)' },
    { subject: -1n, description: 'minus one bigint (-1n)' },
    { subject: 123456789012345678901234567890n, description: 'large positive bigint' },
    { subject: -123456789012345678901234567890n, description: 'large negative bigint' },
    { subject: BigInt(Number.MAX_SAFE_INTEGER), description: 'bigint equivalent of max safe integer' },
    { subject: BigInt(Number.MIN_SAFE_INTEGER), description: 'bigint equivalent of min safe integer' }
  ]

  return base.map(s => ({ ...s, primitive: true, mutable: false }))
}

export const primitiveStuff: StuffWrapper2<Primitive>[] = buildPrimitiveStuff()

export const primitiveAndNullStuff: StuffWrapper2[] = [
  {
    subject: null,
    description: 'null',
    primitive: false,
    mutable: false
  },
  ...primitiveStuff
]

export interface StuffGeneratorWrapper<T extends unknown = unknown> {
  generate: () => T
  description: string
  primitive: boolean
  mutable: boolean
}

export function buildMutableStuffGenerators(): StuffGeneratorWrapper<object>[] {
  const base: Omit<StuffGeneratorWrapper<object>, 'primitive' | 'mutable'>[] = [
    { generate: (): Error => new Error('This is an error case'), description: 'Error' },
    { generate: (): Date => new Date(2025, 0, 11, 14, 11, 48, 857), description: 'Date' },
    { generate: (): RegExp => /foo/, description: 'RegExp' },
    {
      generate: (): (() => string) =>
        function (): string {
          return `an anonymous function`
        },
      description: 'anonymous function'
    },
    {
      generate: (): (() => string) =>
        function namedFunction(): string {
          return `a named function`
        },
      description: 'named function'
    },
    { generate: (): (() => string) => (): string => `an arrow function`, description: 'arrow function' },
    {
      generate: (): (() => string) => {
        const arrowFunction = (): string => `an arrow function in a const`
        return arrowFunction
      },
      description: 'arrow function in a const'
    },
    {
      generate: (): (() => Promise<string>) =>
        async function (): Promise<string> {
          return `an anonymous async function`
        },
      description: 'anonymous async function'
    },
    {
      generate: (): (() => Promise<string>) =>
        async function asyncNamedFunction(): Promise<string> {
          return `an async named function`
        },
      description: 'async named function'
    },
    {
      generate: (): (() => Promise<string>) => async (): Promise<string> => `an async arrow function`,
      description: 'async arrow function'
    },
    {
      generate: (): (() => Promise<string>) => {
        const asyncArrowFunction = async (): Promise<string> => `an async arrow function in a const`
        return asyncArrowFunction
      },
      description: 'async arrow function in a const'
    },
    // eslint-disable-next-line no-new-wrappers
    { generate: (): Number => new Number(42), description: 'Number' },
    // eslint-disable-next-line no-new-wrappers
    { generate: (): Boolean => new Boolean(false), description: 'Boolean' },
    // eslint-disable-next-line no-new-wrappers
    { generate: (): String => new String('string wrapper object'), description: 'String' },
    { generate: (): IArguments => arguments, description: 'arguments object' },
    { generate: (): {} => ({}), description: 'empty object' },
    {
      generate: (): {
        a: number
        b: string
        c: {}
        d: { d1: undefined; d2: string; d3: { d31: number } }
        e: unknown[]
      } => ({
        a: 1,
        b: 'b',
        c: {},
        d: { d1: undefined, d2: 'd2', d3: { d31: 31 } },
        e: [5, 'c', true]
      }),
      description: 'complex object'
    },
    { generate: (): [] => [], description: 'empty array' }
    // MUDO add circular stuff
  ]

  const arrayWithAllInIt: StuffGeneratorWrapper<Array<unknown>> = {
    generate: () => [...primitiveAndNullStuff, base.map(({ generate }) => generate())],
    description: ' complex array',
    primitive: false,
    mutable: true
  }

  return [...base.map(sg => ({ ...sg, primitive: false, mutable: true })), arrayWithAllInIt]
}

export const mutableStuffGenerators: StuffGeneratorWrapper<object>[] = buildMutableStuffGenerators()
export const stuffGenerators: StuffGeneratorWrapper[] = [
  ...primitiveAndNullStuff.map(({ subject, description, primitive, mutable }) => ({
    generate: () => subject,
    description,
    primitive,
    mutable
  })),
  ...buildMutableStuffGenerators()
]

// MUDO replace the below, and cases in `testUtil` and `cases`, with the above

export type ExtendedType =
  | 'object'
  | 'array'
  | 'function'
  | 'error'
  | 'date'
  | 'regexp'
  | 'number'
  | 'string'
  | 'boolean'
  | 'arguments'
  | 'undefined'
  | 'null'
  | 'math'
  | 'json'
  | 'symbol'

export interface StuffWrapper<T extends unknown = unknown> {
  subject: T
  expected: ExtendedType
  isPrimitive: boolean
}

export function generateMutableStuff(): Array<StuffWrapper<object>> {
  // noinspection JSPrimitiveTypeWrapperUsage,SpellCheckingInspection
  const base: Array<Omit<StuffWrapper<object>, 'isPrimitive'>> = [
    { subject: { a: 4 }, expected: 'object' },
    { subject: [1, 2, 3], expected: 'array' },
    { subject: function (): void {}, expected: 'function' },
    { subject: () => 0, expected: 'function' },
    { subject: new ReferenceError(), expected: 'error' },
    { subject: new Date(), expected: 'date' },
    { subject: /a-z/, expected: 'regexp' },
    // eslint-disable-next-line no-new-wrappers
    { subject: new Number(4), expected: 'number' },
    // eslint-disable-next-line no-new-wrappers
    { subject: new String('abc'), expected: 'string' },
    // eslint-disable-next-line no-new-wrappers
    { subject: new String(''), expected: 'string' },
    // eslint-disable-next-line no-new-wrappers
    { subject: new Boolean(true), expected: 'boolean' },
    { subject: arguments, expected: 'arguments' },
    // eslint-disable-next-line no-secrets/no-secrets
    { subject: [Symbol('symbol in array'), true, 4, '', 'abc', Math], expected: 'array' }
  ]

  const result = base.map(
    (r: Omit<StuffWrapper<object>, 'isPrimitive'>): StuffWrapper<object> => ({
      ...r,
      isPrimitive: false
    })
  )
  return result
}

export function generateStuff(): Array<StuffWrapper> {
  const base: Array<StuffWrapper> = [
    { subject: undefined, expected: 'undefined', isPrimitive: false },
    { subject: null, expected: 'null', isPrimitive: false },
    { subject: Math, expected: 'math', isPrimitive: false },
    { subject: JSON, expected: 'json', isPrimitive: false },
    { subject: 'abc', expected: 'string', isPrimitive: true },
    { subject: '', expected: 'string', isPrimitive: true },
    { subject: 4, expected: 'number', isPrimitive: true },
    { subject: false, expected: 'boolean', isPrimitive: true },
    // eslint-disable-next-line no-secrets/no-secrets
    { subject: Symbol('isolated symbol'), expected: 'symbol', isPrimitive: false }
  ]
  return base.concat(generateMutableStuff())
}

const instanceofConstructors = [
  // Core constructors
  Object,
  Function,
  Boolean,
  Symbol,
  Number,
  BigInt,
  String,
  RegExp,
  Date,
  Error,

  // Error Subclasses
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,

  // Collections
  Array,
  Map,
  Set,
  WeakMap,
  WeakSet,

  // Typed Arrays
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  BigInt64Array,
  BigUint64Array,

  // Buffers
  ArrayBuffer,
  SharedArrayBuffer,
  DataView,

  // Control abstractions
  Promise,
  Proxy,

  // WebAssembly
  WebAssembly.Module,
  WebAssembly.Instance,
  WebAssembly.Memory,
  WebAssembly.Table,
  WebAssembly.CompileError,
  WebAssembly.LinkError,
  WebAssembly.RuntimeError,

  // Internationalization
  Intl.Collator,
  Intl.DateTimeFormat,
  Intl.ListFormat,
  Intl.Locale,
  Intl.NumberFormat,
  Intl.PluralRules,
  Intl.RelativeTimeFormat,
  Intl.Segmenter,
  Intl.DisplayNames
]

const possibleResultsOfTypeof = ['undefined', 'object', 'boolean', 'number', 'bigint', 'string', 'symbol', 'function']

export const types: (string | Function)[] = [...possibleResultsOfTypeof, ...instanceofConstructors]
