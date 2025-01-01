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

import { expectAssignable, expectNotAssignable, expectNotType, expectType } from 'tsd'
import type { UnknownFunction } from '../../../src/index.ts'
import { type ContravariantArgumentTuple } from '../../../src/util/ContravariantArgumentTuple.ts'
import type { Level1AType, Level1BType } from '../../../test2/util/SomeTypes.ts'
import type {
  ASignature,
  ASignatureWithOptionalArgs,
  DoubleOptionalAfterRestSignature,
  DoubleOptionalBeforeRestSignature,
  FinalOptionalArgumentSignature,
  FinalRestArgumentAfterArraySignature,
  FinalRestArgumentSignature,
  MultipleFinalOptionalArgumentsSignature,
  NoArgumentsSignature,
  OneArgumentSignature,
  OneRestInTheMiddleInArraysSignature,
  OneRestInTheMiddleTuple,
  OptionalAfterRestSignature,
  OptionalBeforeRestSignature,
  PseudoOptionalNonFinalSignature,
  PseudoOptionalNonFinalTuple,
  PseudoRestNonFinalSignature,
  SingleOptionalArgumentSignature,
  SingleRestSignature,
  TwoArgumentsSignature,
  UndefinedBeforeRestSignature,
  UndefinedNonFinalSignature
} from '../../ts/PossibleSignatures.ts'

function unknownFunction(): unknown {
  return undefined
}

function contravariantArguments<T extends UnknownFunction>() {
  return [] as unknown as ContravariantArgumentTuple<Parameters<T>>
}

function contravariantArgumentsSignature<T extends UnknownFunction>() {
  return unknownFunction as unknown as (...args: ContravariantArgumentTuple<Parameters<T>>) => ReturnType<T>
}

expectType<[]>(contravariantArguments<NoArgumentsSignature>())
expectAssignable<NoArgumentsSignature>(contravariantArgumentsSignature<NoArgumentsSignature>())

expectType<[] | [number]>(contravariantArguments<OneArgumentSignature>())
expectAssignable<OneArgumentSignature>(contravariantArgumentsSignature<OneArgumentSignature>())

expectType<[] | [number[]] | [number[], string]>(contravariantArguments<TwoArgumentsSignature>())
expectAssignable<TwoArgumentsSignature>(contravariantArgumentsSignature<TwoArgumentsSignature>())

expectType<[] | [number[]] | [number[], string] | [number[], string, boolean?]>(
  contravariantArguments<FinalOptionalArgumentSignature>()
)
// MUDO because ContravariantArgumentTuple says `x?: T | undefined` for optional argument
expectNotAssignable<(a: number[], b: string, c?: boolean) => unknown>(
  contravariantArgumentsSignature<FinalOptionalArgumentSignature>()
)

expectType<[] | [boolean?]>(contravariantArguments<SingleOptionalArgumentSignature>())
// MUDO because ContravariantArgumentTuple says `x?: T | undefined` for optional argument
expectNotAssignable<SingleOptionalArgumentSignature>(contravariantArgumentsSignature<SingleOptionalArgumentSignature>())
// MUDO because … euh …?
expectNotAssignable<(a?: boolean) => unknown>(contravariantArgumentsSignature<SingleOptionalArgumentSignature>())
expectNotAssignable<(a?: boolean | undefined) => unknown>(
  contravariantArgumentsSignature<SingleOptionalArgumentSignature>()
)
expectNotAssignable<(a: boolean | undefined) => unknown>(
  contravariantArgumentsSignature<SingleOptionalArgumentSignature>()
)
// MUDO ok, understandable
expectAssignable<(a: boolean) => unknown>(contravariantArgumentsSignature<SingleOptionalArgumentSignature>())

expectType<
  | []
  | [number]
  | [number, string[]]
  | [number, string[], boolean?]
  | [number, string[], boolean?, number?]
  | [number, string[], boolean?, number?, string?]
>(contravariantArguments<MultipleFinalOptionalArgumentsSignature>())
// MUDO because ContravariantArgumentTuple says `x?: T | undefined` for optional argument
expectNotAssignable<SingleOptionalArgumentSignature>(
  contravariantArgumentsSignature<MultipleFinalOptionalArgumentsSignature>()
)

expectType<[] | [number] | [number, string] | [number, string, ...boolean[]]>(
  contravariantArguments<FinalRestArgumentSignature>()
)
expectAssignable<FinalRestArgumentSignature>(contravariantArgumentsSignature<FinalRestArgumentSignature>())

expectType<[] | [number] | [number, string[]] | [number, string[], ...boolean[]]>(
  contravariantArguments<FinalRestArgumentAfterArraySignature>()
)
expectAssignable<FinalRestArgumentAfterArraySignature>(
  contravariantArgumentsSignature<FinalRestArgumentAfterArraySignature>()
)

expectType<[] | [number] | [number, ...string[]] | [number, ...string[], boolean]>(
  [] as unknown as ContravariantArgumentTuple<OneRestInTheMiddleTuple>
)
expectAssignable<ContravariantArgumentTuple<OneRestInTheMiddleTuple>>([] as unknown as OneRestInTheMiddleTuple)

expectType<[] | [...(string | number)[]]>(contravariantArguments<SingleRestSignature>())
expectAssignable<SingleRestSignature>(contravariantArgumentsSignature<SingleRestSignature>())

expectType<[] | [number] | [number, string | undefined /* NOTE: not `string?` */] | PseudoOptionalNonFinalTuple>(
  contravariantArguments<PseudoOptionalNonFinalSignature>()
)
expectAssignable<PseudoOptionalNonFinalSignature>(contravariantArgumentsSignature<PseudoOptionalNonFinalSignature>())

expectType<[] | [number] | [number, string | undefined] | [number, string | undefined, boolean]>(
  contravariantArguments<UndefinedNonFinalSignature>()
)
expectAssignable<UndefinedNonFinalSignature>(contravariantArgumentsSignature<UndefinedNonFinalSignature>())

expectType<[] | [number] | [number, ...string[]] | [number, ...string[], boolean]>(
  contravariantArguments<PseudoRestNonFinalSignature>()
)
expectAssignable<PseudoRestNonFinalSignature>(contravariantArgumentsSignature<PseudoRestNonFinalSignature>())

expectType<[] | [number[]] | [number[], ...string[]] | [number[], ...string[], boolean[]]>(
  contravariantArguments<OneRestInTheMiddleInArraysSignature>()
)
expectAssignable<OneRestInTheMiddleInArraysSignature>(
  contravariantArgumentsSignature<OneRestInTheMiddleInArraysSignature>()
)

expectType<[] | [number[]] | [number[], boolean?] | [number[], boolean?, ...string[]]>(
  contravariantArguments<OptionalBeforeRestSignature>()
)
// MUDO because ContravariantArgumentTuple says `x?: T | undefined` for optional argument
expectNotAssignable<OptionalBeforeRestSignature>(contravariantArgumentsSignature<OptionalBeforeRestSignature>())

expectType<[] | [number[]] | [number[], boolean | undefined] | [number[], boolean | undefined, ...string[]]>(
  contravariantArguments<UndefinedBeforeRestSignature>()
)
expectAssignable<UndefinedBeforeRestSignature>(contravariantArgumentsSignature<UndefinedBeforeRestSignature>())

expectType<
  | []
  | [number[]]
  | [number[], string[]?]
  | [number[], string[]?, boolean?]
  | [number[], string[]?, boolean?, ...string[]]
>(contravariantArguments<DoubleOptionalBeforeRestSignature>())
// MUDO because ContravariantArgumentTuple says `x?: T | undefined` for optional argument
expectNotAssignable<DoubleOptionalBeforeRestSignature>(
  contravariantArgumentsSignature<DoubleOptionalBeforeRestSignature>()
)

// NOTE: changed signature
expectType<[] | [number[]] | [number[], ...(string | boolean | undefined)[]]>(
  contravariantArguments<OptionalAfterRestSignature>()
)
expectAssignable<OptionalAfterRestSignature>(contravariantArgumentsSignature<OptionalAfterRestSignature>())

// NOTE: changed signature
expectType<[] | [number[]] | [number[], ...(string | boolean | number | undefined)[]]>(
  contravariantArguments<DoubleOptionalAfterRestSignature>()
)
expectAssignable<DoubleOptionalAfterRestSignature>(contravariantArgumentsSignature<DoubleOptionalAfterRestSignature>())

expectType<[] | [number] | [number, Level1BType]>(contravariantArguments<ASignature>())
expectAssignable<ASignature>(contravariantArgumentsSignature<ASignature>())

expectType<[] | [number] | [number, Level1BType?] | [number, Level1BType?, number?]>(
  contravariantArguments<ASignatureWithOptionalArgs>()
)
// MUDO because ContravariantArgumentTuple says `x?: T | undefined` for optional argument
expectNotAssignable<ASignatureWithOptionalArgs>(contravariantArgumentsSignature<ASignatureWithOptionalArgs>())

// Complex tuples with objects and arrays
type Complex = [{ a: number }, string, number[], boolean, null]
expectType<
  | [{ a: number }, string, number[], boolean, null]
  | [{ a: number }, string, number[], boolean]
  | [{ a: number }, string, number[]]
  | [{ a: number }, string]
  | [{ a: number }]
  | []
>([] as ContravariantArgumentTuple<Complex>)

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
>([] as ContravariantArgumentTuple<ComplexWithEndingArray>)

// Tuple with disjunction
type WithDisjunction = [string, boolean, number | undefined]
expectType<[string, boolean, number | undefined] | [string, boolean] | [string] | []>(
  [] as ContravariantArgumentTuple<WithDisjunction>
)

// Edge cases
type EdgeCase1 = [never]
expectType<[never] | []>([] as ContravariantArgumentTuple<EdgeCase1>)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EdgeCase2 = [any, unknown]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expectType<[any, unknown] | [any] | []>([] as ContravariantArgumentTuple<EdgeCase2>)

type EdgeCase3 = [undefined, null, void]
expectType<[undefined, null, void] | [undefined, null] | [undefined] | []>([] as ContravariantArgumentTuple<EdgeCase3>)

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
>([] as ContravariantArgumentTuple<Large>)

type Flatten<T> = { [K in keyof T]: T[K] }

type TypePerArgument<Self, Args extends unknown[]> = Flatten<
  { self: Self } & { [Index in keyof Args as Index extends `${number}` ? Index : never]: Args[Index] }
>

// printType(undefined as unknown as TypePerArgument<Level1AType, []>)
expectType<{ self: Level1AType }>(undefined as unknown as TypePerArgument<Level1AType, []>)

// printType(undefined as unknown as TypePerArgument<Level1AType, [number]>)
expectType<{ self: Level1AType; 0: number }>(undefined as unknown as TypePerArgument<Level1AType, [number]>)

// printType(undefined as unknown as TypePerArgument<Level1AType, [number, boolean]>)
expectType<{ self: Level1AType; 0: number; 1: boolean }>(
  undefined as unknown as TypePerArgument<Level1AType, [number, boolean]>
)

// printType(undefined as unknown as TypePerArgument<Level1AType, [number, boolean, string?]>)
expectType<{ self: Level1AType; 0: number; 1: boolean; 2?: string }>(
  undefined as unknown as TypePerArgument<Level1AType, [number, boolean, string?]>
)

// printType(undefined as unknown as TypePerArgument<Level1AType, [number, boolean, string[]]>)
expectType<{ self: Level1AType; 0: number; 1: boolean; 2: string[] }>(
  undefined as unknown as TypePerArgument<Level1AType, [number, boolean, string[]]>
)

// printType(undefined as unknown as TypePerArgument<Level1AType, [number, boolean?, string[]?]>)
expectType<{ self: Level1AType; 0: number; 1?: boolean; 2?: string[] }>(
  undefined as unknown as TypePerArgument<Level1AType, [number, boolean?, string[]?]>
)

// printType(undefined as unknown as TypePerArgument<Level1AType, [number, boolean?, ...string[]]>)
expectNotType<{ self: Level1AType; 0: number; 1?: boolean; 2?: string[] }>(
  undefined as unknown as TypePerArgument<Level1AType, [number, boolean?, ...string[]]>
)
// once we hit a variadic, evaluation stops
expectType<{ self: Level1AType; 0: number; 1?: boolean }>(
  undefined as unknown as TypePerArgument<Level1AType, [number, boolean?, ...string[]]>
)

// printType(undefined as unknown as TypePerArgument<Level1AType, [number, ...boolean[], string]>)
expectNotType<{ self: Level1AType; 0: number; 1?: boolean[]; 2: string[] }>(
  undefined as unknown as TypePerArgument<Level1AType, [number, ...boolean[], string]>
)
expectNotType<{ self: Level1AType; 0: number; 1?: boolean[] }>(
  undefined as unknown as TypePerArgument<Level1AType, [number, ...boolean[], string]>
)
// once we hit a variadic, evaluation stops
expectType<{ self: Level1AType; 0: number }>(
  undefined as unknown as TypePerArgument<Level1AType, [number, ...boolean[], string]>
)

// printType(undefined as unknown as TypePerArgument<Level1AType, [...number[], boolean, string]>)
expectNotType<{ self: Level1AType; 0?: number[]; 1: boolean; 2: string[] }>(
  undefined as unknown as TypePerArgument<Level1AType, [...number[], boolean, string]>
)
expectNotType<{ self: Level1AType; 0?: number[]; 1: boolean }>(
  undefined as unknown as TypePerArgument<Level1AType, [...number[], boolean, string]>
)
expectNotType<{ self: Level1AType; 0?: number[] }>(
  undefined as unknown as TypePerArgument<Level1AType, [...number[], boolean, string]>
)
// once we hit a variadic, evaluation stops
expectType<{ self: Level1AType }>(undefined as unknown as TypePerArgument<Level1AType, [...number[], boolean, string]>)

interface TypeValue<Type, Optional extends boolean, Variadic extends boolean> {
  value: Type
  optional: Optional
  variadic: Variadic
}

type ValueTypePerArgument<Self, Args extends unknown[]> = Flatten<
  {
    self: Self
  } & {
    [Index in keyof Args as Index extends `${number}` ? Index : never]: TypeValue<
      Args[Index],
      undefined extends Args[Index] ? true : false, // optional or union with undefined (we can't see the difference) BUT
      // TODO this does not work: once we hit a variadic, evaluation stops
      Args extends [...infer _, ...infer Variadic] ? (Index extends keyof Variadic ? true : false) : false
    >
  }
>

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, []>)
expectType<{ self: Level1AType }>(undefined as unknown as ValueTypePerArgument<Level1AType, []>)

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, [number]>)
expectType<{ self: Level1AType; 0: { value: number; optional: false; variadic: false } }>(
  undefined as unknown as ValueTypePerArgument<Level1AType, [number]>
)

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean]>)
expectType<{
  self: Level1AType
  0: { value: number; optional: false; variadic: false }
  1: { value: boolean; optional: false; variadic: false }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean]>)

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean, string | undefined]>)
expectType<{
  self: Level1AType
  0: { value: number; optional: false; variadic: false }
  1: { value: boolean; optional: false; variadic: false }
  2: { value: string | undefined; optional: true; variadic: false } // note that optional is true!!!
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean, string | undefined]>)

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean, string?]>)
expectType<{
  self: Level1AType
  0: { value: number; optional: false; variadic: false }
  1: { value: boolean; optional: false; variadic: false }
  // we can see the difference! `2` must be optional! It's in the index???
  2?: { value: string | undefined; optional: true; variadic: false }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean, string?]>)

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean, string[]]>)
expectType<{
  self: Level1AType
  0: { value: number; optional: false; variadic: false }
  1: { value: boolean; optional: false; variadic: false }
  2: { value: string[]; optional: false; variadic: false }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean, string[]]>)

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean?, string[]?]>)
expectType<{
  self: Level1AType
  0: { value: number; optional: false; variadic: false }
  1?: { value: boolean | undefined; optional: true; variadic: false }
  2?: { value: string[] | undefined; optional: true; variadic: false }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean?, string[]?]>)

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean?, ...string[]]>)
expectNotType<{
  self: Level1AType
  0: { value: number; optional: false; variadic: false }
  1?: { value: boolean | undefined; optional: true; variadic: false }
  2?: { value: string; optional: false; variadic: true }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean?, ...string[]]>)
// once we hit a variadic, evaluation stops
expectType<{
  self: Level1AType
  0: { value: number; optional: false; variadic: false }
  1?: { value: boolean | undefined; optional: true; variadic: false }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [number, boolean?, ...string[]]>)

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, [number, ...boolean[], string]>)
expectNotType<{
  self: Level1AType
  0: { value: number; optional: false; variadic: false }
  1?: { value: boolean[]; optional: false; variadic: true }
  2: { value: string[]; optional: false; variadic: false }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [number, ...boolean[], string]>)
expectNotType<{
  self: Level1AType
  0: { value: number; optional: false; variadic: false }
  1?: { value: boolean[]; optional: false; variadic: true }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [number, ...boolean[], string]>)
// once we hit a variadic, evaluation stops
expectType<{ self: Level1AType; 0: { value: number; optional: false; variadic: false } }>(
  undefined as unknown as ValueTypePerArgument<Level1AType, [number, ...boolean[], string]>
)

// printType(undefined as unknown as ValueTypePerArgument<Level1AType, [...number[], boolean, string]>)
expectNotType<{
  self: Level1AType
  0?: { value: number; optional: false; variadic: true }
  1: { value: boolean; optional: false; variadic: false }
  2: { value: string[]; optional: false; variadic: false }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [...number[], boolean, string]>)
expectNotType<{
  self: Level1AType
  0?: { value: number; optional: false; variadic: true }
  1: { value: boolean; optional: false; variadic: false }
}>(undefined as unknown as ValueTypePerArgument<Level1AType, [...number[], boolean, string]>)
expectNotType<{ self: Level1AType; 0?: { value: number; optional: false; variadic: true } }>(
  undefined as unknown as ValueTypePerArgument<Level1AType, [...number[], boolean, string]>
)
// once we hit a variadic, evaluation stops
expectType<{ self: Level1AType }>(
  undefined as unknown as ValueTypePerArgument<Level1AType, [...number[], boolean, string]>
)

type ElementAt<T extends unknown[], Index extends keyof T> = T[Index]

// Example Tuples
type Tuple1 = []
type Tuple2 = [number]
type Tuple3 = [number, boolean]
type Tuple4 = [number, boolean, string | undefined]
type Tuple5 = [number, boolean, string?]
type Tuple6 = [number, boolean?, string[]?]
type Tuple7 = [number, boolean?, ...string[]]
type Tuple8 = [number, ...boolean[], string]
type Tuple9 = [...number[], boolean, string]

// TSD Tests
// Tuple1
expectType<undefined>(undefined as ElementAt<Tuple1, 0>) // Index out of bounds, resolves to undefined

// Tuple2
expectType<number>(undefined as unknown as ElementAt<Tuple2, 0>) // First element
expectType<undefined>(undefined as ElementAt<Tuple2, 1>) // Index out of bounds

// Tuple3
expectType<number>(undefined as unknown as ElementAt<Tuple3, 0>) // First element
expectType<boolean>(undefined as unknown as ElementAt<Tuple3, 1>) // Second element
expectType<undefined>(undefined as ElementAt<Tuple3, 2>) // Index out of bounds

// Tuple4
expectType<number>(undefined as unknown as ElementAt<Tuple4, 0>) // First element
expectType<boolean>(undefined as unknown as ElementAt<Tuple4, 1>) // Second element
expectType<string | undefined>(undefined as ElementAt<Tuple4, 2>) // Third element
expectType<undefined>(undefined as ElementAt<Tuple4, 3>) // Index out of bounds

// Tuple5
expectType<number>(undefined as unknown as ElementAt<Tuple5, 0>) // First element
expectType<boolean>(undefined as unknown as ElementAt<Tuple5, 1>) // Second element
// NOTE: `| undefined` is necessary for optional elements
expectType<string | undefined>(undefined as unknown as ElementAt<Tuple5, 2>) // Third element (optional)
expectType<undefined>(undefined as ElementAt<Tuple5, 3>) // Index out of bounds

// Tuple6
expectType<number>(undefined as unknown as ElementAt<Tuple6, 0>) // First element
// NOTE: `| undefined` is necessary for optional elements
expectNotType<boolean>(undefined as unknown as ElementAt<Tuple6, 1>) // Second element (optional)
expectType<boolean | undefined>(undefined as unknown as ElementAt<Tuple6, 1>) // Second element (optional)
expectType<string[] | undefined>(undefined as ElementAt<Tuple6, 2>) // Third element (optional)
expectType<undefined>(undefined as ElementAt<Tuple6, 3>) // Index out of bounds

// Tuple7
expectType<number>(undefined as unknown as ElementAt<Tuple7, 0>) // First element
expectType<boolean | undefined>(undefined as unknown as ElementAt<Tuple7, 1>) // Second element (optional)
expectType<string>(undefined as unknown as ElementAt<Tuple7, 2>) // Variadic element type NOTE: THIS WORKS!
expectNotType<undefined>(undefined as unknown as ElementAt<Tuple7, 3>) // No index out of bounds!
expectType<string>(undefined as unknown as ElementAt<Tuple7, 3>) // No index out of bounds!
expectType<string>(undefined as unknown as ElementAt<Tuple7, 4>) // No index out of bounds!
expectType<string>(undefined as unknown as ElementAt<Tuple7, 999999>) // No index out of bounds!
expectNotType<undefined>(undefined as unknown as ElementAt<Tuple7, 9999999>) // No index out of bounds!

// Tuple8
expectType<number>(undefined as unknown as ElementAt<Tuple8, 0>) // First element
expectNotType<boolean>(undefined as unknown as ElementAt<Tuple8, 1>) // Variadic boolean
expectType<boolean | string>(undefined as unknown as ElementAt<Tuple8, 1>) // Variadic boolean
expectType<boolean | string>(undefined as unknown as ElementAt<Tuple8, 2>) // Last element
expectType<boolean | string>(undefined as unknown as ElementAt<Tuple8, 3>) // Last element
expectType<boolean | string>(undefined as unknown as ElementAt<Tuple8, 999999>) // Last element
expectNotType<undefined>(undefined as unknown as ElementAt<Tuple8, 9999999>) // No index out of bounds!

// Tuple9
expectNotType<number>(undefined as unknown as ElementAt<Tuple9, 0>) // Variadic number
expectType<string | number | boolean>(undefined as unknown as ElementAt<Tuple9, 0>) // Variadic number
expectType<string | number | boolean>(undefined as unknown as ElementAt<Tuple9, 1>) // Variadic number
expectType<string | number | boolean>(undefined as unknown as ElementAt<Tuple9, 2>) // Variadic number
expectType<string | number | boolean>(undefined as unknown as ElementAt<Tuple9, 3>) // Variadic number
expectType<string | number | boolean>(undefined as unknown as ElementAt<Tuple9, 999999>) // Variadic number
expectNotType<undefined>(undefined as unknown as ElementAt<Tuple9, 9999999>) // No index out of bounds!

type TupleLength<T extends unknown[]> = T['length']

// Example Tuples
type TupleL1 = [] // Empty tuple
expectType<0>(undefined as unknown as TupleLength<TupleL1>)

type TupleL2 = [number]
expectType<1>(undefined as unknown as TupleLength<TupleL2>)

type TupleL3 = [number, boolean]
expectType<2>(undefined as unknown as TupleLength<TupleL3>)

type TupleL4 = [number, boolean, string?] // Optional element
expectNotType<3>(undefined as unknown as TupleLength<TupleL4>) // Optional elements are NOT included directly
expectNotType<2>(undefined as unknown as TupleLength<TupleL4>) // Optional elements are NOT excluded directly
expectType<2 | 3>(undefined as unknown as TupleLength<TupleL4>) // Optional elements are NOT included

type TupleL5 = [number, boolean, ...string[]] // Variadic tuple
expectNotType<3>(undefined as unknown as TupleLength<TupleL5>) // Fixed elements only, variadic elements are NOT included directly
expectNotType<3>(undefined as unknown as TupleLength<TupleL5>) // Fixed elements only, variadic elements are NOT excluded directly
expectType<number>(undefined as unknown as TupleLength<TupleL5>) // length is “a number” (greater than 2)

type TupleL6 = [number, ...boolean[], string] // Variadic tuple
expectNotType<1>(undefined as unknown as TupleLength<TupleL6>)
expectNotType<2>(undefined as unknown as TupleLength<TupleL6>)
expectNotType<3>(undefined as unknown as TupleLength<TupleL6>)
expectType<number>(undefined as unknown as TupleLength<TupleL6>) // length is “a number” (greater than 1)

// https://oida.dev/variadic-tuple-types-preview/
type Bar<T extends unknown[], U extends unknown[]> = [...T, boolean, ...U]
type TupleL7 = Bar<number[], string[]> // 2 variadics in a tuple
expectType<number>(undefined as unknown as TupleLength<TupleL7>) // length is “a number” (greater than 1)
