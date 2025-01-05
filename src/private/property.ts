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

import { primitive } from './is.ts'
import { notStrictEqual, ok, strictEqual } from 'assert'

export function setAndFreeze<
  PropertyName extends string,
  PropertyType,
  O extends { readonly PropertyName: PropertyType }
>(obj: O, propertyName: PropertyName, value: PropertyType): void {
  ok(!primitive(obj))
  strictEqual(typeof propertyName, 'string')

  Object.defineProperty(obj, propertyName, {
    configurable: false,
    enumerable: true,
    writable: false,
    value
  })
}

export function configurableDerived<
  PropertyName extends string,
  PropertyType,
  Prototype extends { readonly PropertyName: PropertyType }
>(prototype: Prototype, propertyName: PropertyName, derivation: (this: Prototype) => PropertyType): void {
  ok(prototype)
  ok(!primitive(prototype))
  strictEqual(typeof propertyName, 'string')
  strictEqual(typeof derivation, 'function')

  Object.defineProperty(prototype, propertyName, {
    configurable: true,
    enumerable: true,
    get: derivation
  })
}

export function frozenDerived<
  PropertyName extends string,
  PropertyType,
  Prototype extends { readonly PropertyName: PropertyType }
>(prototype: Prototype, propertyName: PropertyName, derivation: (this: Prototype) => PropertyType): void {
  ok(prototype)
  ok(!primitive(prototype))
  strictEqual(typeof propertyName, 'string')
  strictEqual(typeof derivation, 'function')

  Object.defineProperty(prototype, propertyName, {
    configurable: false,
    enumerable: true,
    get: derivation
  })
}

export function frozenReadOnlyArray<
  PropertyName extends string,
  PrivatePropertyName extends string,
  ElementType,
  Prototype extends Record<PrivatePropertyName, ReadonlyArray<ElementType>> &
    Record<PropertyName, ElementType[]> & { readonly PropertyName: ElementType[] }
>(prototype: Prototype, propertyName: PropertyName, privatePropName: PrivatePropertyName): void {
  ok(prototype)
  ok(!primitive(prototype))
  strictEqual(typeof propertyName, 'string')
  strictEqual(typeof privatePropName, 'string')
  notStrictEqual(propertyName, privatePropName)

  frozenDerived(prototype, propertyName, function (this: Prototype): ReadonlyArray<ElementType> {
    return this[privatePropName].slice()
  })
}
