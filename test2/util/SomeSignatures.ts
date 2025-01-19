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

import type { NeverFunction } from '../../src/index.ts'
import { Level1AClass, type Level1BType, Level2Class, type Level2Type } from '../../test2/util/SomeTypes.ts'

let consumed: unknown
/**
 * avoid 'unused' warnings
 */
function consume(a: unknown): void {
  if (consumed !== a) {
    consumed = a
  }
}

export type NoArgumentsSignature = () => string
export function noArguments(): string {
  return 'result'
}

export type OneArgumentSignature = (a: number) => string
export function oneArgument(a: number): string {
  return `result ${a}`
}

export type TwoArgumentsSignature = (a: number[], b: string) => string
export function twoArguments(a: number[], b: string): string {
  return `result ${a.join(', ')} ${b}`
}

export type FinalOptionalArgumentSignature = (a: number[], b: string, c?: boolean) => string
export function finalOptionalArgument(a: number[], b: string, c?: boolean): string {
  return `result ${a.join(', ')} ${b} ${c ? 'no c or false' : 'true'}`
}

export type SingleOptionalArgumentSignature = (a?: boolean) => string
export function singleOptionalArgument(a?: boolean): string {
  return `result ${a ? 'no a or false' : 'true'}`
}

export type MultipleFinalOptionalArgumentsSignature = (
  a: number,
  b: string[],
  c?: boolean,
  d?: number,
  e?: string
) => string
export function multipleFinalOptionalArguments(a: number, b: string[], c?: boolean, d?: number, e?: string): string {
  return `result ${a} ${b.join(', ')} ${c ? 'no c or false' : 'true'} ${d ? 'no d or false' : 'true'} ${e ? 'no e or false' : 'true'}`
}

export type FinalRestArgumentSignature = (a: number, b: string, ...c: boolean[]) => string
export function finalRestArgument(a: number, b: string, ...c: boolean[]): string {
  return `result ${a} ${b} ${c.join(', ')}`
}

export type FinalRestArgumentAfterArraySignature = (a: number, b: string[], ...c: boolean[]) => string
export function finalRestArgumentAfterArray(a: number, b: string[], ...c: boolean[]): string {
  return `result ${a} ${b.join(', ')} ${c.join(', ')}`
}

export type OneRestInTheMiddleTuple = [a: number, ...b: string[], c: boolean]
export type OneRestInTheMiddleInArraysTuple = [a: number[], ...b: string[], c: boolean[]]

export type SingleRestSignature = (...args: (string | number)[]) => string
export function singleRest(...args: (string | number)[]): string {
  return `result ${args.join(', ')}`
}

type PseudoOptionalString = [b?: string]
export type PseudoOptionalNonFinalTuple = [a: number, ...b: PseudoOptionalString, c: boolean]
export type PseudoOptionalNonFinalSignature = (...args: PseudoOptionalNonFinalTuple) => string
export function pseudoOptionalNonFinal(...args: PseudoOptionalNonFinalTuple): string {
  return `result ${args.join(', ')}`
}

export type UndefinedNonFinalTuple = [a: number, b: string | undefined, c: boolean]
export type UndefinedNonFinalSignature = (a: number, b: string | undefined, c: boolean) => string
export function undefinedNonFinal(a: number, b: string | undefined, c: boolean): string {
  return `result ${a} ${b} ${c}`
}

export type PseudoRestNonFinalTuple = [a: number, ...b: string[], c: boolean]
export type PseudoRestNonFinalSignature = (...args: PseudoRestNonFinalTuple) => string
export function pseudoRestNonFinal(...args: PseudoRestNonFinalTuple): string {
  return `result ${args.join(', ')}`
}

export type OneRestInTheMiddleInArraysSignature = (...args: OneRestInTheMiddleInArraysTuple) => string
export function oneRestInTheMiddleInArrays(...args: OneRestInTheMiddleInArraysTuple): string {
  return `result ${args.join(', ')}`
}

type MultipleRestBase1 = [number, string]
type MultipleRestBase2 = [boolean, string]
export type NoRestViaMultipleRest = [...MultipleRestBase1, ...MultipleRestBase2]
export type OneRest1 = [number, ...string[]]
export type OneRestViaMultipleRests1 = [...OneRest1, ...MultipleRestBase2]
export type OneRest2 = [...boolean[], string]
export type OneRestViaMultipleRests2 = [...MultipleRestBase1, ...OneRest2]

export type OptionalBeforeRestSignature = (a: number[], b?: boolean, ...c: string[]) => string
export function optionalBeforeRest(a: number[], b?: boolean, ...c: string[]): string {
  return `result ${a} ${b === undefined ? 'no b' : b} ${c.join(', ')}`
}

export type DoubleOptionalBeforeRestSignature = (a: number[], b?: string[], c?: boolean, ...d: string[]) => void
export function doubleOptionalBeforeRest(a: number[], b?: string[], c?: boolean, ...d: string[]): void {
  consume(
    `result ${a.join(', ')} ${b === undefined ? 'no b' : b.join(', ')} ${c === undefined ? 'no b' : c} ${d.join(', ')}`
  )
}

export type UndefinedBeforeRestSignature = (a: number[], b: boolean | undefined, ...c: string[]) => undefined
export function undefinedBeforeRest(a: number[], b: boolean | undefined, ...c: string[]): undefined {
  consume(`result ${a.join(', ')} ${b === undefined ? 'undefined' : b} ${c.join(', ')}`)
  return undefined
}

type OptionalAfterRestBase1Tuple = [a: number[], ...b: string[]]
type OptionalAfterRestBase2Tuple = [c?: boolean]
type OptionalAfterRestTuple = [...OptionalAfterRestBase1Tuple, ...OptionalAfterRestBase2Tuple]
export type OptionalAfterRestSignature = (...args: OptionalAfterRestTuple) => unknown
export function optionalAfterRest(...args: OptionalAfterRestTuple): unknown {
  return `result ${args.join(', ')}`
}

type DoubleOptionalAfterRestBaseTuple = [c?: boolean, d?: number]
type DoubleOptionalAfterRestTuple = [...OptionalAfterRestBase1Tuple, ...DoubleOptionalAfterRestBaseTuple]
export type DoubleOptionalAfterRestSignature = (...args: DoubleOptionalAfterRestTuple) => unknown
export function doubleOptionalAfterRest(...args: DoubleOptionalAfterRestTuple): unknown {
  return `result ${args.join(', ')}`
}

export type ASignature = (a: number, b: Level1BType) => Level2Type
export function aSignature(a: number, b: Level1BType): Level2Type {
  return new Level2Class(a, b.level1BProperty, new Level1AClass(1, ''))
}

export type ASignatureWithOptionalArgs = (a: number, b?: Level1BType, c?: number) => Level2Type
export function aSignatureWithOptionalArgs(a: number, b: Level1BType, c?: number): Level2Type {
  return new Level2Class(a, b.level1BProperty, new Level1AClass(c ?? 0, ''))
}

export const aNeverFunction: NeverFunction = function () {
  throw new Error()
}
