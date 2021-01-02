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
  InternalLocation,
} from '../types'
import { AFunction1, SomeError, ANewableFunction, someObject, aCallableGeneralContractFunction, anA, aB, someArgs, CallableBind } from './subjects'
import { expectAssignable, expectNotType, expectType } from 'tsd'
import { NewableGeneralContractFunction, GeneralContractFunction } from '../lib/GeneralContractFunction'
import { StackLocation } from '../lib/_private/is'

expectAssignable<GeneralContractFunction<AFunction1, SomeError>>(aCallableGeneralContractFunction)
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
/* NOTE tsd says that for the next line, expectType does not work. But the output _is_ the same? */
expectAssignable<CallableBind>(aCallableGeneralContractFunction.contractBind)
expectAssignable<GeneralContractFunction<(a:string, b: number) => string, SomeError>>(aCallableGeneralContractFunction.contractBind(someObject))
expectAssignable<string>(aCallableGeneralContractFunction.contractBind(someObject)(anA, aB))
expectAssignable<GeneralContractFunction<(b: number) => string, SomeError>>(aCallableGeneralContractFunction.contractBind(someObject, anA))
expectAssignable<string>(aCallableGeneralContractFunction.contractBind(someObject, anA)(aB))
expectAssignable<GeneralContractFunction<() => string, SomeError>>(aCallableGeneralContractFunction.contractBind(someObject, anA, aB))
expectAssignable<string>(aCallableGeneralContractFunction.contractBind(someObject, anA, aB)())
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
expectType<string>(aCallableGeneralContractFunctionB.toString())
expectType<AFunction1['apply']>(aCallableGeneralContractFunctionB.apply)
expectType<string>(aCallableGeneralContractFunctionB.apply(someObject, someArgs))
expectType<AFunction1['call']>(aCallableGeneralContractFunctionB.call)
expectType<string>(aCallableGeneralContractFunctionB.call(someObject, anA, aB))
expectType<AFunction1['bind']>(aCallableGeneralContractFunctionB.bind)
/* NOTE tsd says that for the next line, expectType does not work. But the output _is_ the same? */
expectAssignable<CallableBind>(aCallableGeneralContractFunctionB.contractBind)
expectAssignable<GeneralContractFunction<(a:string, b: number) => string, SomeError>>(aCallableGeneralContractFunctionB.contractBind(someObject))
expectAssignable<string>(aCallableGeneralContractFunctionB.contractBind(someObject)(anA, aB))
expectAssignable<GeneralContractFunction<(b: number) => string, SomeError>>(aCallableGeneralContractFunctionB.contractBind(someObject, anA))
expectAssignable<string>(aCallableGeneralContractFunctionB.contractBind(someObject, anA)(aB))
expectAssignable<GeneralContractFunction<() => string, SomeError>>(aCallableGeneralContractFunctionB.contractBind(someObject, anA, aB))
expectAssignable<string>(aCallableGeneralContractFunctionB.contractBind(someObject, anA, aB)())
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
expectType<string>(aCallableGeneralContractFunctionC.toString())
expectType<AFunction1['apply']>(aCallableGeneralContractFunctionC.apply)
expectType<string>(aCallableGeneralContractFunctionC.apply(someObject, someArgs))
expectType<AFunction1['call']>(aCallableGeneralContractFunctionC.call)
expectType<string>(aCallableGeneralContractFunctionC.call(someObject, anA, aB))
expectType<AFunction1['bind']>(aCallableGeneralContractFunctionC.bind)
/* NOTE tsd says that for the next line, expectType does not work. But the output _is_ the same? */
expectAssignable<CallableBind>(aCallableGeneralContractFunctionC.contractBind)
expectAssignable<GeneralContractFunction<(a:string, b: number) => string, SomeError>>(aCallableGeneralContractFunctionC.contractBind(someObject))
expectAssignable<string>(aCallableGeneralContractFunctionC.contractBind(someObject)(anA, aB))
expectAssignable<GeneralContractFunction<(b: number) => string, SomeError>>(aCallableGeneralContractFunctionC.contractBind(someObject, anA))
expectAssignable<string>(aCallableGeneralContractFunctionC.contractBind(someObject, anA)(aB))
expectAssignable<GeneralContractFunction<() => string, SomeError>>(aCallableGeneralContractFunctionC.contractBind(someObject, anA, aB))
expectAssignable<string>(aCallableGeneralContractFunctionC.contractBind(someObject, anA, aB)())
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aCallableGeneralContractFunctionC.prototype)
expectType<AFunction1['prototype']>(aCallableGeneralContractFunctionC.prototype)

type NewableBind = <Bound extends unknown[], Unbound extends unknown[]> (
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

expectAssignable<GeneralContractFunction<typeof ANewableFunction, SomeError>>(ANewableGeneralContractFunction)
expectAssignable<typeof ANewableFunction>(ANewableGeneralContractFunction)
expectType<ANewableFunction>(new ANewableGeneralContractFunction(anA, aB))
expectType<ANewableGeneralContractFunction>(new ANewableGeneralContractFunction(anA, aB))
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
/* NOTE tsd does not complain here on exact type */
expectType<NewableBind>(ANewableGeneralContractFunction.contractBind)
const boundA1 = ANewableGeneralContractFunction.contractBind(someObject)
expectAssignable<GeneralContractFunction<new (a:string, b: number) => ANewableGeneralContractFunction, SomeError>>(boundA1)
expectType<ANewableGeneralContractFunction>(new boundA1(anA, aB))
const boundA2 = ANewableGeneralContractFunction.contractBind(someObject, anA)
expectAssignable<GeneralContractFunction<new (b: number) => ANewableGeneralContractFunction, SomeError>>(boundA2)
expectType<ANewableGeneralContractFunction>(new boundA2(aB))
const boundA3 = ANewableGeneralContractFunction.contractBind(someObject, anA, aB)
expectAssignable<GeneralContractFunction<new () => ANewableGeneralContractFunction, SomeError>>(boundA3)
expectType<ANewableGeneralContractFunction>(new boundA3())
expectType<ANewableGeneralContractFunction>(ANewableGeneralContractFunction.prototype)
expectType<typeof ANewableFunction.prototype>(ANewableGeneralContractFunction.prototype)
expectType<ANewableFunction>(ANewableGeneralContractFunction.prototype)
expectType<typeof ANewableFunction.prototype>(ANewableGeneralContractFunction.prototype)
expectNotType<any>(ANewableGeneralContractFunction.prototype)
expectType<Function>(ANewableGeneralContractFunction.prototype.constructor)

let aNewableGeneralContractFunctionB: GeneralContractFunction<typeof ANewableFunction, SomeError> =
  ANewableGeneralContractFunction

expectType<GeneralContractFunction<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionB)
expectAssignable<typeof ANewableFunction>(aNewableGeneralContractFunctionB)
expectType<ANewableFunction>(new aNewableGeneralContractFunctionB(anA, aB))
expectType<ANewableGeneralContractFunction>(new aNewableGeneralContractFunctionB(anA, aB))
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
/* NOTE tsd says that for the next line, expectType does not work. But the output _is_ the same? */
expectAssignable<NewableBind>(aNewableGeneralContractFunctionB.contractBind)
const boundB1 = aNewableGeneralContractFunctionB.contractBind(someObject)
expectAssignable<GeneralContractFunction<new (a:string, b: number) => ANewableGeneralContractFunction, SomeError>>(boundB1)
expectType<ANewableGeneralContractFunction>(new boundB1(anA, aB))
const boundB2 = aNewableGeneralContractFunctionB.contractBind(someObject, anA)
expectAssignable<GeneralContractFunction<new (b: number) => ANewableGeneralContractFunction, SomeError>>(boundB2)
expectType<ANewableGeneralContractFunction>(new boundB2(aB))
const boundB3 = aNewableGeneralContractFunctionB.contractBind(someObject, anA, aB)
expectAssignable<GeneralContractFunction<new () => ANewableGeneralContractFunction, SomeError>>(boundB3)
expectType<ANewableGeneralContractFunction>(new boundB3())
expectType<ANewableGeneralContractFunction>(aNewableGeneralContractFunctionB.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionB.prototype)
expectType<ANewableFunction>(aNewableGeneralContractFunctionB.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionB.prototype)
expectNotType<any>(aNewableGeneralContractFunctionB.prototype)
expectType<Function>(aNewableGeneralContractFunctionB.prototype.constructor)

let aNewableGeneralContractFunctionC: GeneralContractFunction<typeof ANewableFunction, SomeError> =
  ANewableGeneralContractFunction as GeneralContractFunction<typeof ANewableFunction, SomeError>

expectType<GeneralContractFunction<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionC)
expectAssignable<typeof ANewableFunction>(aNewableGeneralContractFunctionC)
expectType<ANewableFunction>(new aNewableGeneralContractFunctionC(anA, aB))
expectType<ANewableGeneralContractFunction>(new aNewableGeneralContractFunctionC(anA, aB))
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
/* NOTE tsd says that for the next line, expectType does not work. But the output _is_ the same? */
expectAssignable<NewableBind>(aNewableGeneralContractFunctionC.contractBind)
const boundC1 = aNewableGeneralContractFunctionC.contractBind(someObject)
expectAssignable<GeneralContractFunction<new (a:string, b: number) => ANewableGeneralContractFunction, SomeError>>(boundC1)
expectType<ANewableGeneralContractFunction>(new boundC1(anA, aB))
const boundC2 = aNewableGeneralContractFunctionC.contractBind(someObject, anA)
expectAssignable<GeneralContractFunction<new (b: number) => ANewableGeneralContractFunction, SomeError>>(boundC2)
expectType<ANewableGeneralContractFunction>(new boundC2(aB))
const boundC3 = aNewableGeneralContractFunctionC.contractBind(someObject, anA, aB)
expectAssignable<GeneralContractFunction<new () => ANewableGeneralContractFunction, SomeError>>(boundC3)
expectType<ANewableGeneralContractFunction>(new boundC3())
expectType<ANewableGeneralContractFunction>(aNewableGeneralContractFunctionC.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionC.prototype)
expectType<ANewableFunction>(aNewableGeneralContractFunctionC.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionC.prototype)
expectNotType<any>(aNewableGeneralContractFunctionC.prototype)
expectType<Function>(aNewableGeneralContractFunctionC.prototype.constructor)

