/*
  Copyright 2024 Jan Dockx

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

import { expectAssignable, expectError, expectType, printType } from 'tsd'
import { type StartingTuples } from '../../../src/util/StartingTuples.ts'

// Empty tuple
/* TODO rm when no longer needed
printType(undefined as unknown as AccumulatingStartingTuples<[]>)
printType([] as StartingTuples<[]>)
*/
// expectType<[[]]>(undefined as unknown as AccumulatingStartingTuples<[]>)
expectType<[]>([] as StartingTuples<[]>)

// Single-element tuple
type Single = [number]
/* TODO rm when no longer needed
printType(undefined as unknown as AccumulatingStartingTuples<Single>)
printType([] as StartingTuples<Single>)
*/
// expectType<[[number], []]>(undefined as unknown as AccumulatingStartingTuples<Single>)
expectType<[number] | []>([] as StartingTuples<Single>)

// Two-element tuple
type Pair = [string, number]
/* TODO rm when no longer needed
printType(undefined as unknown as AccumulatingStartingTuples<Pair>)
printType([] as StartingTuples<Pair>)
*/
// expectType<[[string, number], [string], []]>(undefined as unknown as AccumulatingStartingTuples<Pair>)
expectType<[string, number] | [string] | []>([] as StartingTuples<Pair>)

// Three-element tuple
type Triple = [boolean, string, number]
/* TODO rm when no longer needed
printType(undefined as unknown as AccumulatingStartingTuples<Triple>)
printType([] as StartingTuples<Triple>)
*/
// expectType<[[boolean, string, number], [boolean, string], [boolean], []]>(
//   undefined as unknown as AccumulatingStartingTuples<Triple>
// )
expectType<[boolean, string, number] | [boolean, string] | [boolean] | []>([] as StartingTuples<Triple>)

// Complex tuples with objects and arrays
type Complex = [{ a: number }, string, number[], boolean, null]
expectType<
  | [{ a: number }, string, number[], boolean, null]
  | [{ a: number }, string, number[], boolean]
  | [{ a: number }, string, number[]]
  | [{ a: number }, string]
  | [{ a: number }]
  | []
>([] as StartingTuples<Complex>)

// Complex tuples with objects and array at the end
type ComplexWithEndingArray = [{ a: number }, string, number[], boolean, null, string[]]
expectType<
  | [{ a: number }, string, number[], boolean, null, string[]]
  | [{ a: number }, string, number[], boolean, null]
  | [{ a: number }, string, number[], boolean]
  | [{ a: number }, string, number[]]
  | [{ a: number }, string]
  | [{ a: number }]
  | []
>([] as StartingTuples<ComplexWithEndingArray>)

// Tuple with disjunction
type WithDisjunction = [string, boolean, number | undefined]
expectType<[string, boolean, number | undefined] | [string, boolean] | [string] | []>(
  [] as StartingTuples<WithDisjunction>
)

// Edge cases
type EdgeCase1 = [never]
expectType<[never] | []>([] as StartingTuples<EdgeCase1>)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EdgeCase2 = [any, unknown]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<[any, unknown] | [any] | []>([] as StartingTuples<EdgeCase2>)

type EdgeCase3 = [undefined, null, void]
expectType<[undefined, null, void] | [undefined, null] | [undefined] | []>([] as StartingTuples<EdgeCase3>)

// Very large tuple (to validate performance and correctness)
type Large = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
expectType<
  | [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  | [1, 2, 3, 4, 5, 6, 7, 8, 9]
  | [1, 2, 3, 4, 5, 6, 7, 8]
  | [1, 2, 3, 4, 5, 6, 7]
  | [1, 2, 3, 4, 5, 6]
  | [1, 2, 3, 4, 5]
  | [1, 2, 3, 4]
  | [1, 2, 3]
  | [1, 2]
  | [1]
  | []
>([] as StartingTuples<Large>)

// Single optional element
type SingleOptional = [number?]
/* TODO rm when no longer needed
printType(undefined as unknown as AccumulatingStartingTuples<SingleOptional>)
*/
// expectType<[[number?], []]>(undefined as unknown as AccumulatingStartingTuples<SingleOptional>)
printType([] as StartingTuples<SingleOptional>)
expectType<[number?] | []>([] as StartingTuples<SingleOptional>)

// Optional elements in the tuple
type OptionalTuple = [number, string?]
printType([] as StartingTuples<OptionalTuple>)
expectType<[number, string?] | [number] | []>([] as StartingTuples<OptionalTuple>)

// Multiple optional elements
type MultipleOptional = [number, string?, boolean?]
printType([] as StartingTuples<MultipleOptional>)
expectType<[number, string?, boolean?] | [number, string?] | [number] | []>([] as StartingTuples<MultipleOptional>)

// “Optional“ element in the middle
expectError(undefined as unknown as [number, string?, boolean]) // A required element cannot follow an optional element.
type OptionalInTheMiddle = [number, string | undefined, boolean]
printType([] as StartingTuples<OptionalInTheMiddle>)
expectType<[number, string | undefined, boolean] | [number, string | undefined] | [number] | []>(
  [] as StartingTuples<OptionalInTheMiddle>
)

type TupleWithOptionalMiddle<Rest extends unknown[]> = [number, ...Rest, boolean]
type WithMiddle = TupleWithOptionalMiddle<[string?]> // [number, string | undefined, boolean]
printType([] as StartingTuples<WithMiddle>)
expectType<[number, string | undefined, boolean] | [number, string | undefined] | [number] | []>(
  [] as StartingTuples<WithMiddle>
)
expectType<WithMiddle>([] as unknown as OptionalInTheMiddle)
expectType<OptionalInTheMiddle>([] as unknown as WithMiddle)

//
// // Variadic element alone
// type OnlyVariadic = [...number[]]
// printType([] as StartingTuples<OnlyVariadic>)
// // expectType<[...number[]] | []>([] as StartingTuples<OnlyVariadic>)
//
// // Tuple with a variadic last element
// type VariadicLast = [number, ...string[]]
// printType([] as StartingTuples<VariadicLast>)
// // expectType<[number, ...string[]] | [number] | []>([] as StartingTuples<VariadicLast>)
// //
// // // Multiple fixed elements followed by a variadic element
// // type FixedAndVariadic = [boolean, number, ...string[]]
// // expectType<[boolean, number, ...string[]] | [boolean, number] | [boolean] | []>([] as StartingTuples<FixedAndVariadic>)
// //
// // // Mixed optional and variadic elements
// // type MixedOptionalAndVariadic = [number, string?, ...boolean[]]
// // expectType<[number, string?, ...boolean[]] | [number, string?] | [number] | []>(
// //   [] as StartingTuples<MixedOptionalAndVariadic>
// // )
//
// printType((a: number, ...b: string[]) => true)
// printType(undefined as unknown as Parameters<(a: number, ...b: string[]) => true>)
// //
// // type Foo = [first: number, second?: string, ...rest: boolean[]]
// // function f(...x: Foo): boolean {
// //   const first: number = x[0]
// //   const second: string | undefined = x[1]
// //   const b1: boolean | undefined = x[2]
// //
// //   return first > 0 && !!second && !!b1
// // }
//
// type Foo1 = [first: number, second?: string, ...rest: boolean[]]
// function f1(...x: Foo1): boolean {
//   const first: number = x[0]
//   const second: string | undefined = x[1]
//   const b1: boolean | undefined = x[2]
//
//   return first > 0 && !!second && !!b1
// }
//
// printType(f1)
// printType(undefined as unknown as Parameters<typeof f1>)
//
// function f1b(first: number, second?: string, ...rest: boolean[]): boolean {
//   const b1: boolean | undefined = rest[0]
//
//   return first > 0 && !!second && !!b1
// }
//
// printType(f1b)
// printType(undefined as unknown as Parameters<typeof f1b>)
// expectType<typeof f1b>(f1)
// expectType<typeof f1>(f1b)
// expectType<Parameters<typeof f1b>>(undefined as unknown as Parameters<typeof f1>)
// expectAssignable<Parameters<typeof f1b>>(undefined as unknown as Parameters<typeof f1>)
// expectType<Parameters<typeof f1>>(undefined as unknown as Parameters<typeof f1b>)
// expectAssignable<Parameters<typeof f1>>(undefined as unknown as Parameters<typeof f1b>)
//
// type Foo2 = [first: number, ...rest: boolean[], last: string]
// function f2(...x: Foo2): boolean {
//   const first: number = x[0]
//   const last = x[x.length - 1]
//   const b1 = x[1]
//
//   return first > 0 && !!last && !!b1
// }
//
// printType(f2)
// printType(undefined as unknown as Parameters<typeof f2>)
//
// export type IsAnyElementVariadic<T extends unknown[]> = T extends [...infer _, ...infer Rest]
//   ? Rest extends [] // Check if the "rest" part is empty
//     ? false
//     : true
//   : false
//
// // Non-variadic tuple
// printType(undefined as unknown as IsAnyElementVariadic<[number, string]>)
// expectType<false>(undefined as unknown as IsAnyElementVariadic<[number, string]>)
//
// // Variadic tuple
// printType(undefined as unknown as IsAnyElementVariadic<[number, ...string[]]>)
// expectType<true>(undefined as unknown as IsAnyElementVariadic<[number, ...string[]]>)
//
// // Tuple with variadic in the middle
// printType(undefined as unknown as IsAnyElementVariadic<[...number[], boolean]>)
// expectType<true>(undefined as unknown as IsAnyElementVariadic<[...number[], boolean]>)
//
// // Empty tuple
// printType(undefined as unknown as IsAnyElementVariadic<[]>)
// expectType<false>(undefined as unknown as IsAnyElementVariadic<[]>)
//
// type TypesA<T extends unknown[]> = {
//   [I in keyof T]: T[I] extends undefined | unknown[] ? true : false
// }
// printType(undefined as unknown as TypesA<[number]>)
// printType(undefined as unknown as TypesA<[number?]>)
// printType(undefined as unknown as TypesA<[number, boolean?]>)
// printType(undefined as unknown as TypesA<[number, boolean[]]>)
// printType(undefined as unknown as TypesA<[number, ...boolean[]]>)
type TypePerArgument<Self, Args extends unknown[]> = Flatten<
