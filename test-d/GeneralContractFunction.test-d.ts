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

import {
  AbstractContract,
  GeneralContractFunction,
  InternalLocation,
  StackLocation
} from '../types'
import { SomeObject, AFunction1, SomeError, aFunction1, ANewableFunction } from './subjects'
import { expectAssignable, expectType } from 'tsd'

function aCallableGeneralContractFunction (this: SomeObject, a: string, b: number): string { return this.aProperty + a + b }
aCallableGeneralContractFunction.contract = new AbstractContract({})
aCallableGeneralContractFunction.implementation = aFunction1
aCallableGeneralContractFunction.location = AbstractContract.internalLocation
Object.defineProperty(aCallableGeneralContractFunction, 'name', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: 'a general contract function name'
})

expectAssignable<GeneralContractFunction<AFunction1, SomeError>>(aCallableGeneralContractFunction)
expectAssignable<AFunction1>(aCallableGeneralContractFunction)
expectType<AbstractContract<AFunction1, SomeError>>(aCallableGeneralContractFunction.contract)
expectType<AFunction1>(aCallableGeneralContractFunction.implementation)
expectType<InternalLocation>(aCallableGeneralContractFunction.location)
expectAssignable<StackLocation | InternalLocation>(aCallableGeneralContractFunction.location)
expectType<string>(aCallableGeneralContractFunction.name)
expectType<number>(aCallableGeneralContractFunction.length)
expectType<Function['toString']>(aCallableGeneralContractFunction.toString)
expectType<AFunction1['apply']>(aCallableGeneralContractFunction.apply)
expectType<AFunction1['call']>(aCallableGeneralContractFunction.call)
expectType<AFunction1['bind']>(aCallableGeneralContractFunction.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aCallableGeneralContractFunction.prototype)
expectType<AFunction1['prototype']>(aCallableGeneralContractFunction.prototype)

let aCallableGeneralContractFunctionB: GeneralContractFunction<AFunction1, SomeError> = aCallableGeneralContractFunction

expectType<GeneralContractFunction<AFunction1, SomeError>>(aCallableGeneralContractFunctionB)
expectAssignable<AFunction1>(aCallableGeneralContractFunctionB)
expectType<AbstractContract<AFunction1, SomeError>>(aCallableGeneralContractFunctionB.contract)
expectType<AFunction1>(aCallableGeneralContractFunctionB.implementation)
expectType<StackLocation | InternalLocation>(aCallableGeneralContractFunctionB.location)
expectType<string>(aCallableGeneralContractFunctionB.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aCallableGeneralContractFunctionB.toString)
expectAssignable<Function['toString']>(aCallableGeneralContractFunctionB.toString)
expectType<AFunction1['apply']>(aCallableGeneralContractFunctionB.apply)
expectType<AFunction1['call']>(aCallableGeneralContractFunctionB.call)
expectType<AFunction1['bind']>(aCallableGeneralContractFunctionB.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aCallableGeneralContractFunctionB.prototype)
expectType<AFunction1['prototype']>(aCallableGeneralContractFunctionB.prototype)

let aCallableGeneralContractFunctionC: GeneralContractFunction<AFunction1, SomeError> =
  aCallableGeneralContractFunction as GeneralContractFunction<AFunction1, SomeError>

expectType<GeneralContractFunction<AFunction1, SomeError>>(aCallableGeneralContractFunctionC)
expectAssignable<AFunction1>(aCallableGeneralContractFunctionC)
expectType<AbstractContract<AFunction1, SomeError>>(aCallableGeneralContractFunctionC.contract)
expectType<AFunction1>(aCallableGeneralContractFunctionC.implementation)
expectType<StackLocation | InternalLocation>(aCallableGeneralContractFunctionC.location)
expectType<string>(aCallableGeneralContractFunctionC.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aCallableGeneralContractFunctionC.toString)
expectAssignable<Function['toString']>(aCallableGeneralContractFunctionC.toString)
expectType<AFunction1['apply']>(aCallableGeneralContractFunctionC.apply)
expectType<AFunction1['call']>(aCallableGeneralContractFunctionC.call)
expectType<AFunction1['bind']>(aCallableGeneralContractFunctionC.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aCallableGeneralContractFunctionC.prototype)
expectType<AFunction1['prototype']>(aCallableGeneralContractFunctionC.prototype)

export class ANewableGeneralContractFunction {
  static readonly contract = new AbstractContract({})
  static readonly implementation = ANewableFunction
  static readonly location = AbstractContract.internalLocation

  constructor(a: string, b: number) {}
}
Object.defineProperty(ANewableGeneralContractFunction, 'name', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: 'a general contract function name'
})

expectAssignable<GeneralContractFunction<typeof ANewableFunction, SomeError>>(ANewableGeneralContractFunction)
expectAssignable<typeof ANewableFunction>(ANewableGeneralContractFunction)
expectType<AbstractContract<typeof ANewableFunction, SomeError>>(ANewableGeneralContractFunction.contract)
expectType<typeof ANewableFunction>(ANewableGeneralContractFunction.implementation)
expectType<InternalLocation>(ANewableGeneralContractFunction.location)
expectAssignable<StackLocation | InternalLocation>(ANewableGeneralContractFunction.location)
expectType<string>(ANewableGeneralContractFunction.name)
expectType<number>(ANewableGeneralContractFunction.length)
expectType<Function['toString']>(ANewableGeneralContractFunction.toString)
expectType<typeof ANewableFunction.apply>(ANewableGeneralContractFunction.apply)
expectType<typeof ANewableFunction.call>(ANewableGeneralContractFunction.call)
expectType<typeof ANewableFunction.bind>(ANewableGeneralContractFunction.bind)
expectType<ANewableGeneralContractFunction>(ANewableGeneralContractFunction.prototype)
expectAssignable<typeof ANewableFunction.prototype>(ANewableGeneralContractFunction.prototype)

let aNewableGeneralContractFunctionB: GeneralContractFunction<typeof ANewableFunction, SomeError> = ANewableGeneralContractFunction

expectType<GeneralContractFunction<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionB)
expectAssignable<typeof ANewableFunction>(aNewableGeneralContractFunctionB)
expectType<AbstractContract<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionB.contract)
expectType<typeof ANewableFunction>(aNewableGeneralContractFunctionB.implementation)
expectType<StackLocation | InternalLocation>(aNewableGeneralContractFunctionB.location)
expectType<string>(aNewableGeneralContractFunctionB.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aNewableGeneralContractFunctionB.toString)
expectAssignable<Function['toString']>(aNewableGeneralContractFunctionB.toString)
expectType<typeof ANewableFunction.apply>(aNewableGeneralContractFunctionB.apply)
expectType<typeof ANewableFunction.call>(aNewableGeneralContractFunctionB.call)
expectType<typeof ANewableFunction.bind>(aNewableGeneralContractFunctionB.bind)
expectType<ANewableFunction>(aNewableGeneralContractFunctionB.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionB.prototype)

let aNewableGeneralContractFunctionC: GeneralContractFunction<typeof ANewableFunction, SomeError> =
  ANewableGeneralContractFunction as GeneralContractFunction<typeof ANewableFunction, SomeError>

expectType<GeneralContractFunction<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionC)
expectAssignable<typeof ANewableFunction>(aNewableGeneralContractFunctionC)
expectType<AbstractContract<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionC.contract)
expectType<typeof ANewableFunction>(aNewableGeneralContractFunctionC.implementation)
expectType<StackLocation | InternalLocation>(aNewableGeneralContractFunctionC.location)
expectType<string>(aNewableGeneralContractFunctionC.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aNewableGeneralContractFunctionC.toString)
expectAssignable<Function['toString']>(aNewableGeneralContractFunctionC.toString)
expectType<typeof ANewableFunction.apply>(aNewableGeneralContractFunctionC.apply)
expectType<typeof ANewableFunction.call>(aNewableGeneralContractFunctionC.call)
expectType<typeof ANewableFunction.bind>(aNewableGeneralContractFunctionC.bind)
expectType<ANewableFunction>(aNewableGeneralContractFunctionC.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionC.prototype)

