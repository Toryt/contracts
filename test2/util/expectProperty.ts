/*
  Copyright 2016–2025 Jan Dockx

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

import should from 'should'

export function expectOwnFrozenProperty(subject: object, propertyName: string): unknown {
  const propertyDescriptor = Object.getOwnPropertyDescriptor(subject, propertyName)
  should(propertyDescriptor).be.ok()
  should(propertyDescriptor!.enumerable).be.true()
  should(propertyDescriptor!.configurable).be.false()
  should(propertyDescriptor!.writable).be.false()

  const record = subject as Record<string, unknown>
  const failFunction = (): void => {
    record[propertyName] = 42 + ' some outlandish other value'
  }

  failFunction.should.throw(TypeError)

  return record[propertyName]
}

function prototypeThatHasOwnPropertyDescriptor<S extends object | null | undefined, PropertyName extends string>(
  subject: S,
  propertyName: PropertyName
): S extends null | undefined ? S : S & { [K in PropertyName]: unknown } {
  if (subject === null && typeof subject === 'undefined') {
    return subject as S extends null | undefined ? S : never
  }
  if (Object.getOwnPropertyDescriptor(subject, propertyName)) {
    return subject as S extends null | undefined ? never : S & { [K in PropertyName]: unknown }
  }
  return prototypeThatHasOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyName)
}

function expectDerivedPropertyOnAPrototype<PropertyName extends string>(
  subject: object,
  propertyName: PropertyName,
  configurable: boolean
): unknown {
  const prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName)
  const propertyDescriptor = Object.getOwnPropertyDescriptor(prototype, propertyName)
  should(propertyDescriptor).be.ok()
  should(propertyDescriptor!.enumerable).be.true()
  should(propertyDescriptor!.configurable).be.equal(configurable)
  should(propertyDescriptor).not.have.property('writable')
  should(propertyDescriptor!.get).be.a.Function()
  should(propertyDescriptor!.set).not.be.ok()

  return (subject as { [K in PropertyName]: unknown })[propertyName]
}

export function expectConfigurableDerivedPropertyOnAPrototype(subject: object, propertyName: string): unknown {
  return expectDerivedPropertyOnAPrototype(subject, propertyName, true)
}

export function expectFrozenDerivedPropertyOnAPrototype(subject: object, propertyName: string): unknown {
  return expectDerivedPropertyOnAPrototype(subject, propertyName, false)
}

export function expectFrozenPropertyOnAPrototype(subject: object, propertyName: string): void {
  const prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName)
  should(prototype).be.ok()
  expectOwnFrozenProperty(prototype!, propertyName)
}

export function expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(
  subject: object,
  propName: string,
  privatePropName: string
): unknown[] {
  should(subject).have.ownProperty(privatePropName) // array not shared
  const value = expectOwnFrozenProperty(subject, privatePropName)
  should(value).be.an.Array()
  const derivedValue = expectFrozenDerivedPropertyOnAPrototype(subject, propName)
  should(derivedValue).be.an.Array()
  const record = subject as Record<string, unknown>
  const failFunction = function (): void {
    record[propName] = 42 + ' some outlandish other value'
  }
  failFunction.should.throw(TypeError)

  return derivedValue as unknown[]
}

export function expectToBeArrayOfFunctions(a: unknown): asserts a is Function[] {
  should(a).be.an.Array()
  const arr = a as unknown[]
  arr.forEach(element => {
    should(element).be.a.Function()
  })
}

// MUDO unused?
// function propertyIsWritable(object: object, propertyName: string): boolean {
//   const prototype = prototypeThatHasOwnPropertyDescriptor(object, propertyName)
//   const pd = prototype && Object.getOwnPropertyDescriptor(prototype, propertyName)
//   return !pd || pd.writable === true
// }
