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

import { expectAssignable, expectType } from 'tsd'
import type { UnknownFunction } from '../../../src/index.ts'
import { type ContravariantArgumentTuple } from '../../../src/util/ContravariantArgumentTuple.ts'
import type { Level1BType } from '../../../test2/util/SomeTypes.ts'
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
} from '../../../test2/util/SomeSignatures.ts'

function unknownFunction(): unknown {
  return undefined
}

function contravariantArguments<Signature extends UnknownFunction>() {
  return [] as unknown as ContravariantArgumentTuple<Parameters<Signature>>
}

type Distribute<Signature extends UnknownFunction> =
  ContravariantArgumentTuple<Parameters<Signature>> extends infer CATE
    ? CATE extends unknown[]
      ? (...args: CATE) => ReturnType<Signature>
      : never
    : never

function contravariantArgumentsSignature<Signature extends UnknownFunction>() {
  return unknownFunction as unknown as Distribute<Signature>
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
expectAssignable<(a: number[], b: string, c?: boolean) => unknown>(
  contravariantArgumentsSignature<FinalOptionalArgumentSignature>()
)

expectType<[] | [boolean?]>(contravariantArguments<SingleOptionalArgumentSignature>())
expectAssignable<SingleOptionalArgumentSignature>(contravariantArgumentsSignature<SingleOptionalArgumentSignature>())
expectAssignable<(a?: boolean) => unknown>(contravariantArgumentsSignature<SingleOptionalArgumentSignature>())
expectAssignable<(a?: boolean | undefined) => unknown>(
  contravariantArgumentsSignature<SingleOptionalArgumentSignature>()
)
expectAssignable<(a: boolean | undefined) => unknown>(
  contravariantArgumentsSignature<SingleOptionalArgumentSignature>()
)
expectAssignable<(a: boolean) => unknown>(contravariantArgumentsSignature<SingleOptionalArgumentSignature>())

expectType<
  | []
  | [number]
  | [number, string[]]
  | [number, string[], boolean?]
  | [number, string[], boolean?, number?]
  | [number, string[], boolean?, number?, string?]
>(contravariantArguments<MultipleFinalOptionalArgumentsSignature>())
expectAssignable<MultipleFinalOptionalArgumentsSignature>(
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
expectAssignable<OptionalBeforeRestSignature>(contravariantArgumentsSignature<OptionalBeforeRestSignature>())

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
expectAssignable<DoubleOptionalBeforeRestSignature>(
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
expectAssignable<ASignatureWithOptionalArgs>(contravariantArgumentsSignature<ASignatureWithOptionalArgs>())

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
