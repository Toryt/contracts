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

import { expectAssignable, expectNotType, expectType } from 'tsd'
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

function EveryFunctionHasAPrototype() {}
expectNotType<AnyFunction>(EveryFunctionHasAPrototype)
expectAssignable<AnyFunction>(EveryFunctionHasAPrototype)
expectType<any>(EveryFunctionHasAPrototype.prototype)
// TODO but if the prototype is any, how can it be assignable to AnyFunction?
expectAssignable<undefined | object>(EveryFunctionHasAPrototype.prototype)

const everyAnyFunctionHasAPrototype: AnyFunction = () => {}
expectType<AnyFunction>(everyAnyFunctionHasAPrototype)
expectAssignable<undefined | object>(everyAnyFunctionHasAPrototype.prototype)
// TODO unclear why this does not work: prototype still is any, although AnyFunction says it is undefined | object
// expectType<undefined | object>(everyAnyFunctionHasAPrototype.prototype)
