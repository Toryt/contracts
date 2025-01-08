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

// eslint-disable-next-line no-new-func
const getGlobal = new Function('return this;')
export const global: object = getGlobal()

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
    { subject: [Symbol('abcdefghijklmnopqrstuvwxyz'), true, 4, '', 'abc', Math], expected: 'array' }
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
    { subject: Symbol('abcdefghijklmnopqrstuvwxyz'), expected: 'symbol', isPrimitive: false }
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
