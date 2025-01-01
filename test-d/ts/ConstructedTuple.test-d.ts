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

import { expectNotType, expectType } from 'tsd'
import type { UnknownFunction } from '../../src/index.ts'
import type { ConstructedTuple } from './ConstructedTuple.ts'
import type { DeconstructedTuple } from './DeconstructedTuple.ts'
import {
  type DoubleOptionalAfterRestSignature,
  type DoubleOptionalBeforeRestSignature,
  type FinalOptionalArgumentSignature,
  type FinalRestArgumentAfterArraySignature,
  type FinalRestArgumentSignature,
  type MultipleFinalOptionalArgumentsSignature,
  type NoArgumentsSignature,
  type OneArgumentSignature,
  type OneRestInTheMiddleInArraysSignature,
  type OneRestInTheMiddleInArraysTuple,
  type OneRestInTheMiddleTuple,
  type OptionalAfterRestSignature,
  type OptionalBeforeRestSignature,
  type PseudoOptionalNonFinalSignature,
  type PseudoRestNonFinalSignature,
  type SingleOptionalArgumentSignature,
  type SingleRestSignature,
  type TwoArgumentsSignature,
  type UndefinedBeforeRestSignature,
  type UndefinedNonFinalSignature
} from '../../test2/util/SomeSignatures.ts'

function unknownFunction(): unknown {
  return undefined
}

function reconstructedSignature<T extends UnknownFunction>() {
  return unknownFunction as unknown as (...args: ConstructedTuple<DeconstructedTuple<Parameters<T>>>) => ReturnType<T>
}

function reconstructedTuple<T extends unknown[]>() {
  return [] as unknown as ConstructedTuple<DeconstructedTuple<T>>
}

expectType<NoArgumentsSignature>(reconstructedSignature<NoArgumentsSignature>())
expectType<OneArgumentSignature>(reconstructedSignature<OneArgumentSignature>())
expectNotType<NoArgumentsSignature>(reconstructedSignature<OneArgumentSignature>())
expectNotType<OneArgumentSignature>(reconstructedSignature<NoArgumentsSignature>())
expectType<TwoArgumentsSignature>(reconstructedSignature<TwoArgumentsSignature>())
expectNotType<OneArgumentSignature>(reconstructedSignature<TwoArgumentsSignature>())
expectType<FinalOptionalArgumentSignature>(reconstructedSignature<FinalOptionalArgumentSignature>())
expectType<FinalOptionalArgumentSignature>(reconstructedSignature<FinalOptionalArgumentSignature>())
expectType<SingleOptionalArgumentSignature>(reconstructedSignature<SingleOptionalArgumentSignature>())
expectType<MultipleFinalOptionalArgumentsSignature>(reconstructedSignature<MultipleFinalOptionalArgumentsSignature>())
expectType<FinalRestArgumentSignature>(reconstructedSignature<FinalRestArgumentSignature>())
expectType<FinalRestArgumentAfterArraySignature>(reconstructedSignature<FinalRestArgumentAfterArraySignature>())
expectType<OneRestInTheMiddleTuple>(reconstructedTuple<OneRestInTheMiddleTuple>())
expectType<OneRestInTheMiddleInArraysTuple>(reconstructedTuple<OneRestInTheMiddleInArraysTuple>())
expectType<SingleRestSignature>(reconstructedSignature<SingleRestSignature>())
expectType<PseudoOptionalNonFinalSignature>(reconstructedSignature<PseudoOptionalNonFinalSignature>())
expectType<UndefinedNonFinalSignature>(reconstructedSignature<UndefinedNonFinalSignature>())
expectType<PseudoRestNonFinalSignature>(reconstructedSignature<PseudoRestNonFinalSignature>())
expectType<OneRestInTheMiddleInArraysSignature>(reconstructedSignature<OneRestInTheMiddleInArraysSignature>())
expectType<OptionalBeforeRestSignature>(reconstructedSignature<OptionalBeforeRestSignature>())
expectType<UndefinedBeforeRestSignature>(reconstructedSignature<UndefinedBeforeRestSignature>())
expectType<DoubleOptionalBeforeRestSignature>(reconstructedSignature<DoubleOptionalBeforeRestSignature>())
expectType<OptionalAfterRestSignature>(reconstructedSignature<OptionalAfterRestSignature>())
expectType<DoubleOptionalAfterRestSignature>(reconstructedSignature<DoubleOptionalAfterRestSignature>())
