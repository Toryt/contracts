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

import { expectAssignable } from 'tsd'
import type { UnknownFunction } from '../../../src/index.ts'
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

function unknownFunction(): unknown {
  return undefined
}

expectAssignable<UnknownFunction>((a: number, b: number): number => a + b)
expectAssignable<UnknownFunction>((a: number): number => a)
expectAssignable<UnknownFunction>((): number => 0)
expectAssignable<UnknownFunction>((a: unknown, b: number): number => b)
expectAssignable<UnknownFunction>((a: number, b: unknown): number => a)
expectAssignable<UnknownFunction>((a: number, b: unknown): never => {
  throw new Error()
})
expectAssignable<UnknownFunction>((a: number, b: number): string => `${a + b}`)
expectAssignable<UnknownFunction>((a: number, b: number): unknown => a | b)

expectAssignable<UnknownFunction>(unknownFunction as unknown as NoArgumentsSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as OneArgumentSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as TwoArgumentsSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as FinalOptionalArgumentSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as SingleOptionalArgumentSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as MultipleFinalOptionalArgumentsSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as FinalRestArgumentSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as SingleRestSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as PseudoOptionalNonFinalSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as UndefinedNonFinalSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as PseudoRestNonFinalSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as OneRestInTheMiddleInArraysSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as OptionalBeforeRestSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as DoubleOptionalBeforeRestSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as UndefinedBeforeRestSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as OptionalAfterRestSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as DoubleOptionalAfterRestSignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as ASignature)
expectAssignable<UnknownFunction>(unknownFunction as unknown as ASignatureWithOptionalArgs)
