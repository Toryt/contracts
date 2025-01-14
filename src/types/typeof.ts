/*
  Copyright 2025 Jan Dockx

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

import type { UnknownFunction } from '../types/UnknownFunction.ts'

/**
 * Comprehensive map of all possible `typeof` results to their corresponding TypeScript types.
 */
interface TypeofMap {
  undefined: undefined
  string: string
  number: number
  boolean: boolean
  symbol: symbol
  bigint: bigint
  object: object | null
  function: UnknownFunction
}

/**
 * Possible values of `typeof` of true primitives, i.e., not `null`, `undefined`, an object (which implies, not a Date,
 * Math or JSON, …, nor any Error, and not an array or arguments, and wrapped primitives), not a function:
 *
 * * `'string'`,
 * * `'number'`,
 * * `'boolean'`,
 * * '`symbol`', or
 * * '`bigint`'
 */
export const truePrimitiveTypeofs = ['string', 'number', 'boolean', 'symbol', 'bigint'] as const

/**
 * Possible values of `typeof` of true primitives, as defined by {@link truePrimitiveTypeofs}
 */
export type TruePrimitiveTypeof = (typeof truePrimitiveTypeofs)[number]

/**
 * True primitive types, i.e., not `null`, `undefined`, an object (which implies, not a Date, Math or JSON, …, nor any
 * Error, and not an array or arguments, and wrapped primitives), not a function. `TruePrimitive` values have a `typeof`
 * that is a {@link TruePrimitiveTypeof}.
 */
export type TruePrimitive = TypeofMap[TruePrimitiveTypeof]

/**
 * Comprehensive list of all possible `typeof` results of primitive values, i.e., the {@link truePrimitiveTypeofs}
 * extended with `'undefined'`.
 */
export const primitiveTypeofs: readonly ('undefined' | TruePrimitiveTypeof)[] = [
  'undefined',
  ...truePrimitiveTypeofs
] as const

/**
 * All possible `typeof` results of primitive values, i.e., the {@link TruePrimitiveTypeof} types, extended with
 * `'undefined'`.
 */
export type PrimitiveTypeof = (typeof primitiveTypeofs)[number]

/**
 * Primitive types, , i.e., the {@link TruePrimitive} types, extended with `undefined`.
 */
export type Primitive = TypeofMap[PrimitiveTypeof]

/**
 * Comprehensive list of all possible `typeof` results, i.e., the {@link primitiveTypeofs} extended with `'object'` and
 * `'function'`.
 */
export const typeofs: readonly (PrimitiveTypeof | 'object' | 'function')[] = [
  ...primitiveTypeofs,
  'object',
  'function'
] as const

/**
 * All possible strings returned by `typeof`, i.e., the {@link PrimitiveTypeof} extended with `'object'` and
 * `'function'`.
 */
export type Typeof = (typeof typeofs)[number]

/**
 * `p` is a true primitive, i.e., not `null`, `undefined`, an object (which implies, not a Date, Math or JSON, nor any
 * Error, and not an array or arguments, and wrapped primitives), not a function. `p` is a true
 *
 * * `string`,
 * * `number`,
 * * `boolean`,
 * * `symbol`, or
 * * `bigint`
 */
export function isTruePrimitive(p: unknown): p is TruePrimitive {
  return (truePrimitiveTypeofs as readonly Typeof[]).includes(typeof p)
}
