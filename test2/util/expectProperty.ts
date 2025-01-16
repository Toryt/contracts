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

export function expectOwnFrozenProperty<S extends object, PropertyName extends string>(
  subject: S,
  propertyName: PropertyName
): { subject: S & { [K in PropertyName]: unknown }; value: unknown } {
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

  return { subject: subject as S & { [K in PropertyName]: unknown }, value: record[propertyName] }
}

function prototypeThatHasOwnPropertyDescriptor(
  subject: object | null | undefined,
  propertyName: string
): object | null | undefined {
  if (!subject) {
    return subject
  }
  if (Object.getOwnPropertyDescriptor(subject, propertyName)) {
    return subject
  }
  return prototypeThatHasOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyName)
}

function expectDerivedPropertyOnAPrototype(subject: object, propertyName: string, configurable: boolean): void {
  const prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName)
  const propertyDescriptor = Object.getOwnPropertyDescriptor(prototype, propertyName)
  should(propertyDescriptor).be.ok()
  should(propertyDescriptor!.enumerable).be.true()
  should(propertyDescriptor!.configurable).be.equal(configurable)
  should(propertyDescriptor).not.have.property('writable')
  should(propertyDescriptor!.get).be.a.Function()
  should(propertyDescriptor!.set).not.be.ok()
}

export function expectConfigurableDerivedPropertyOnAPrototype(subject: object, propertyName: string): void {
  expectDerivedPropertyOnAPrototype(subject, propertyName, true)
}

export function expectFrozenDerivedPropertyOnAPrototype(subject: object, propertyName: string): void {
  expectDerivedPropertyOnAPrototype(subject, propertyName, false)
}

export function expectFrozenPropertyOnAPrototype(subject: object, propertyName: string): void {
  const prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName)
  should(prototype).be.ok()
  expectOwnFrozenProperty(prototype!, propertyName)
}

export function expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(
  subject: Record<string, unknown>,
  propName: string,
  privatePropName: string
): void {
  should(subject).have.ownProperty(privatePropName) // array not shared
  const { value } = expectOwnFrozenProperty(subject, privatePropName)
  should(value).be.an.Array()
  expectFrozenDerivedPropertyOnAPrototype(subject, propName)
  const record = subject as Record<string, unknown>
  const failFunction = function (): void {
    record[propName] = 42 + ' some outlandish other value'
  }
  failFunction.should.throw(TypeError)
}

export function expectToBeArrayOfFunctions(a: unknown): void {
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
