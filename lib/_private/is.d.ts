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

import { StackLocation } from '../Location'

export function functionArguments(a: any): a is IArguments;
export function primitive(p: unknown): p is number | string | boolean;
export function stackLocation(location: unknown): location is StackLocation;
export function stack(stack: unknown): stack is string;

/**
 * Discover a `readonly` property.
 *
 * If the property was already known on `Obj`, we now know it is `readonly`, and has the type we new it had.
 * If the property was not yet known on `Obj`, we now know it is `readonly`, and has type `unknown`.
 */
export function frozenOwnProperty<Obj extends object, PropName extends string>(obj: Obj, propName: PropName):
  obj is Obj & {
    readonly [K in PropName]: PropName extends keyof Obj ? typeof obj[PropName] : unknown
  }
