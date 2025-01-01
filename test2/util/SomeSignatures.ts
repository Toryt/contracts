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

import type { Level1BType, Level2Type } from '../../test2/util/SomeTypes.ts'

export type NoArgumentsSignature = () => unknown

export type OneArgumentSignature = (a: number) => unknown

export type TwoArgumentsSignature = (a: number[], b: string) => unknown

export type FinalOptionalArgumentSignature = (a: number[], b: string, c?: boolean) => unknown
export function finalOptionalArgument(a: number[], b: string, c?: boolean): unknown {
  return undefined
}

export type SingleOptionalArgumentSignature = (a?: boolean) => unknown
export function singleOptionalArgument(a?: boolean): unknown {
  return undefined
}

export type MultipleFinalOptionalArgumentsSignature = (
  a: number,
  b: string[],
  c?: boolean,
  d?: number,
  e?: string
) => unknown
export function multipleFinalOptionalArguments(a: number, b: string[], c?: boolean, d?: number, e?: string): unknown {
  return undefined
}

export type FinalRestArgumentSignature = (a: number, b: string, ...c: boolean[]) => unknown
export type FinalRestArgumentAfterArraySignature = (a: number, b: string[], ...c: boolean[]) => unknown

export type OneRestInTheMiddleTuple = [a: number, ...b: string[], c: boolean]
export type OneRestInTheMiddleInArraysTuple = [a: number[], ...b: string[], c: boolean[]]

export type SingleRestSignature = (...args: (string | number)[]) => unknown

type PseudoOptionalString = [b?: string]
export type PseudoOptionalNonFinalTuple = [a: number, ...b: PseudoOptionalString, c: boolean]
export type PseudoOptionalNonFinalSignature = (...args: PseudoOptionalNonFinalTuple) => unknown
export function pseudoOptionalNonFinal(...args: PseudoOptionalNonFinalTuple): unknown {
  return undefined
}

export type UndefinedNonFinalTuple = [a: number, b: string | undefined, c: boolean]
export type UndefinedNonFinalSignature = (a: number, b: string | undefined, c: boolean) => unknown
export function undefinedNonFinal(a: number, b: string | undefined, c: boolean): unknown {
  return undefined
}

export type PseudoRestNonFinalTuple = [a: number, ...b: string[], c: boolean]
export type PseudoRestNonFinalSignature = (...args: PseudoRestNonFinalTuple) => unknown
export function pseudoRestNonFinal(...args: PseudoRestNonFinalTuple): unknown {
  return undefined
}

export type OneRestInTheMiddleInArraysSignature = (...args: OneRestInTheMiddleInArraysTuple) => unknown
export function oneRestInTheMiddleInArrays(...args: OneRestInTheMiddleInArraysTuple): unknown {
  return undefined
}

type MultipleVariadicsBase1 = [number, string]
type MultipleVariadicsBase2 = [boolean, string]
export type NoRestViaMultipleVariadics = [...MultipleVariadicsBase1, ...MultipleVariadicsBase2]
export type OneRest1 = [number, ...string[]]
export type OneRestViaMultipleVariadics1 = [...OneRest1, ...MultipleVariadicsBase2]
export type OneRest2 = [...boolean[], string]
export type OneRestViaMultipleVariadics2 = [...MultipleVariadicsBase1, ...OneRest2]

export type OptionalBeforeRestSignature = (a: number[], b?: boolean, ...c: string[]) => unknown
export function optionalBeforeRest(a: number[], b?: boolean, ...c: string[]): unknown {
  return undefined
}

export type DoubleOptionalBeforeRestSignature = (a: number[], b?: string[], c?: boolean, ...d: string[]) => unknown
export function doubleOptionalBeforeRest(a: number[], b?: string[], c?: boolean, ...d: string[]): unknown {
  return undefined
}

export type UndefinedBeforeRestSignature = (a: number[], b: boolean | undefined, ...c: string[]) => unknown
export function undefinedBeforeRest(a: number[], b: boolean | undefined, ...c: string[]): unknown {
  return undefined
}

type OptionalAfterRestBase1Tuple = [a: number[], ...b: string[]]
type OptionalAfterRestBase2Tuple = [c?: boolean]
type OptionalAfterRestTuple = [...OptionalAfterRestBase1Tuple, ...OptionalAfterRestBase2Tuple]
export type OptionalAfterRestSignature = (...args: OptionalAfterRestTuple) => unknown
export function optionalAfterRest(...args: OptionalAfterRestTuple): unknown {
  return undefined
}

type DoubleOptionalAfterRestBaseTuple = [c?: boolean, d?: number]
type DoubleOptionalAfterRestTuple = [...OptionalAfterRestBase1Tuple, ...DoubleOptionalAfterRestBaseTuple]
export type DoubleOptionalAfterRestSignature = (...args: DoubleOptionalAfterRestTuple) => unknown
export function doubleOptionalAfterRest(...args: DoubleOptionalAfterRestTuple): unknown {
  return undefined
}

export type ASignature = (a: number, b: Level1BType) => Level2Type
export type ASignatureWithOptionalArgs = (a: number, b?: Level1BType, c?: number) => Level2Type
