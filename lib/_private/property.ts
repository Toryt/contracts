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

import {notStrictEqual, ok, strictEqual} from "assert";
import {primitive} from "./is";

export function setAndFreeze<O extends {}> (this:void, obj: O, propName: PropertyKey, value: any): void {
  ok(!primitive(obj));
  strictEqual(typeof propName, 'string');

  Object.defineProperty(obj, propName, {
    configurable: false,
    enumerable: true,
    writable: false,
    value: value
  });
}

export type Derivation<O extends {}, T> = (this: O) => T;

export function configurableDerived<O extends {}, R> (this:void, prototype: O, propertyName: PropertyKey, derivation: Derivation<O, R>): void {
  ok(prototype);
  ok(!primitive(prototype));
  strictEqual(typeof propertyName, 'string');
  strictEqual(typeof derivation, 'function');

  Object.defineProperty(prototype, propertyName, {
    configurable: true,
    enumerable: true,
    get: derivation,
    set: undefined
  });
}

export function frozenDerived<O extends {}, T> (this:void, prototype: O, propertyName: PropertyKey, derivation: Derivation<O, T>): void {
  ok(prototype);
  ok(!primitive(prototype));
  strictEqual(typeof propertyName, 'string');
  strictEqual(typeof derivation, 'function');

  Object.defineProperty(prototype, propertyName, {
    configurable: false,
    enumerable: true,
    get: derivation,
    set: undefined
  });
}

export function frozenReadOnlyArray<T, PK extends PropertyKey, O extends {[key in PK]: Array<T>}> (this:void, prototype: O, propertyName: PropertyKey, privatePropName: PK): void {
  ok(prototype);
  ok(!primitive(prototype));
  strictEqual(typeof propertyName, 'string');
  strictEqual(typeof privatePropName, 'string');
  notStrictEqual(propertyName, privatePropName);

  frozenDerived(prototype, propertyName, function derivation (this: O): Array<T> {
    const original: Array<T> = this[privatePropName];
    return original.slice();
  });
}
