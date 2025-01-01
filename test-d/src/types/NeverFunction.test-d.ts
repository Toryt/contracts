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

import { expectAssignable, expectNotAssignable } from 'tsd'
import type { NeverFunction, UnknownFunction } from '../../../src/index.ts'
import type {
  ASignature,
  ASignatureWithOptionalArgs,
  DoubleOptionalAfterRestSignature,
  DoubleOptionalBeforeRestSignature,
  FinalOptionalArgumentSignature,
  FinalRestArgumentSignature,
  MultipleFinalOptionalArgumentsSignature,
  NoArgumentsSignature,
  OneArgumentSignature,
  OneRestInTheMiddleInArraysSignature,
  OptionalAfterRestSignature,
  OptionalBeforeRestSignature,
  PseudoOptionalNonFinalSignature,
  PseudoRestNonFinalSignature,
  SingleOptionalArgumentSignature,
  SingleRestSignature,
  TwoArgumentsSignature,
  UndefinedBeforeRestSignature,
  UndefinedNonFinalSignature
} from '../../../test2/util/SomeSignatures.ts'

const aNeverFunction: NeverFunction = function () {
  throw new Error()
}
expectAssignable<UnknownFunction>(aNeverFunction)

expectAssignable<NoArgumentsSignature>(aNeverFunction)
expectAssignable<OneArgumentSignature>(aNeverFunction)
expectAssignable<TwoArgumentsSignature>(aNeverFunction)
expectAssignable<FinalOptionalArgumentSignature>(aNeverFunction)
expectAssignable<SingleOptionalArgumentSignature>(aNeverFunction)
expectAssignable<MultipleFinalOptionalArgumentsSignature>(aNeverFunction)
expectAssignable<FinalRestArgumentSignature>(aNeverFunction)
expectAssignable<SingleRestSignature>(aNeverFunction)
expectAssignable<PseudoOptionalNonFinalSignature>(aNeverFunction)
expectAssignable<UndefinedNonFinalSignature>(aNeverFunction)
expectAssignable<PseudoRestNonFinalSignature>(aNeverFunction)
expectAssignable<OneRestInTheMiddleInArraysSignature>(aNeverFunction)
expectAssignable<OptionalBeforeRestSignature>(aNeverFunction)
expectAssignable<DoubleOptionalBeforeRestSignature>(aNeverFunction)
expectAssignable<UndefinedBeforeRestSignature>(aNeverFunction)
expectAssignable<OptionalAfterRestSignature>(aNeverFunction)
expectAssignable<DoubleOptionalAfterRestSignature>(aNeverFunction)
expectAssignable<ASignature>(aNeverFunction)
expectAssignable<ASignatureWithOptionalArgs>(aNeverFunction)

expectAssignable<NeverFunction>(aNeverFunction)

expectNotAssignable<NeverFunction>((a: number, b: number): number => a + b)
expectNotAssignable<NeverFunction>((a: number): number => a)
expectNotAssignable<NeverFunction>((): number => 0)
expectNotAssignable<NeverFunction>((a: unknown, b: number): number => b)
expectNotAssignable<NeverFunction>((a: number, b: unknown): number => a)
expectNotAssignable<NeverFunction>((a: number, b: unknown): never => {
  throw new Error()
})
expectNotAssignable<NeverFunction>((a: number, b: number): string => `${a + b}`)
expectNotAssignable<NeverFunction>((a: number, b: number): unknown => a | b)
expectNotAssignable<NeverFunction>((...args: never[]): unknown => {
  return 'booh!'
})
