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

// export type PC3<Signature extends UnknownFunction> = <PArgs extends PartialArgs<Parameters<Signature>>>(
//   args: PArgs,
//   result: ReturnType<Signature>
// ) => unknown
//
// // Helper type to generate all valid prefixes (subsets of the tuple from left to right)
// type PartialArgs<T extends unknown[]> = T extends [infer First, ...infer Rest] ? [] | [First, ...PartialArgs<Rest>] : []

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

function generalCondition1a(result: unknown, ...args: unknown[]) {
  return args.length > 2
}

function generalCondition1b(result: unknown, a: number[]) {
  return a[0] !== undefined && a[0] < 0
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

  (result: unknown) => Number.isInteger(result),

  generalCondition1a,
  generalCondition1b
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

type PC2<Args extends unknown[]> = (result: unknown, args: Args) => unknown

function generalCondition2a(result: unknown, args: unknown[]) {
  return args.length > 2
}

function generalCondition2b(result: unknown, [a]: [number[]]) {
  return a.length > 0 && a[0] < 0
}

const postConditions2: PC2<Parameters<typeof contractFunction>>[] = [
  (result: unknown, [a, b, c, ...rest]: Parameters<typeof contractFunction>) =>
    result === a.length + b.length + (c ? 1 : 0) + rest.length,
  (result, [a, b, c, ...rest]) => result === a.length + b.length + (c ? 1 : 0) + rest.length,
  (result: unknown, [a, b, c, ...rest]: [number[], string, (boolean | undefined)?, ...(number | string | boolean)[]]) =>
    result === a.length + b.length + (c ? 1 : 0) + rest.length,
  (result: unknown, [a, b, c, ...rest]: [number[], string, (boolean | undefined)?, ...unknown[]]) =>
    result === a.length + b.length + (c ? 1 : 0) + rest.length,
  // (result: unknown, [a, b, c, d]: [number[], string, (boolean | undefined)?, (number | string)?]) =>
  //   result === a.length + b.length + (c ? 1 : 0) + (d ? 2 : 1),
  (result: unknown, [a, b, c, d]: Parameters<typeof contractFunction>) =>
    result === a.length + b.length + (c ? 1 : 0) + (d ? 2 : 1),
  (result, [a, b, c, d]) => result === a.length + b.length + (c ? 1 : 0) + (d ? 2 : 1),

  // (result: unknown, a: number[], b: string, c?: boolean) => result === a.length + b.length + (c ? 1 : 0),
  (result, [a, b, c]) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: unknown[], b: string, c?: boolean) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: HasLength, b: HasLength, c?: boolean) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: number[], b: string, c: boolean | undefined) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: unknown[], b: string, c: boolean | undefined) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: HasLength, b: HasLength, c: boolean | undefined) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: number[], b: string, c?: unknown) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: unknown[], b: string, c?: unknown) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: HasLength, b: HasLength, c?: unknown) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: number[], b: string, c: unknown | undefined) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: unknown[], b: string, c: unknown | undefined) => result === a.length + b.length + (c ? 1 : 0),
  // (result: unknown, a: HasLength, b: HasLength, c: unknown | undefined) => result === a.length + b.length + (c ? 1 : 0),
  //
  (result: unknown, [a, b]: Parameters<typeof contractFunction>) => result === a.length + b.length,
  (result, [a, b]) => result === a.length + b.length,
  // (result: unknown, a: unknown[], b: string) => result === a.length + b.length,
  // (result: unknown, a: HasLength, b: HasLength) => result === a.length + b.length,
  //
  // (result: unknown, a: number[]) => typeof result === 'number' && result >= a.length,
  // (result: unknown, a: unknown[]) => typeof result === 'number' && result >= a.length,
  // (result: unknown, a: HasLength) => typeof result === 'number' && result >= a.length,

  (result: unknown) => Number.isInteger(result),

  generalCondition2a,
  // generalCondition2b
  (result, [a]) => generalCondition2b(result, [a])
]

// type PC3<S extends UnknownFunction> = S extends VoidFunction
//   ? (...args: Parameters<S>) => unknown
//   : (result: unknown, ...args: Parameters<S>) => unknown
type PC3<S extends UnknownFunction> =
  ReturnType<S> extends void
    ? (...args: Parameters<S>) => unknown
    : (result: unknown, ...args: Parameters<S>) => unknown

let outsideForVoid: number

function myFunction3(a: number[], b: string, c?: boolean, ...rest: (number | string)[]): void {
  outsideForVoid = a.length + b.length + (c ? 1 : 0) + rest.length
}

function generalCondition3a(...args: unknown[]) {
  return args.length > 2
}

function generalCondition3b(a: number[]) {
  return a[0] !== undefined && a[0] < 0
}

const postConditions3: PC3<typeof contractFunction3>[] = [
  (a: number[], b: string, c?: boolean, ...rest: (number | string)[]) =>
    outsideForVoid === a.length + b.length + (c ? 1 : 0) + rest.length,
  (a: number[], b: string, c?: boolean, ...rest: (number | string | boolean)[]) =>
    outsideForVoid === a.length + b.length + (c ? 1 : 0) + rest.length,
  (a: number[], b: string, c?: boolean, ...rest: unknown[]) =>
    outsideForVoid === a.length + b.length + (c ? 1 : 0) + rest.length,
  (a: number[], b: string, c?: boolean, d?: number | string) =>
    outsideForVoid === a.length + b.length + (c ? 1 : 0) + (d ? 2 : 1),

  (a: number[], b: string, c?: boolean) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: unknown[], b: string, c?: boolean) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: HasLength, b: HasLength, c?: boolean) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: number[], b: string, c: boolean | undefined) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: unknown[], b: string, c: boolean | undefined) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: HasLength, b: HasLength, c: boolean | undefined) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: number[], b: string, c?: unknown) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: unknown[], b: string, c?: unknown) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: HasLength, b: HasLength, c?: unknown) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: number[], b: string, c: unknown | undefined) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: unknown[], b: string, c: unknown | undefined) => outsideForVoid === a.length + b.length + (c ? 1 : 0),
  (a: HasLength, b: HasLength, c: unknown | undefined) => outsideForVoid === a.length + b.length + (c ? 1 : 0),

  (a: number[], b: string) => outsideForVoid === a.length + b.length,
  (a: unknown[], b: string) => outsideForVoid === a.length + b.length,
  (a: HasLength, b: HasLength) => outsideForVoid === a.length + b.length,

  (a: number[]) => outsideForVoid >= a.length,
  (a: unknown[]) => outsideForVoid >= a.length,
  (a: HasLength) => outsideForVoid >= a.length,

  (result: unknown) => Number.isInteger(result),

  generalCondition3a,
  generalCondition3b
]

function checkPost3<Signature extends UnknownFunction>(
  pcs: PC3<Signature>[],
  result: unknown,
  args: Parameters<Signature>
): result is undefined {
  return result === undefined && pcs.every((pc: PC3<Signature>) => pc.apply(undefined, args))
}

function contractFunction3(a: number[], b: string, c?: boolean, ...rest: (number | string)[]): void {
  const result: unknown = myFunction3.apply(undefined, arguments as unknown as Parameters<typeof contractFunction>)
  if (
    checkPost3<typeof contractFunction>(
      postConditions3,
      result,
      Array.prototype.slice.call(arguments) as unknown as Parameters<typeof contractFunction>
    )
  ) {
    return result
  }
  throw new Error('PC failed')
}

function voidResults<S extends (...args: never[]) => void>(voidConditions: PC3<S>[]): PC3<S>[] {
  return voidConditions.map(
    c =>
      (result: unknown, ...args: Parameters<S>) =>
        c(...args)
  )
}

interface PC4Kwargs<Signature extends UnknownFunction> {
  result: unknown
  args: Parameters<Signature>
}
type PC4<Signature extends UnknownFunction> = (kwargs: PC4Kwargs<Signature>) => unknown

function checkPost4<Signature extends UnknownFunction>(
  pcs: PC4<Signature>[],
  result: unknown,
  args: Parameters<Signature>
): result is ReturnType<Signature> {
  return pcs.every((pc: P4C<Signature>) => pc.call(undefined, { result, args }))
}

function generalCondition4a({ args }: { args: unknown[] }) {
  return args.length > 2
}

function generalCondition4b({ args: [a] }: { args: [number[]] }) {
  return a[0] !== undefined && a[0] < 0
}

const postConditions4: PC4<typeof contractFunction4>[] = [
  kwargs =>
    kwargs.result === kwargs.args[0].length + kwargs.args[1].length + (kwargs.args[2] ? 1 : 0) + kwargs.args.length - 3,
  ({ result, args }) => result === args[0].length + args[1].length + (args[2] ? 1 : 0) + args.length - 3,
  ({ result, args: [a, b, c, ...rest] }) => result === a.length + b.length + (c ? 1 : 0) + rest.length,
  ({ result, args: [a, b, c, d] }) => result === a.length + b.length + (c ? 1 : 0) + +(d ? 2 : 1),
  ({ result, args: [a, b, c] }) => result === a.length + b.length + (c ? 1 : 0),
  ({ result, args: [a, b] }) => result === a.length + b.length,
  ({ result, args: [a] }) => typeof result === 'number' && result >= a.length,
  ({ result }) => Number.isInteger(result),
  ({ result: unknown }) => Number.isInteger(result),

  generalCondition4a,
  ({ args: [a] }) => generalCondition4b({ args: [a] })
]

function contractFunction4(a: number[], b: string, c?: boolean, ...rest: (number | string)[]): number {
  const result: unknown = myFunction.apply(undefined, arguments as unknown as Parameters<typeof contractFunction>)
  if (
    checkPost4<typeof contractFunction4>(
      postConditions4,
      result,
      Array.prototype.slice.call(arguments) as unknown as Parameters<typeof contractFunction4>
    )
  ) {
    return result
  }
  throw new Error('PC failed')
}
