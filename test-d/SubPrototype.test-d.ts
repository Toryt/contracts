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
import { AnyFunction, SubPrototype } from '../types'

function EveryFunctionHasAPrototype() {}
expectAssignable<AnyFunction>(EveryFunctionHasAPrototype)
expectAssignable<object>(EveryFunctionHasAPrototype.prototype)

const everyAnyFunctionHasAPrototype: AnyFunction = () => {}
expectType<AnyFunction>(everyAnyFunctionHasAPrototype)
expectAssignable<undefined | object>(everyAnyFunctionHasAPrototype.prototype)

// TODO unclear why this does not work: prototype still is any, although AnyFunction says it is undefined | object
// expectType<undefined | object>(everyAnyFunctionHasAPrototype.prototype)


function SuperClass() {}

const superProto = {
  prop1: 'lala',
  prop2: 42,
  constructor: SuperClass
}

SuperClass.prototype = superProto

function SubClass(a: string) {
  this.prop1 = a
}

SubClass.prototype = new SuperClass()
SubClass.prototype.constructor = SubClass

expectType<SubPrototype<typeof SubClass, typeof SuperClass>>(SubClass.prototype)
expectType<SubPrototype<typeof SubClass, typeof SuperClass>>({
  ...superProto,
  constructor: SubClass
})

expectNotType<SubPrototype<typeof SubClass, typeof SuperClass>>(superProto)
