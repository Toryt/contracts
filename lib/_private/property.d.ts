/*
 Copyright 2021 - 2021 by Jan Dockx

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

export function setAndFreeze<Obj extends object, PropName extends string, V extends unknown> (
  obj: Obj,
  propName: PropName,
  value: V
): asserts obj is Obj & {
  readonly [K in PropName]: V
};

export function configurableDerived<
  Obj extends object,
  PropName extends string,
  V extends unknown,
> (
  prototype: Obj,
  propertyName: PropName,
  derivation: (this: Obj) => V
): asserts prototype is Obj & {
  readonly [K in PropName]: V
}
export function frozenDerived(prototype: any, propertyName: any, derivation: any): void;
export function frozenReadOnlyArray(prototype: any, propertyName: any, privatePropName: any): void;
