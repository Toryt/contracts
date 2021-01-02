/*
 Copyright 2020 - 2020 by Jan Dockx

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

import { CallableGeneralContractFunction, NewableGeneralContractFunction } from '../lib/GeneralContractFunction'
import { AbstractContract } from '../types'

export interface SomeObject {
  aProperty: number
}

export const someObject: SomeObject = {
  aProperty: 54
}

export type AFunction1 = (this: SomeObject, a: string, b: number) => string
export function aFunction1 (this: SomeObject, a: string, b: number): string { return this.aProperty + a + b }

export type AFunction2 = (a: string, b: number) => string
export const aFunction2: AFunction2 = function aFunction2 (a, b) { return `${a}${b} more text` }

export type AFunction3 = (a: string) => 'truth' | 'dare'
export const aFunction3: AFunction3 = function aFunction3 (a) { return a > 'm' ? 'truth' : 'dare' }

export class ANewableFunction {
  constructor(a: string, b: number) {}
}

export interface SomeError {
  anErrorProperty: object
}

export function aCallableGeneralContractFunction (this: SomeObject, a: string, b: number): string {
  return this.aProperty + a + b
}

export const anA = 'a'
export const aB = 5353

export const someArgs: [a: string, b: number] = [anA, aB]

export type CallableBind = <Bound extends unknown[], Unbound extends unknown[]> (
  this: (this: SomeObject, ...args: [...Bound, ...Unbound]) => string,
  thisArg: SomeObject,
  ...bound: Bound
) => CallableGeneralContractFunction<(...unbound: Unbound) => string, SomeError>

aCallableGeneralContractFunction.contract = new AbstractContract<AFunction1, SomeError>({})
aCallableGeneralContractFunction.implementation = aFunction1
aCallableGeneralContractFunction.location = AbstractContract.internalLocation
aCallableGeneralContractFunction.contractBind =
  aCallableGeneralContractFunction.bind as unknown as CallableBind
Object.defineProperty(aCallableGeneralContractFunction, 'name', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: 'a general contract function name'
})

export type NewableBind = <Bound extends unknown[], Unbound extends unknown[]> (
  this: new (...args: [...Bound, ...Unbound]) => ANewableFunction,
  thisArg: any,
  ...bound: Bound
) => NewableGeneralContractFunction<new (...unbound: Unbound) => ANewableFunction, SomeError>

export class ANewableGeneralContractFunction {
  static readonly contract = new AbstractContract<typeof ANewableFunction, SomeError>({})
  static readonly implementation = ANewableFunction
  static readonly location = AbstractContract.internalLocation
  static contractBind: NewableBind = ANewableFunction.bind as NewableBind

  constructor(a: string, b: number) {}
}
Object.defineProperty(ANewableGeneralContractFunction, 'name', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: 'a general contract function name'
})

