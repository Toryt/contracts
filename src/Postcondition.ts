/*
  Copyright 2024–2025 Jan Dockx

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

import type { ContravariantArgumentTuple } from './util/ContravariantArgumentTuple.ts'
import type { UnknownFunction } from './types/UnknownFunction.ts'

export type Postcondition<T extends UnknownFunction> =
  ContravariantArgumentTuple<Parameters<T>> extends infer U // infer the union of tuples
    ? U extends unknown[] // distribute over each tuple in the union
      ? (args: U, result: ReturnType<T>) => unknown // create a function type for each tuple
      : never // fallback for invalid tuples (not needed here, the extends is only used for distribution)
    : never // fallback for invalid ContravariantArgumentTuples

type DistributeOverUnion<U, R> = U extends unknown[] ? (args: U, result: R) => unknown : never

export type Postcondition2<T extends UnknownFunction> = DistributeOverUnion<
  ContravariantArgumentTuple<Parameters<T>>,
  ReturnType<T>
>
//
// interface PCArgs<T extends UnknownFunction> {
//   args: Parameters<T>
//   result: ReturnType<T>
// }
//
// type PC<T extends UnknownFunction> = (pcARgs: PCArgs<T>) => unknown
//
// interface PCArgs2<Args extends unknown[], R extends unknown> {
//   args: Args
//   result: R
// }
//
// type PC2<Signature extends UnknownFunction, Args extends unknown[]> = ((
//   ...args: Args
// ) => ReturnType<Signature>) extends Signature
//   ? PCArgs2<Args, ReturnType<Signature>>
//   : never
//
// export type PC3a<Signature extends UnknownFunction> = NeverFunction extends infer PossibleFunction // infer the union of matching signatures
//   ? PossibleFunction extends Signature // distribute over each signature in the union
//     ? (args: Parameters<PossibleFunction>, result: ReturnType<Signature>) => unknown
//     : never
//   : never

// export type PC3<Signature extends UnknownFunction, PArgs extends unknown[]> = ((
//   ...args: PArgs
// ) => ReturnType<Signature>) extends Signature
//   ? (args: PArgs, result: ReturnType<Signature>) => unknown
//   : 'incompatible arguments'

export type PC3<Signature extends UnknownFunction> = <PArgs extends PartialArgs<Parameters<Signature>>>(
  args: PArgs,
  result: ReturnType<Signature>
) => unknown

// Helper type to generate all valid prefixes (subsets of the tuple from left to right)
type PartialArgs<T extends unknown[]> = T extends [infer First, ...infer Rest] ? [] | [First, ...PartialArgs<Rest>] : []

type PC<Args extends unknown[]> = (result: unknown, ...args: Args) => unknown

function checkPost<Signature extends UnknownFunction>(
  pcs: PC<Parameters<Signature>>[],
  result: unknown,
  args: Parameters<Signature>
): result is ReturnType<Signature> {
  return pcs.every((pc: PC<Parameters<Signature>>) => pc.call(undefined, result, ...args))
}

function myFunction(a: number[], b: string, c?: boolean, ...rest: (number | string)[]): number {
  return a.length + b.length + (c ? 1 : 0) + rest.length
}

interface HasLength {
  length: number
}

const postConditions: PC<Parameters<typeof contractFunction>>[] = [
  (result: unknown, a: number[], b: string, c?: boolean, ...rest: (number | string)[]) =>
    result === a.length + b.length + (c ? 1 : 0) + rest.length,
  (result: unknown, a: number[], b: string, c?: boolean, ...rest: (number | string | boolean)[]) =>
    result === a.length + b.length + (c ? 1 : 0) + rest.length,
  (result: unknown, a: number[], b: string, c?: boolean, ...rest: unknown[]) =>
    result === a.length + b.length + (c ? 1 : 0) + rest.length,
  (result: unknown, a: number[], b: string, c?: boolean, d?: number | string) =>
    result === a.length + b.length + (c ? 1 : 0) + (d ? 2 : 1),

  (result: unknown, a: number[], b: string, c?: boolean) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: unknown[], b: string, c?: boolean) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: HasLength, b: HasLength, c?: boolean) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: number[], b: string, c: boolean | undefined) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: unknown[], b: string, c: boolean | undefined) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: HasLength, b: HasLength, c: boolean | undefined) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: number[], b: string, c?: unknown) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: unknown[], b: string, c?: unknown) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: HasLength, b: HasLength, c?: unknown) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: number[], b: string, c: unknown | undefined) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: unknown[], b: string, c: unknown | undefined) => result === a.length + b.length + (c ? 1 : 0),
  (result: unknown, a: HasLength, b: HasLength, c: unknown | undefined) => result === a.length + b.length + (c ? 1 : 0),

  (result: unknown, a: number[], b: string) => result === a.length + b.length,
  (result: unknown, a: unknown[], b: string) => result === a.length + b.length,
  (result: unknown, a: HasLength, b: HasLength) => result === a.length + b.length,

  (result: unknown, a: number[]) => typeof result === 'number' && result >= a.length,
  (result: unknown, a: unknown[]) => typeof result === 'number' && result >= a.length,
  (result: unknown, a: HasLength) => typeof result === 'number' && result >= a.length,

  (result: unknown) => Number.isInteger(result)
]

function contractFunction(a: number[], b: string, c?: boolean, ...rest: (number | string)[]): number {
  const result: unknown = myFunction.apply(undefined, arguments as unknown as Parameters<typeof contractFunction>)
  if (
    checkPost<typeof contractFunction>(
      postConditions,
      result,
      Array.prototype.slice.call(arguments) as unknown as Parameters<typeof contractFunction>
    )
  ) {
    return result
  }
  throw new Error('PC failed')
}
