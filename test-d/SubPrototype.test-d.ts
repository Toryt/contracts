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

import { expectAssignable, expectError, expectNotAssignable, expectNotType, expectType } from 'tsd'
import { AnyCallableFunction, AnyFunction, AnyNewableFunction, SubPrototype } from '../types'

/* Force a regular function to be a constructor for TS
   See https://stackoverflow.com/posts/34651887/revisions */

interface SuperType {
  brandSuperType: 'SuperType'
}
const SuperConstructor: {new (): SuperType} = function SuperConstructor(this: SuperType) {
  this.brandSuperType = 'SuperType'
} as any

expectType<{new (): SuperType}>(SuperConstructor)
expectType<typeof SuperConstructor>(SuperConstructor)
expectAssignable<AnyFunction>(SuperConstructor)
expectNotAssignable<AnyCallableFunction>(SuperConstructor)
expectAssignable<AnyNewableFunction>(SuperConstructor)

const superThing: SuperType = new SuperConstructor()
expectType<SuperType>(superThing)

expectType<any>(SuperConstructor.prototype)

interface SubType extends SuperType {
  brandSubType: 'SubType'
}
const SubConstructor: {new (): SubType} = function SubConstructor(this: SubType) {
  SuperConstructor.call(this)
  this.brandSubType = 'SubType'
} as any

SubConstructor.prototype = Object.create(SuperConstructor.prototype)
SubConstructor.prototype.constructor = SubConstructor

expectType<{new (): SubType}>(SubConstructor)
expectType<typeof SubConstructor>(SubConstructor)
expectNotType<typeof SuperConstructor>(SubConstructor)
expectAssignable<typeof SuperConstructor>(SubConstructor)
expectAssignable<AnyFunction>(SubConstructor)
expectNotAssignable<AnyCallableFunction>(SubConstructor)
expectAssignable<AnyNewableFunction>(SubConstructor)

let subThing: SubType = new SubConstructor()
expectType<SubType>(subThing)
expectAssignable<SuperType>(subThing)
expectNotAssignable<SubType>(superThing)

expectType<any>(SubConstructor.prototype)

type SubConstructorPrototype = SuperType & {
  constructor: typeof SubConstructor
}
// TS says SubClass.prototype.constructor is Function, but we know better
const subConstructorPrototype = SubConstructor.prototype as SubConstructorPrototype

// The important bit
expectType<SubPrototype<typeof SubConstructor, typeof SuperConstructor>>(subConstructorPrototype)

class SubConstructorClass extends SuperConstructor {
  brandSubType = 'SubConstructorClass'
}

expectType<typeof SubConstructorClass>(SubConstructorClass)
expectNotType<typeof SuperConstructor>(SubConstructorClass)
expectAssignable<typeof SuperConstructor>(SubConstructorClass)
expectAssignable<AnyFunction>(SubConstructorClass)
expectNotAssignable<AnyCallableFunction>(SubConstructorClass)
expectAssignable<AnyNewableFunction>(SubConstructorClass)

let subThing2: SubConstructorClass = new SubConstructorClass()
expectType<SubConstructorClass>(subThing2)
expectAssignable<SuperType>(subThing2)
expectNotAssignable<SubType>(subThing2)
expectNotAssignable<SubType>(superThing)

expectType<SubConstructorClass>(SubConstructorClass.prototype)
expectNotAssignable<SubType>(SubConstructorClass.prototype)
expectAssignable<SuperType>(SubConstructorClass.prototype)

// NOTE: TS says the type of `SubClass.prototype.constructor` is Function; this is wrong, but we have to live with it
expectNotType<typeof SubConstructorClass>(SubConstructorClass.prototype.constructor)
expectType<Function>(SubConstructorClass.prototype.constructor)

type SubConstructorClassPrototype = SuperType & {
  constructor: typeof SubConstructorClass
}
// TS says SubClass.prototype.constructor is Function, but we know better
const SubConstructorClassPrototype = SubConstructorClass.prototype as unknown as SubConstructorClassPrototype

// The important bit
expectType<SubPrototype<typeof SubConstructorClass, typeof SuperConstructor>>(SubConstructorClass.prototype)

class SuperClass {
  prop1: string = 'lala'
  prop2: number = 42
  constructor() {}
}

expectAssignable<AnyFunction>(SuperClass)
expectType<SuperClass>(SuperClass.prototype)
expectAssignable<object>(SuperClass.prototype)

class SubClass extends SuperClass {
  constructor (a:string) {
    super();
    this.prop1 = a
  }
}

expectAssignable<AnyFunction>(SubClass)
expectType<SubClass>(SubClass.prototype)
expectAssignable<SuperClass>(SubClass.prototype)
expectAssignable<object>(SubClass.prototype)

expectType<SubClass>(SubClass.prototype)
// NOTE: TS says the type of `SubClass.prototype.constructor` is Function; this is wrong, but we have to live with it
expectNotType<typeof SubClass>(SubClass.prototype.constructor)
expectType<Function>(SubClass.prototype.constructor)

type SubClassPrototype = SuperClass & {
  constructor: typeof SubClass
}
// TS says SubClass.prototype.constructor is Function, but we know better
const subClassPrototype = SubClass.prototype as SubClassPrototype

// The important bit
expectType<SubPrototype<typeof SubClass, typeof SuperClass>>(subClassPrototype)
expectAssignable<SubPrototype<typeof SubClass, typeof SuperClass>>({
  ...SuperClass.prototype,
  constructor: SubClass
})

expectNotType<SubPrototype<typeof SubClass, typeof SuperClass>>(SuperClass.prototype)
