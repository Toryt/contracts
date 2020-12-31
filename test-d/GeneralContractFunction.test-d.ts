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
  CallableGeneralContractFunction,
  GeneralContractFunction,
  InternalLocation,
  StackLocation
} from '../types'
import { SomeObject, AFunction1, SomeError, aFunction1, ANewableFunction, someObject } from './subjects'
import { expectAssignable, expectNotType, expectType } from 'tsd'

function aCallableGeneralContractFunction (this: SomeObject, a: string, b: number): string {
  return this.aProperty + a + b
}

const anA = 'a'
const aB = 5353

const someArgs: [a: string, b: number] = [anA, aB]

type CallableBind = <Bound extends unknown[], Unbound extends unknown[]> (
  this: (this: SomeObject, ...args: [...Bound, ...Unbound]) => string,
  thisArg: SomeObject,
  ...bound: Bound
) => CallableGeneralContractFunction<(...unbound: Unbound) => string>

aCallableGeneralContractFunction.contract = new AbstractContract({})
aCallableGeneralContractFunction.implementation = aFunction1
aCallableGeneralContractFunction.location = AbstractContract.internalLocation
aCallableGeneralContractFunction.bind2 =
  aCallableGeneralContractFunction.bind as unknown as CallableBind
Object.defineProperty(aCallableGeneralContractFunction, 'name', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: 'a general contract function name'
})

expectAssignable<GeneralContractFunction<AFunction1>>(aCallableGeneralContractFunction)
expectAssignable<AFunction1>(aCallableGeneralContractFunction)
expectType<AbstractContract<AFunction1, SomeError>>(aCallableGeneralContractFunction.contract)
expectType<AFunction1>(aCallableGeneralContractFunction.implementation)
expectType<InternalLocation>(aCallableGeneralContractFunction.location)
expectAssignable<StackLocation | InternalLocation>(aCallableGeneralContractFunction.location)
expectType<string>(aCallableGeneralContractFunction.name)
expectType<number>(aCallableGeneralContractFunction.length)
expectType<Function['toString']>(aCallableGeneralContractFunction.toString)
expectType<string>(aCallableGeneralContractFunction.toString())
expectType<AFunction1['apply']>(aCallableGeneralContractFunction.apply)
expectType<string>(aCallableGeneralContractFunction.apply(someObject, someArgs))
expectType<AFunction1['call']>(aCallableGeneralContractFunction.call)
expectType<string>(aCallableGeneralContractFunction.call(someObject, anA, aB))
expectType<AFunction1['bind']>(aCallableGeneralContractFunction.bind)
/* NOTE The exact type of bind is too difficult to test. We do test its effects though. */
expectAssignable<CallableBind>(aCallableGeneralContractFunction.bind2)
expectAssignable<GeneralContractFunction<(a:string, b: number) => string>>(aCallableGeneralContractFunction.bind2(someObject))
expectAssignable<string>(aCallableGeneralContractFunction.bind2(someObject)(anA, aB))
expectAssignable<GeneralContractFunction<(b: number) => string>>(aCallableGeneralContractFunction.bind2(someObject, anA))
expectAssignable<string>(aCallableGeneralContractFunction.bind2(someObject, anA)(aB))
expectAssignable<GeneralContractFunction<() => string>>(aCallableGeneralContractFunction.bind2(someObject, anA, aB))
expectAssignable<string>(aCallableGeneralContractFunction.bind2(someObject, anA, aB)())
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aCallableGeneralContractFunction.prototype)
expectType<AFunction1['prototype']>(aCallableGeneralContractFunction.prototype)



let aCallableGeneralContractFunctionB: GeneralContractFunction<AFunction1> = aCallableGeneralContractFunction

expectType<GeneralContractFunction<AFunction1>>(aCallableGeneralContractFunctionB)
expectAssignable<AFunction1>(aCallableGeneralContractFunctionB)
expectType<AbstractContract<AFunction1, SomeError>>(aCallableGeneralContractFunctionB.contract)
expectType<AFunction1>(aCallableGeneralContractFunctionB.implementation)
expectType<StackLocation | InternalLocation>(aCallableGeneralContractFunctionB.location)
expectType<string>(aCallableGeneralContractFunctionB.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aCallableGeneralContractFunctionB.toString)
expectAssignable<Function['toString']>(aCallableGeneralContractFunctionB.toString)
expectType<string>(aCallableGeneralContractFunctionB.toString())
expectType<AFunction1['apply']>(aCallableGeneralContractFunctionB.apply)
expectType<string>(aCallableGeneralContractFunctionB.apply(someObject, someArgs))
expectType<AFunction1['call']>(aCallableGeneralContractFunctionB.call)
expectType<string>(aCallableGeneralContractFunctionB.call(someObject, anA, aB))
expectType<AFunction1['bind']>(aCallableGeneralContractFunctionB.bind)
/* NOTE The exact type of bind is too difficult to test. We do test its effects though. */
expectAssignable<CallableBind>(aCallableGeneralContractFunctionB.bind2)
expectAssignable<GeneralContractFunction<(a:string, b: number) => string>>(aCallableGeneralContractFunctionB.bind2(someObject))
expectAssignable<string>(aCallableGeneralContractFunctionB.bind2(someObject)(anA, aB))
expectAssignable<GeneralContractFunction<(b: number) => string>>(aCallableGeneralContractFunctionB.bind2(someObject, anA))
expectAssignable<string>(aCallableGeneralContractFunctionB.bind2(someObject, anA)(aB))
expectAssignable<GeneralContractFunction<() => string>>(aCallableGeneralContractFunctionB.bind2(someObject, anA, aB))
expectAssignable<string>(aCallableGeneralContractFunctionB.bind2(someObject, anA, aB)())
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aCallableGeneralContractFunctionB.prototype)
expectType<AFunction1['prototype']>(aCallableGeneralContractFunctionB.prototype)

let aCallableGeneralContractFunctionC: GeneralContractFunction<AFunction1> =
  aCallableGeneralContractFunction as GeneralContractFunction<AFunction1>

expectType<GeneralContractFunction<AFunction1>>(aCallableGeneralContractFunctionC)
expectAssignable<AFunction1>(aCallableGeneralContractFunctionC)
expectType<AbstractContract<AFunction1, SomeError>>(aCallableGeneralContractFunctionC.contract)
expectType<AFunction1>(aCallableGeneralContractFunctionC.implementation)
expectType<StackLocation | InternalLocation>(aCallableGeneralContractFunctionC.location)
expectType<string>(aCallableGeneralContractFunctionC.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aCallableGeneralContractFunctionC.toString)
expectAssignable<Function['toString']>(aCallableGeneralContractFunctionC.toString)
expectType<string>(aCallableGeneralContractFunctionC.toString())
expectType<AFunction1['apply']>(aCallableGeneralContractFunctionC.apply)
expectType<string>(aCallableGeneralContractFunctionC.apply(someObject, someArgs))
expectType<AFunction1['call']>(aCallableGeneralContractFunctionC.call)
expectType<string>(aCallableGeneralContractFunctionC.call(someObject, anA, aB))
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

expectAssignable<GeneralContractFunction<typeof ANewableFunction>>(ANewableGeneralContractFunction)
expectAssignable<typeof ANewableFunction>(ANewableGeneralContractFunction)
expectType<AbstractContract<typeof ANewableFunction, SomeError>>(ANewableGeneralContractFunction.contract)
expectType<typeof ANewableFunction>(ANewableGeneralContractFunction.implementation)
expectType<InternalLocation>(ANewableGeneralContractFunction.location)
expectAssignable<StackLocation | InternalLocation>(ANewableGeneralContractFunction.location)
expectType<string>(ANewableGeneralContractFunction.name)
expectType<number>(ANewableGeneralContractFunction.length)
expectType<Function['toString']>(ANewableGeneralContractFunction.toString)
expectType<string>(ANewableGeneralContractFunction.toString())
expectType<typeof ANewableFunction.apply>(ANewableGeneralContractFunction.apply)
expectType<void>(ANewableFunction.apply(undefined, someArgs))
expectType<typeof ANewableFunction.call>(ANewableGeneralContractFunction.call)
expectType<void>(ANewableFunction.call(undefined, anA, aB))
expectType<typeof ANewableFunction.bind>(ANewableGeneralContractFunction.bind)
expectType<ANewableGeneralContractFunction>(ANewableGeneralContractFunction.prototype)
expectType<typeof ANewableFunction.prototype>(ANewableGeneralContractFunction.prototype)
expectType<ANewableFunction>(ANewableGeneralContractFunction.prototype)
expectType<typeof ANewableFunction.prototype>(ANewableGeneralContractFunction.prototype)
expectNotType<any>(ANewableGeneralContractFunction.prototype)
expectType<Function>(ANewableGeneralContractFunction.prototype.constructor)

let aNewableGeneralContractFunctionB: GeneralContractFunction<typeof ANewableFunction> =
  ANewableGeneralContractFunction

expectType<GeneralContractFunction<typeof ANewableFunction>>(aNewableGeneralContractFunctionB)
expectAssignable<typeof ANewableFunction>(aNewableGeneralContractFunctionB)
expectType<AbstractContract<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionB.contract)
expectType<typeof ANewableFunction>(aNewableGeneralContractFunctionB.implementation)
expectType<StackLocation | InternalLocation>(aNewableGeneralContractFunctionB.location)
expectType<string>(aNewableGeneralContractFunctionB.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aNewableGeneralContractFunctionB.toString)
expectAssignable<Function['toString']>(aNewableGeneralContractFunctionB.toString)
expectType<string>(aNewableGeneralContractFunctionB.toString())
expectType<typeof ANewableFunction.apply>(aNewableGeneralContractFunctionB.apply)
expectType<void>(aNewableGeneralContractFunctionB.apply(undefined, someArgs))
expectType<typeof ANewableFunction.call>(aNewableGeneralContractFunctionB.call)
expectType<void>(aNewableGeneralContractFunctionB.call(undefined, anA, aB))
expectType<typeof ANewableFunction.bind>(aNewableGeneralContractFunctionB.bind)
expectType<ANewableGeneralContractFunction>(aNewableGeneralContractFunctionB.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionB.prototype)
expectType<ANewableFunction>(aNewableGeneralContractFunctionB.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionB.prototype)
expectNotType<any>(aNewableGeneralContractFunctionB.prototype)
expectType<Function>(aNewableGeneralContractFunctionB.prototype.constructor)

let aNewableGeneralContractFunctionC: GeneralContractFunction<typeof ANewableFunction> =
  ANewableGeneralContractFunction as GeneralContractFunction<typeof ANewableFunction>

expectType<GeneralContractFunction<typeof ANewableFunction>>(aNewableGeneralContractFunctionC)
expectAssignable<typeof ANewableFunction>(aNewableGeneralContractFunctionC)
expectType<AbstractContract<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionC.contract)
expectType<typeof ANewableFunction>(aNewableGeneralContractFunctionC.implementation)
expectType<StackLocation | InternalLocation>(aNewableGeneralContractFunctionC.location)
expectType<string>(aNewableGeneralContractFunctionC.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aNewableGeneralContractFunctionC.toString)
expectAssignable<Function['toString']>(aNewableGeneralContractFunctionC.toString)
expectType<string>(aNewableGeneralContractFunctionC.toString())
expectType<typeof ANewableFunction.apply>(aNewableGeneralContractFunctionC.apply)
expectType<void>(aNewableGeneralContractFunctionC.apply(undefined, someArgs))
expectType<typeof ANewableFunction.call>(aNewableGeneralContractFunctionC.call)
expectType<void>(aNewableGeneralContractFunctionC.call(undefined, anA, aB))
expectType<typeof ANewableFunction.bind>(aNewableGeneralContractFunctionC.bind)
expectType<ANewableGeneralContractFunction>(aNewableGeneralContractFunctionC.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionC.prototype)
expectType<ANewableFunction>(aNewableGeneralContractFunctionC.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionC.prototype)
expectNotType<any>(aNewableGeneralContractFunctionC.prototype)
expectType<Function>(aNewableGeneralContractFunctionC.prototype.constructor)

