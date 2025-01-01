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

import { expectType } from 'tsd'
import type {
  DeconstructedTuple,
  OptionalTupleElement,
  RequiredTupleElement,
  RestTupleElement
} from './DeconstructedTuple.ts'
import {
  type FinalOptionalArgumentSignature,
  type FinalRestArgumentSignature,
  type MultipleFinalOptionalArgumentsSignature,
  type NoArgumentsSignature,
  type OneArgumentSignature,
  type OneRestInTheMiddleTuple,
  type TwoArgumentsSignature,
  type FinalRestArgumentAfterArraySignature,
  type OneRestInTheMiddleInArraysTuple,
  type PseudoOptionalNonFinalSignature,
  type UndefinedNonFinalSignature,
  type PseudoRestNonFinalSignature,
  type OneRestInTheMiddleInArraysSignature,
  type OptionalBeforeRestSignature,
  type UndefinedBeforeRestSignature,
  type OptionalAfterRestSignature,
  type DoubleOptionalBeforeRestSignature,
  type DoubleOptionalAfterRestSignature,
  type SingleOptionalArgumentSignature,
  type SingleRestSignature
} from './PossibleSignatures.ts'

expectType<[]>([] as unknown as DeconstructedTuple<Parameters<NoArgumentsSignature>>)
expectType<[RequiredTupleElement<number>]>([] as unknown as DeconstructedTuple<Parameters<OneArgumentSignature>>)
expectType<[RequiredTupleElement<number[]>, RequiredTupleElement<string>]>(
  [] as unknown as DeconstructedTuple<Parameters<TwoArgumentsSignature>>
)
expectType<[RequiredTupleElement<number[]>, RequiredTupleElement<string>, OptionalTupleElement<boolean | undefined>]>(
  [] as unknown as DeconstructedTuple<Parameters<FinalOptionalArgumentSignature>>
)
expectType<[OptionalTupleElement<boolean | undefined>]>(
  [] as unknown as DeconstructedTuple<Parameters<SingleOptionalArgumentSignature>>
)
expectType<
  [
    RequiredTupleElement<number>,
    RequiredTupleElement<string[]>,
    OptionalTupleElement<boolean | undefined>,
    OptionalTupleElement<number | undefined>,
    OptionalTupleElement<string | undefined>
  ]
>([] as unknown as DeconstructedTuple<Parameters<MultipleFinalOptionalArgumentsSignature>>)
expectType<[RequiredTupleElement<number>, RequiredTupleElement<string>, RestTupleElement<boolean>]>(
  [] as unknown as DeconstructedTuple<Parameters<FinalRestArgumentSignature>>
)
expectType<[RequiredTupleElement<number>, RequiredTupleElement<string[]>, RestTupleElement<boolean>]>(
  [] as unknown as DeconstructedTuple<Parameters<FinalRestArgumentAfterArraySignature>>
)
expectType<[RequiredTupleElement<number>, RestTupleElement<string>, RequiredTupleElement<boolean>]>(
  [] as unknown as DeconstructedTuple<OneRestInTheMiddleTuple>
)
expectType<[RequiredTupleElement<number[]>, RestTupleElement<string>, RequiredTupleElement<boolean[]>]>(
  [] as unknown as DeconstructedTuple<OneRestInTheMiddleInArraysTuple>
)
expectType<[RestTupleElement<string | number>]>([] as unknown as DeconstructedTuple<Parameters<SingleRestSignature>>)
expectType<[RequiredTupleElement<number>, RequiredTupleElement<string | undefined>, RequiredTupleElement<boolean>]>(
  [] as unknown as DeconstructedTuple<Parameters<PseudoOptionalNonFinalSignature>>
)
expectType<[RequiredTupleElement<number>, RequiredTupleElement<string | undefined>, RequiredTupleElement<boolean>]>(
  [] as unknown as DeconstructedTuple<Parameters<UndefinedNonFinalSignature>>
)
expectType<[RequiredTupleElement<number>, RestTupleElement<string>, RequiredTupleElement<boolean>]>(
  [] as unknown as DeconstructedTuple<Parameters<PseudoRestNonFinalSignature>>
)
expectType<[RequiredTupleElement<number[]>, RestTupleElement<string>, RequiredTupleElement<boolean[]>]>(
  [] as unknown as DeconstructedTuple<Parameters<OneRestInTheMiddleInArraysSignature>>
)
expectType<[RequiredTupleElement<number[]>, OptionalTupleElement<boolean | undefined>, RestTupleElement<string>]>(
  [] as unknown as DeconstructedTuple<Parameters<OptionalBeforeRestSignature>>
)
expectType<[RequiredTupleElement<number[]>, RequiredTupleElement<boolean | undefined>, RestTupleElement<string>]>(
  [] as unknown as DeconstructedTuple<Parameters<UndefinedBeforeRestSignature>>
)
expectType<
  [
    RequiredTupleElement<number[]>,
    OptionalTupleElement<string[] | undefined>,
    OptionalTupleElement<boolean | undefined>,
    RestTupleElement<string>
  ]
>([] as unknown as DeconstructedTuple<Parameters<DoubleOptionalBeforeRestSignature>>)
expectType<[RequiredTupleElement<number[]>, RestTupleElement<string | boolean | undefined>]>(
  [] as unknown as DeconstructedTuple<Parameters<OptionalAfterRestSignature>>
)
expectType<[RequiredTupleElement<number[]>, RestTupleElement<string | boolean | number | undefined>]>(
  [] as unknown as DeconstructedTuple<Parameters<DoubleOptionalAfterRestSignature>>
)
