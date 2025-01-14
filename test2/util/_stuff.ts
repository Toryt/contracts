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

import type { Primitive } from '../../src/index.ts'

// eslint-disable-next-line no-new-func
const getGlobal = new Function('return this;')
export const global: object = getGlobal()

export type PrimitiveOrNull = Primitive | null
export type ImmutableSingleton =
  | typeof Math
  | typeof JSON
  | typeof Reflect
  | typeof Atomics
  | typeof Intl
  | typeof WebAssembly
export type Immutable = PrimitiveOrNull | ImmutableSingleton

export interface StuffWrapper<T extends Immutable = Immutable> {
  readonly subject: T
  readonly description: string
  readonly primitive: boolean
  readonly mutable: boolean
}

export const stringStuff: ReadonlyArray<StuffWrapper<string>> = [
  { subject: 'abc', description: 'string', primitive: true, mutable: false },
  { subject: '', description: 'empty string', primitive: true, mutable: false }
]

export const booleanStuff: ReadonlyArray<StuffWrapper<boolean>> = [
  { subject: false, description: 'false', primitive: true, mutable: false },
  { subject: true, description: 'true', primitive: true, mutable: false }
]

function buildNumberStuff(): ReadonlyArray<StuffWrapper<number>> {
  const base: Omit<StuffWrapper<number>, 'primitive' | 'mutable'>[] = [
    { subject: 1, description: 'one (1)' },
    { subject: -1, description: 'minus one (-1)' },
    { subject: 4, description: 'natural' },
    { subject: -456, description: 'negative integer' },
    { subject: Math.PI, description: 'positive float' },
    { subject: -Math.E, description: 'negative float' },
    { subject: 0.1, description: 'non-binary float' }, // 10 * 0.1 !== 1
    { subject: Number.POSITIVE_INFINITY, description: 'positive infinity' },
    { subject: Number.NEGATIVE_INFINITY, description: 'negative infinity' },
    { subject: Number.MAX_SAFE_INTEGER, description: 'max safe integer' },
    { subject: Number.MIN_SAFE_INTEGER, description: 'min safe integer' },
    { subject: Number.MAX_VALUE, description: 'max number' },
    { subject: Number.MIN_VALUE, description: 'min number' },
    { subject: Number.EPSILON, description: 'epsilon' },
    { subject: Number.NaN, description: 'NaN' }
  ]

  return base.map(s => ({ ...s, primitive: true, mutable: false }))
}

export const numberStuff: ReadonlyArray<StuffWrapper<Primitive>> = buildNumberStuff()

function buildBigIntStuff(): ReadonlyArray<StuffWrapper<bigint>> {
  const base: Omit<StuffWrapper<bigint>, 'primitive' | 'mutable'>[] = [
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

export const bigIntStuff: ReadonlyArray<StuffWrapper<Primitive>> = buildBigIntStuff()

export const primitiveStuff: ReadonlyArray<StuffWrapper<Primitive>> = [
  { subject: undefined, description: 'undefined', primitive: true, mutable: false },
  ...stringStuff,
  ...numberStuff,
  ...bigIntStuff,
  ...booleanStuff,
  { subject: Symbol('isolated symbol as stuff'), description: 'symbol', primitive: true, mutable: false }
]

export const primitiveAndNullStuff: ReadonlyArray<StuffWrapper<PrimitiveOrNull>> = [
  {
    subject: null,
    description: 'null',
    primitive: false,
    mutable: false
  },
  ...primitiveStuff
]

function buildImmutableSingletonStuff(): ReadonlyArray<StuffWrapper<ImmutableSingleton>> {
  // TODO: missing: `globalThis`
  const base: Omit<StuffWrapper<ImmutableSingleton>, 'primitive' | 'mutable'>[] = [
    { subject: Math, description: 'Math' },
    { subject: JSON, description: 'JSON' },
    { subject: Reflect, description: 'Reflect' },
    { subject: Atomics, description: 'Atomics' },
    { subject: Intl, description: 'Intl' },
    { subject: WebAssembly, description: 'WebAssembly' }
  ]

  return base.map(({ subject, description }) => ({
    subject,
    description,
    primitive: false,
    mutable: false
  }))
}

export const immutableSingletonStuff: ReadonlyArray<StuffWrapper<ImmutableSingleton>> = buildImmutableSingletonStuff()

export const immutableStuff: ReadonlyArray<StuffWrapper<Immutable>> = [
  ...primitiveAndNullStuff,
  ...immutableSingletonStuff
]

export interface StuffGeneratorWrapper<T extends unknown = unknown> {
  readonly generate: () => T
  readonly description: string
  readonly primitive: boolean
  readonly mutable: boolean
}

export function buildMutableStuffGenerators(): StuffGeneratorWrapper<object>[] {
  const base: Omit<StuffGeneratorWrapper<object>, 'primitive' | 'mutable'>[] = [
    { generate: (): Error => new Error('This is an error case'), description: 'Error' },
    { generate: (): Date => new Date(2025, 0, 11, 14, 11, 48, 857), description: 'Date' },
    { generate: (): RegExp => /foo/, description: 'RegExp' },
    {
      generate: (): (() => string) =>
        function (): string {
          return 'an anonymous function'
        },
      description: 'anonymous function'
    },
    {
      generate: (): (() => string) =>
        function namedFunction(): string {
          return 'a named function'
        },
      description: 'named function'
    },
    { generate: (): (() => string) => (): string => 'an arrow function', description: 'arrow function' },
    {
      generate: (): (() => string) => {
        const arrowFunction = (): string => 'an arrow function in a const'
        return arrowFunction
      },
      description: 'arrow function in a const'
    },
    {
      generate: (): (() => Promise<string>) =>
        async function (): Promise<string> {
          return 'an anonymous async function'
        },
      description: 'anonymous async function'
    },
    {
      generate: (): (() => Promise<string>) =>
        async function asyncNamedFunction(): Promise<string> {
          return 'an async named function'
        },
      description: 'async named function'
    },
    {
      generate: (): (() => Promise<string>) => async (): Promise<string> => 'an async arrow function',
      description: 'async arrow function'
    },
    {
      generate: (): (() => Promise<string>) => {
        const asyncArrowFunction = async (): Promise<string> => 'an async arrow function in a const'
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
    // NOTE: IArguments already has a frozen name `null` (at least in Node) ??!??!!?
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
    { generate: (): [] => [], description: 'empty array' },
    { generate: (): unknown[] => [4, 'z', { a: 'a' }, true, ['b', 12]], description: 'simple array' } // no Symbols

    // MUDO add circular stuff
  ]

  const arrayWithAllInIt: StuffGeneratorWrapper<Array<unknown>> = {
    generate: () => [...primitiveAndNullStuff.map(({ subject }) => subject), ...base.map(({ generate }) => generate())],
    description: 'complex array',
    primitive: false,
    mutable: true
  }

  return [...base.map(sg => ({ ...sg, primitive: false, mutable: true })), arrayWithAllInIt]
}

export const mutableStuffGenerators: ReadonlyArray<StuffGeneratorWrapper<object>> = buildMutableStuffGenerators()
export const stuffGenerators: ReadonlyArray<StuffGeneratorWrapper> = [
  ...immutableStuff.map(({ subject, description, primitive, mutable }) => ({
    generate: () => subject,
    description,
    primitive,
    mutable
  })),
  ...buildMutableStuffGenerators()
]
