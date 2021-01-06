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
} from '../types'
import { AFunction1, SomeError, ANewableFunction, someObject, aCallableGeneralContractFunction, anA, aB, someArgs, ANewableGeneralContractFunction } from './subjects'
import { expectAssignable, expectNotAssignable, expectNotType, expectType } from 'tsd'
import { CallableBind, GeneralContractFunction, NewableBind } from '../lib/GeneralContractFunction'
import { Location, InternalLocation } from '../lib/_private/is'

expectAssignable<GeneralContractFunction<AbstractContract<AFunction1, SomeError>>>(aCallableGeneralContractFunction)
expectAssignable<AFunction1>(aCallableGeneralContractFunction)
expectType<AbstractContract<AFunction1, SomeError>>(aCallableGeneralContractFunction.contract)
expectType<AFunction1>(aCallableGeneralContractFunction.implementation)
expectType<InternalLocation>(aCallableGeneralContractFunction.location)
expectAssignable<Location>(aCallableGeneralContractFunction.location)
expectType<string>(aCallableGeneralContractFunction.name)
expectType<number>(aCallableGeneralContractFunction.length)
expectType<Function['toString']>(aCallableGeneralContractFunction.toString)
expectType<string>(aCallableGeneralContractFunction.toString())
expectType<AFunction1['apply']>(aCallableGeneralContractFunction.apply)
expectType<string>(aCallableGeneralContractFunction.apply(someObject, someArgs))
expectType<AFunction1['call']>(aCallableGeneralContractFunction.call)
expectType<string>(aCallableGeneralContractFunction.call(someObject, anA, aB))
expectType<AFunction1['bind']>(aCallableGeneralContractFunction.bind)
expectAssignable<CallableBind<AbstractContract<AFunction1, SomeError>>>(aCallableGeneralContractFunction.bind)
// TODO this is still using the overloaded CallableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<(a:string, b: number) => string, SomeError>>>(aCallableGeneralContractFunction.bind(someObject))
expectAssignable<(a:string, b: number) => string>(aCallableGeneralContractFunction.bind(someObject))
expectAssignable<string>(aCallableGeneralContractFunction.bind(someObject)(anA, aB))
// TODO this is still using the overloaded CallableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<(b: number) => string, SomeError>>>(aCallableGeneralContractFunction.bind(someObject, anA))
expectAssignable<(b: number) => string>(aCallableGeneralContractFunction.bind(someObject, anA))
expectAssignable<string>(aCallableGeneralContractFunction.bind(someObject, anA)(aB))
// TODO this is still using the overloaded CallableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<() => string, SomeError>>>(aCallableGeneralContractFunction.bind(someObject, anA, aB))
expectAssignable<() => string>(aCallableGeneralContractFunction.bind(someObject, anA, aB))
expectAssignable<string>(aCallableGeneralContractFunction.bind(someObject, anA, aB)())
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aCallableGeneralContractFunction.prototype)
expectType<AFunction1['prototype']>(aCallableGeneralContractFunction.prototype)

let aCallableGeneralContractFunctionB: GeneralContractFunction<AbstractContract<AFunction1, SomeError>> = aCallableGeneralContractFunction

expectType<GeneralContractFunction<AbstractContract<AFunction1, SomeError>>>(aCallableGeneralContractFunctionB)
expectAssignable<AFunction1>(aCallableGeneralContractFunctionB)
expectType<AbstractContract<AFunction1, SomeError>>(aCallableGeneralContractFunctionB.contract)
expectType<AFunction1>(aCallableGeneralContractFunctionB.implementation)
expectType<Location>(aCallableGeneralContractFunctionB.location)
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
expectAssignable<CallableBind<AbstractContract<AFunction1, SomeError>>>(aCallableGeneralContractFunctionB.bind)
// TODO this is still using the overloaded CallableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<(a:string, b: number) => string, SomeError>>>(aCallableGeneralContractFunctionB.bind(someObject))
expectAssignable<(a:string, b: number) => string>(aCallableGeneralContractFunctionB.bind(someObject))
expectAssignable<string>(aCallableGeneralContractFunctionB.bind(someObject)(anA, aB))
// TODO this is still using the overloaded CallableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<(b: number) => string, SomeError>>>(aCallableGeneralContractFunctionB.bind(someObject, anA))
expectAssignable<(b: number) => string>(aCallableGeneralContractFunctionB.bind(someObject, anA))
expectAssignable<string>(aCallableGeneralContractFunctionB.bind(someObject, anA)(aB))
// TODO this is still using the overloaded CallableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<() => string, SomeError>>>(aCallableGeneralContractFunctionB.bind(someObject, anA, aB))
expectAssignable<() => string>(aCallableGeneralContractFunctionB.bind(someObject, anA, aB))
expectAssignable<string>(aCallableGeneralContractFunctionB.bind(someObject, anA, aB)())
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aCallableGeneralContractFunctionB.prototype)
expectType<AFunction1['prototype']>(aCallableGeneralContractFunctionB.prototype)

let aCallableGeneralContractFunctionC: GeneralContractFunction<AbstractContract<AFunction1, SomeError>> =
  aCallableGeneralContractFunction as GeneralContractFunction<AbstractContract<AFunction1, SomeError>>

expectType<GeneralContractFunction<AbstractContract<AFunction1, SomeError>>>(aCallableGeneralContractFunctionC)
expectAssignable<AFunction1>(aCallableGeneralContractFunctionC)
expectType<AbstractContract<AFunction1, SomeError>>(aCallableGeneralContractFunctionC.contract)
expectType<AFunction1>(aCallableGeneralContractFunctionC.implementation)
expectType<Location>(aCallableGeneralContractFunctionC.location)
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
// TODO this is still using the overloaded CallableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<(a:string, b: number) => string, SomeError>>>(aCallableGeneralContractFunctionC.bind(someObject))
expectAssignable<(a:string, b: number) => string>(aCallableGeneralContractFunctionC.bind(someObject))
expectAssignable<string>(aCallableGeneralContractFunctionC.bind(someObject)(anA, aB))
// TODO this is still using the overloaded CallableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<(b: number) => string, SomeError>>>(aCallableGeneralContractFunctionC.bind(someObject, anA))
expectAssignable<(b: number) => string>(aCallableGeneralContractFunctionC.bind(someObject, anA))
expectAssignable<string>(aCallableGeneralContractFunctionC.bind(someObject, anA)(aB))
// TODO this is still using the overloaded CallableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<() => string, SomeError>>>(aCallableGeneralContractFunctionC.bind(someObject, anA, aB))
expectAssignable<() => string>(aCallableGeneralContractFunctionC.bind(someObject, anA, aB))
expectAssignable<string>(aCallableGeneralContractFunctionC.bind(someObject, anA, aB)())
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aCallableGeneralContractFunctionC.prototype)
expectType<AFunction1['prototype']>(aCallableGeneralContractFunctionC.prototype)

expectAssignable<GeneralContractFunction<AbstractContract<typeof ANewableFunction, SomeError>>>(ANewableGeneralContractFunction)
expectAssignable<typeof ANewableFunction>(ANewableGeneralContractFunction)
expectType<ANewableFunction>(new ANewableGeneralContractFunction(anA, aB))
expectType<ANewableGeneralContractFunction>(new ANewableGeneralContractFunction(anA, aB))
expectType<AbstractContract<typeof ANewableFunction, SomeError>>(ANewableGeneralContractFunction.contract)
expectType<typeof ANewableFunction>(ANewableGeneralContractFunction.implementation)
expectType<InternalLocation>(ANewableGeneralContractFunction.location)
expectAssignable<Location>(ANewableGeneralContractFunction.location)
expectType<string>(ANewableGeneralContractFunction.name)
expectType<number>(ANewableGeneralContractFunction.length)
expectType<Function['toString']>(ANewableGeneralContractFunction.toString)
expectType<string>(ANewableGeneralContractFunction.toString())
expectType<typeof ANewableFunction.apply>(ANewableGeneralContractFunction.apply)
expectType<void>(ANewableFunction.apply(undefined, someArgs))
expectType<typeof ANewableFunction.call>(ANewableGeneralContractFunction.call)
expectType<void>(ANewableFunction.call(undefined, anA, aB))
/* NOTE tsd does not complain here on exact type */
expectType<NewableBind<AbstractContract<typeof ANewableFunction, SomeError>>(ANewableGeneralContractFunction.bind)
const boundA1 = ANewableGeneralContractFunction.bind(someObject)
expectAssignable<GeneralContractFunction<AbstractContract<new (a:string, b: number) => ANewableGeneralContractFunction, SomeError>>>(boundA1)
expectType<ANewableGeneralContractFunction>(new boundA1(anA, aB))
const boundA2 = ANewableGeneralContractFunction.bind(someObject, anA)
expectAssignable<GeneralContractFunction<AbstractContract<new (b: number) => ANewableGeneralContractFunction, SomeError>>>(boundA2)
expectType<ANewableGeneralContractFunction>(new boundA2(aB))
const boundA3 = ANewableGeneralContractFunction.bind(someObject, anA, aB)
expectAssignable<GeneralContractFunction<AbstractContract<new () => ANewableGeneralContractFunction, SomeError>>>(boundA3)
expectType<ANewableGeneralContractFunction>(new boundA3())
expectType<ANewableGeneralContractFunction>(ANewableGeneralContractFunction.prototype)
expectType<typeof ANewableFunction.prototype>(ANewableGeneralContractFunction.prototype)
expectType<ANewableFunction>(ANewableGeneralContractFunction.prototype)
expectType<typeof ANewableFunction.prototype>(ANewableGeneralContractFunction.prototype)
expectNotType<any>(ANewableGeneralContractFunction.prototype)
expectType<Function>(ANewableGeneralContractFunction.prototype.constructor)

let aNewableGeneralContractFunctionB: GeneralContractFunction<AbstractContract<typeof ANewableFunction, SomeError>> =
  ANewableGeneralContractFunction

expectType<GeneralContractFunction<AbstractContract<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionB)
expectAssignable<typeof ANewableFunction>(aNewableGeneralContractFunctionB)
expectType<ANewableFunction>(new aNewableGeneralContractFunctionB(anA, aB))
expectType<ANewableGeneralContractFunction>(new aNewableGeneralContractFunctionB(anA, aB))
expectType<AbstractContract<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionB.contract)
expectType<typeof ANewableFunction>(aNewableGeneralContractFunctionB.implementation)
expectType<Location>(aNewableGeneralContractFunctionB.location)
expectType<string>(aNewableGeneralContractFunctionB.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aNewableGeneralContractFunctionB.toString)
expectAssignable<Function['toString']>(aNewableGeneralContractFunctionB.toString)
expectType<string>(aNewableGeneralContractFunctionB.toString())
expectType<typeof ANewableFunction.apply>(aNewableGeneralContractFunctionB.apply)
expectType<void>(aNewableGeneralContractFunctionB.apply(undefined, someArgs))
expectType<typeof ANewableFunction.call>(aNewableGeneralContractFunctionB.call)
expectType<void>(aNewableGeneralContractFunctionB.call(undefined, anA, aB))
expectType<typeof ANewableFunction.bind & NewableBind<AbstractContract<typeof ANewableFunction, SomeError>>>(aNewableGeneralContractFunctionB.bind)
expectAssignable<NewableBind<AbstractContract<typeof ANewableFunction, SomeError>>>(aNewableGeneralContractFunctionB.bind)
const boundB1 = aNewableGeneralContractFunctionB.bind(someObject)
expectAssignable<GeneralContractFunction<AbstractContract<new (a:string, b: number) => ANewableGeneralContractFunction, SomeError>>>(boundB1)
expectType<ANewableGeneralContractFunction>(new boundB1(anA, aB))
const boundB2 = aNewableGeneralContractFunctionB.bind(someObject, anA)
// TODO this is still using the overloaded NewableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<new (b: number) => ANewableGeneralContractFunction, SomeError>>>(boundB2)
expectAssignable<new (b: number) => ANewableGeneralContractFunction>(boundB2)
expectType<ANewableGeneralContractFunction>(new boundB2(aB))
const boundB3 = aNewableGeneralContractFunctionB.bind(someObject, anA, aB)
// TODO this is still using the overloaded NewableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<new () => ANewableGeneralContractFunction, SomeError>>>(boundB3)
expectAssignable<new () => ANewableGeneralContractFunction>(boundB3)
expectType<ANewableGeneralContractFunction>(new boundB3())
expectType<ANewableGeneralContractFunction>(aNewableGeneralContractFunctionB.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionB.prototype)
expectType<ANewableFunction>(aNewableGeneralContractFunctionB.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionB.prototype)
expectNotType<any>(aNewableGeneralContractFunctionB.prototype)
expectType<Function>(aNewableGeneralContractFunctionB.prototype.constructor)

let aNewableGeneralContractFunctionC: GeneralContractFunction<AbstractContract<typeof ANewableFunction, SomeError>> =
  ANewableGeneralContractFunction as GeneralContractFunction<AbstractContract<typeof ANewableFunction, SomeError>>

expectType<GeneralContractFunction<AbstractContract<typeof ANewableFunction, SomeError>>>(aNewableGeneralContractFunctionC)
expectAssignable<typeof ANewableFunction>(aNewableGeneralContractFunctionC)
expectType<ANewableFunction>(new aNewableGeneralContractFunctionC(anA, aB))
expectType<ANewableGeneralContractFunction>(new aNewableGeneralContractFunctionC(anA, aB))
expectType<AbstractContract<typeof ANewableFunction, SomeError>>(aNewableGeneralContractFunctionC.contract)
expectType<typeof ANewableFunction>(aNewableGeneralContractFunctionC.implementation)
expectType<Location>(aNewableGeneralContractFunctionC.location)
expectType<string>(aNewableGeneralContractFunctionC.name)
// NOTE this seems to be a bug in TS: it determines the conjunction of 2 identical types, without simplification
expectType< (() => string) & (() => string)>(aNewableGeneralContractFunctionC.toString)
expectAssignable<Function['toString']>(aNewableGeneralContractFunctionC.toString)
expectType<string>(aNewableGeneralContractFunctionC.toString())
expectType<typeof ANewableFunction.apply>(aNewableGeneralContractFunctionC.apply)
expectType<void>(aNewableGeneralContractFunctionC.apply(undefined, someArgs))
expectType<typeof ANewableFunction.call>(aNewableGeneralContractFunctionC.call)
expectType<void>(aNewableGeneralContractFunctionC.call(undefined, anA, aB))
expectType<typeof ANewableFunction.bind & NewableBind<AbstractContract<typeof ANewableFunction, SomeError>>>(aNewableGeneralContractFunctionC.bind)
/* NOTE tsd says that for the next line, expectType does not work. But the output _is_ the same? */
expectAssignable<NewableBind<AbstractContract<typeof ANewableFunction, SomeError>>>(aNewableGeneralContractFunctionC.bind)
const boundC1 = aNewableGeneralContractFunctionC.bind(someObject)
expectAssignable<GeneralContractFunction<AbstractContract<new (a:string, b: number) => ANewableGeneralContractFunction, SomeError>>>(boundC1)
expectType<ANewableGeneralContractFunction>(new boundC1(anA, aB))
const boundC2 = aNewableGeneralContractFunctionC.bind(someObject, anA)
// TODO this is still using the overloaded NewableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<new (b: number) => ANewableGeneralContractFunction, SomeError>>>(boundC2)
expectAssignable<new (b: number) => ANewableGeneralContractFunction>(boundC2)
expectType<ANewableGeneralContractFunction>(new boundC2(aB))
const boundC3 = aNewableGeneralContractFunctionC.bind(someObject, anA, aB)
// TODO this is still using the overloaded NewableFunction methods
expectNotAssignable<GeneralContractFunction<AbstractContract<new () => ANewableGeneralContractFunction, SomeError>>>(boundC3)
expectAssignable<new () => ANewableGeneralContractFunction>(boundC3)
expectType<ANewableGeneralContractFunction>(new boundC3())
expectType<ANewableGeneralContractFunction>(aNewableGeneralContractFunctionC.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionC.prototype)
expectType<ANewableFunction>(aNewableGeneralContractFunctionC.prototype)
expectType<typeof ANewableFunction.prototype>(aNewableGeneralContractFunctionC.prototype)
expectNotType<any>(aNewableGeneralContractFunctionC.prototype)
expectType<Function>(aNewableGeneralContractFunctionC.prototype.constructor)

