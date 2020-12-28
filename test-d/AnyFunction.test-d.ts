/*
 Copyright 2016 - 2020 by Jan Dockx

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

import { expectAssignable, expectError, expectNotType, expectType } from 'tsd'
import { AnyFunction } from '../types'

interface SomeObject {
  aProperty: number
}

type AFunction1 = (this: SomeObject, a: string, b: number) => string

function aFunction1 (this: SomeObject, a: string, b: number): string { return this.aProperty + a + b }
expectType<AFunction1>(aFunction1)
expectAssignable<AnyFunction>(aFunction1)

type AFunction2 = (a: string, b: number) => string
const aFunction2: AFunction2 = function aFunction2 (a, b) { return `${a}${b} more text` }
expectType<AFunction2>(aFunction2)
expectAssignable<AFunction1>(aFunction2)
expectAssignable<AnyFunction>(aFunction2)

type AFunction3 = (a: string) => 'truth' | 'dare'
const aFunction3: AFunction3 = function aFunction3 (a) { return a > 'm' ? 'truth' : 'dare' }
expectType<AFunction3>(aFunction3)
expectAssignable<AFunction2>(aFunction3)
expectAssignable<AFunction1>(aFunction3)
expectAssignable<AnyFunction>(aFunction3)

let anyFunction: AnyFunction = aFunction1
expectType<AnyFunction>(anyFunction)
expectType<CallableFunction['apply']>(anyFunction.apply)
expectType<CallableFunction['call']>(anyFunction.call)
// MUDO expectType<CallableFunction['bind']>(anyFunction.call)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(anyFunction.prototype)
expectType<Function['toString']>(anyFunction.toString)
expectType<number>(anyFunction.length)

class A {
  constructor(a: string, b: number) {}
}
expectType<typeof A>(A)
expectAssignable<new (a: string, b: number) => A>(A)
expectAssignable<AnyFunction>(A)
// (***) … but TS knows that the prototype of a constructor is the type of the class
expectType<A>(A.prototype)

let anyConstructor: AnyFunction = A
expectType<AnyFunction>(anyConstructor)
expectError<CallableFunction['apply']>(anyConstructor.apply) // MUDO this fails; why? the static type is the same as above
expectType<NewableFunction['apply']>(anyConstructor.apply)
expectType<NewableFunction['call']>(anyConstructor.call)
// MUDO expectType<NewableFunction['bind']>(anyConstructor.call)
expectType<any>(anyConstructor.prototype)
expectType<Function['toString']>(anyConstructor.toString)
expectType<number>(anyConstructor.length)
