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

import { expectAssignable, expectNotAssignable, expectNotType, expectType } from 'tsd'
import { AnyCallableFunction, AnyFunction, AnyNewableFunction } from '../types'
import { aFunction1, AFunction1, aFunction2, AFunction2, aFunction3, AFunction3, ANewableFunction } from './subjects'

expectType<AFunction1>(aFunction1)
expectAssignable<AnyCallableFunction>(aFunction1)
expectNotAssignable<AnyNewableFunction>(aFunction1)
expectAssignable<AnyFunction>(aFunction1)
expectType<number>(aFunction1.length)
expectType<Function['toString']>(aFunction1.toString)
expectType<CallableFunction['apply']>(aFunction1.apply)
expectType<CallableFunction['call']>(aFunction1.call)
expectType<CallableFunction['bind']>(aFunction1.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aFunction1.prototype)

expectType<AFunction2>(aFunction2)
expectAssignable<AFunction1>(aFunction2)
expectAssignable<AnyCallableFunction>(aFunction2)
expectNotAssignable<AnyNewableFunction>(aFunction2)
expectAssignable<AnyFunction>(aFunction2)
expectType<number>(aFunction2.length)
expectType<Function['toString']>(aFunction2.toString)
expectType<CallableFunction['apply']>(aFunction2.apply)
expectType<CallableFunction['call']>(aFunction2.call)
expectType<CallableFunction['bind']>(aFunction1.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aFunction2.prototype)

expectType<AFunction3>(aFunction3)
expectAssignable<AFunction2>(aFunction3)
expectAssignable<AFunction1>(aFunction3)
expectAssignable<AnyCallableFunction>(aFunction3)
expectNotAssignable<AnyNewableFunction>(aFunction3)
expectAssignable<AnyFunction>(aFunction3)
expectType<number>(aFunction3.length)
expectType<Function['toString']>(aFunction3.toString)
expectType<CallableFunction['apply']>(aFunction3.apply)
expectType<CallableFunction['call']>(aFunction3.call)
expectType<CallableFunction['bind']>(aFunction1.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aFunction3.prototype)

let anyCallableFunction: AnyCallableFunction = aFunction1
expectType<AnyCallableFunction>(anyCallableFunction)
expectAssignable<AnyFunction>(anyCallableFunction)
expectType<number>(anyCallableFunction.length)
expectType<Function['toString']>(anyCallableFunction.toString)
expectType<CallableFunction['apply']>(anyCallableFunction.apply)
expectType<CallableFunction['call']>(anyCallableFunction.call)
expectType<CallableFunction['bind']>(anyCallableFunction.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(anyCallableFunction.prototype)

// without `as AnyFunction`, TS still sees this as AnyCallableFunction
let anyFunction1a: AnyFunction = aFunction1
expectAssignable<AnyFunction>(anyFunction1a)
expectNotType<AnyNewableFunction>(anyFunction1a)
expectType<AnyCallableFunction>(anyFunction1a)

let anyFunction1b: AnyFunction = aFunction1 as AnyFunction
expectType<AnyFunction>(anyFunction1b)
expectType<number>(anyFunction1b.length)
expectType<Function['toString']>(anyFunction1b.toString)
expectType<CallableFunction['apply'] | NewableFunction['apply']>(anyFunction1b.apply)
expectType<CallableFunction['call'] | NewableFunction['call']>(anyFunction1b.call)
expectType<CallableFunction['bind'] | NewableFunction['bind']>(anyFunction1b.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(anyFunction1b.prototype)

expectType<typeof ANewableFunction>(ANewableFunction)
expectAssignable<new (a: string, b: number) => ANewableFunction>(ANewableFunction)
expectNotAssignable<AnyCallableFunction>(ANewableFunction)
expectAssignable<AnyNewableFunction>(ANewableFunction)
expectAssignable<AnyFunction>(ANewableFunction)
expectType<number>(ANewableFunction.length)
expectType<Function['toString']>(ANewableFunction.toString)
expectType<NewableFunction['apply']>(ANewableFunction.apply)
expectType<NewableFunction['call']>(ANewableFunction.call)
expectType<NewableFunction['bind']>(ANewableFunction.bind)
// (***) … but TS knows that the prototype of a constructor is the type of the class
expectType<ANewableFunction>(ANewableFunction.prototype)

// without `as AnyFunction`, TS still sees this as AnyCallableFunction
let anyFunction2a: AnyFunction = ANewableFunction
expectNotType<AnyFunction>(anyFunction2a)
expectAssignable<AnyFunction>(anyFunction2a)
expectNotType<AnyCallableFunction>(anyFunction2a)
expectType<AnyNewableFunction>(anyFunction2a)
// (***) … but TS does not know that the prototype of a constructor is the type of the class
expectNotType<ANewableFunction>(anyFunction2a.prototype)
expectType<any>(anyFunction2a.prototype)

let anyFunction2b: AnyFunction = ANewableFunction as AnyFunction
expectType<AnyFunction>(anyFunction2b)
expectType<number>(anyFunction1b.length)
expectType<Function['toString']>(anyFunction2b.toString)
expectType<CallableFunction['apply'] | NewableFunction['apply']>(anyFunction2b.apply)
expectType<CallableFunction['call'] | NewableFunction['call']>(anyFunction2b.call)
expectType<CallableFunction['bind'] | NewableFunction['bind']>(anyFunction2b.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(anyFunction2b.prototype)
