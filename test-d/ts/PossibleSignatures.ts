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

export type NoArguments = () => unknown

export type OneArgument = (a: number) => unknown

export type TwoArguments = (a: number[], b: string) => unknown

export type FinalOptionalArgument = (a: number[], b: string, c?: boolean) => unknown
export function finalOptionalArgument(a: number[], b: string, c?: boolean): unknown {
  return undefined
}

export type MultipleFinalOptionalArguments = (a: number, b: string[], c?: boolean, d?: number, e?: string) => unknown
export function multipleFinalOptionalArguments(a: number, b: string[], c?: boolean, d?: number, e?: string): unknown {
  return undefined
}

export type FinalRestArgument = (a: number, b: string, ...c: boolean[]) => unknown
export type FinalRestArgumentAfterArray = (a: number, b: string[], ...c: boolean[]) => unknown

export type OneRestInTheMiddleTuple = [a: number, ...b: string[], c: boolean]
export type OneRestInTheMiddleTupleInArrays = [a: number[], ...b: string[], c: boolean[]]

type PseudoOptionalString = [b?: string]
export type PseudoOptionalNonFinal = [a: number, ...b: PseudoOptionalString, c: boolean]
export function pseudoOptionalBeforeRequiredRevisited(...args: PseudoOptionalNonFinal): unknown {
  return undefined
}
export type UndefinedNonFinal = [a: number, b: string | undefined, c: boolean]
export function undefinedNonFinal(a: number, b: string | undefined, c: boolean): unknown {
  return undefined
}

export type PseudoRestNonFinal = [a: number, ...b: string[], c: boolean]
export function pseudoRestBeforeRequiredRevisited(...args: PseudoRestNonFinal): unknown {
  return undefined
}
export function pseudoRestBeforeRequiredInbetweenArraysRevisited(...args: OneRestInTheMiddleTupleInArrays): unknown {
  return undefined
}

type MultipleVariadicsBase1 = [number, string]
type MultipleVariadicsBase2 = [boolean, string]
export type NoRestViaMultipleVariadics = [...MultipleVariadicsBase1, ...MultipleVariadicsBase2]
export type OneRest1 = [number, ...string[]]
export type OneRestViaMultipleVariadics1 = [...OneRest1, ...MultipleVariadicsBase2]
export type OneRest2 = [...boolean[], string]
export type OneRestViaMultipleVariadics2 = [...MultipleVariadicsBase1, ...OneRest2]
