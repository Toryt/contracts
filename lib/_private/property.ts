/*
  Copyright 2016 - 2018 by Jan Dockx

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

import { notEqual } from 'assert'

export function setAndFreeze(obj: object, propName: string, value: any): void {
  Object.defineProperty(obj, propName, {
    configurable: false,
    enumerable: true,
    writable: false,
    value: value
  })
}

export function configurableDerived(
  prototype: object,
  propertyName: string,
  derivation: () => any
): void {
  Object.defineProperty(prototype, propertyName, {
    configurable: true,
    enumerable: true,
    get: derivation,
    set: undefined
  })
}

export function frozenDerived(
  prototype: object,
  propertyName: string,
  derivation: () => any
): void {
  Object.defineProperty(prototype, propertyName, {
    configurable: false,
    enumerable: true,
    get: derivation,
    set: undefined
  })
}

export interface ArrayPropertyHolder {
  [key: string]: any
}

export function frozenReadOnlyArray(
  prototype: object,
  propertyName: string,
  privatePropName: string
): void {
  notEqual(propertyName, privatePropName)

  frozenDerived(prototype, propertyName, function(this: ArrayPropertyHolder) {
    return this[privatePropName].slice()
  })
}
