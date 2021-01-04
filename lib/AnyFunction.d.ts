
/*
  Copyright 2020 - 2021 by Jan Dockx

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

/**
 * Any function, arrow, or non-arrow.
 *
 * Note that {@link Function.prototype} is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do
 * about that.
 */
// tslint:disable-next-line:no-any
export type AnyCallableFunction = (this: never, ...args: never[]) => unknown

/**
 * Any constructor (notably, created with the `class` syntax).
 *
 * Note that {@link Function.prototype} is the type of the object being constructed.
 *
 * NOTE: I cannot find where this might be defined in the typescript `*.d.ts` files.
 */
// tslint:disable-next-line:no-any
export type AnyNewableFunction = new (...args: never[]) => unknown

/**
 * Any function, arrow, or non-arrow, or a constructor defined with the `class` syntax.
 *
 * Note that {@link Function.prototype} is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do
 * about that.
 */
// tslint:disable-next-line:no-any
export type AnyFunction = AnyCallableFunction | AnyNewableFunction
