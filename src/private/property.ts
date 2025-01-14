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

import { isTruePrimitive } from './is.ts'
import { notStrictEqual, ok, strictEqual } from 'assert'

type WithReadonlyProperty<O extends object | unknown, PropertyName extends string, PropertyType> = O & {
  readonly [P in PropertyName]: PropertyType
}

export function setAndFreeze<O extends object, PropertyName extends string, PropertyType>(
  obj: O,
  propertyName: PropertyName,
  value?: PropertyType
): WithReadonlyProperty<O, PropertyName, PropertyType> {
  ok(!isTruePrimitive(obj))
  strictEqual(typeof propertyName, 'string')

  Object.defineProperty(obj, propertyName, {
    configurable: false,
    enumerable: true,
    writable: false,
    value
  })

  return obj as WithReadonlyProperty<O, PropertyName, PropertyType>
}

export function configurableDerived<
  O extends Object,
  PropertyName extends string,
  Derivation extends (this: never) => unknown
>(
  obj: O,
  propertyName: PropertyName,
  derivation: Derivation
): WithReadonlyProperty<O, PropertyName, ReturnType<Derivation>> {
  ok(obj)
  ok(!isTruePrimitive(obj))
  strictEqual(typeof propertyName, 'string')
  strictEqual(typeof derivation, 'function')

  Object.defineProperty(obj, propertyName, {
    configurable: true,
    enumerable: true,
    get: derivation
  })

  return obj as WithReadonlyProperty<O, PropertyName, ReturnType<Derivation>>
}

export function frozenDerived<
  O extends Object,
  PropertyName extends string,
  Derivation extends (this: never) => unknown
>(
  obj: O,
  propertyName: PropertyName,
  derivation: Derivation
): WithReadonlyProperty<O, PropertyName, ReturnType<Derivation>> {
  ok(obj)
  ok(!isTruePrimitive(obj))
  strictEqual(typeof propertyName, 'string')
  strictEqual(typeof derivation, 'function')

  Object.defineProperty(obj, propertyName, {
    configurable: false,
    enumerable: true,
    get: derivation
  })

  return obj as WithReadonlyProperty<O, PropertyName, ReturnType<Derivation>>
}

export function frozenReadOnlyArray<
  O extends Object,
  PropertyName extends string,
  PrivatePropertyName extends string,
  ElementType extends unknown
>(
  obj: O,
  propertyName: PropertyName,
  privatePropName: PrivatePropertyName extends PropertyName ? never : PrivatePropertyName
): WithReadonlyProperty<O, PropertyName, ElementType[]> {
  ok(obj)
  ok(!isTruePrimitive(obj))
  strictEqual(typeof propertyName, 'string')
  strictEqual(typeof privatePropName, 'string')
  notStrictEqual(propertyName, privatePropName)

  return frozenDerived(
    obj,
    propertyName,
    function (this: { readonly [P in PrivatePropertyName]: ReadonlyArray<ElementType> }): ElementType[] {
      return this[privatePropName].slice()
    }
  )
}
