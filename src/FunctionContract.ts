/*
  Copyright 2024 Jan Dockx

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

import { ok, strictEqual } from 'node:assert'
import type { StartingTuples } from './StartingTuples'
import type { UnknownFunction } from './types/UnknownFunction'

/**
 * Represents the most restrictive function type in TypeScript.
 *
 * A `NeverFunction` is a function that:
 *
 * * Takes no arguments (no valid arguments are allowed).
 * * Returns `never` (indicating it never successfully returns a value).
 *
 * This is the “bottom type” for function types that are still functions, meaning it is the most specific function type,
 * and no other function type is assignable to it unless it matches exactly.
 *
 * However, the “true bottom type” in TypeScript is still `never`. Even a `NeverFunction` is not assignable to `never`,
 * as `NeverFunction` remains a function type.
 *
 * Example:
 * ```typescript
 * const aNeverFunction: NeverFunction = function() {
 *   throw new Error("This function never returns")
 * }
 *
 * // Valid assignment:
 * expectAssignable<NeverFunction>(aNeverFunction);
 *
 * // Invalid assignments:
 * expectNotAssignable<NeverFunction>((a: number): never => { throw new Error() })
 * expectNotAssignable<NeverFunction>(() => 42) // Does not return `never`
 * ```
 */
export type NeverFunction = () => never

export interface ContractFunctionProperties<T extends UnknownFunction> {
  contract: FunctionContract<T>
}

export type ContractFunction<T extends UnknownFunction> = T & ContractFunctionProperties<T>

export type Postcondition<T extends UnknownFunction> =
  StartingTuples<Parameters<T>> extends infer U // infer the union of tuples
    ? U extends unknown[] // distribute over each tuple in the union
      ? (args: U, result: ReturnType<T>) => unknown // create a function type for each tuple
      : never // fallback for invalid tuples (not needed here)
    : never // fallback for invalid StartingTuples

export interface FunctionContractKwargs<T extends UnknownFunction> {
  post?: Postcondition<T>[]
}

/**
 * A class representing a function contract where the implementation
 * must conform to a specified signature.
 *
 * @template T - The generic signature type defining the contract.
 */
export class FunctionContract<T extends UnknownFunction> {
  public readonly post: ReadonlyArray<Postcondition<T>>

  constructor(kwargs: FunctionContractKwargs<T>) {
    ok(kwargs, 'kwargs is mandatory')
    strictEqual(typeof kwargs, 'object', 'kwargs must be an object')
    ok(
      kwargs.post === undefined || (Array.isArray(kwargs.post) && kwargs.post.every(p => typeof p === 'function')),
      'optional kwargs.post is an array'
    )

    this.post = Object.freeze(kwargs.post ? kwargs.post.slice() : [])
  }

  /**
   * Accepts a function whose signature is a behavioral subtype of the contract's signature.
   *
   * @param implFunction - The function to validate.
   * @returns The provided function.
   */
  implementation(implFunction: T): ContractFunction<T> {
    strictEqual(typeof implFunction, 'function')

    const adornedFunc = implFunction as ContractFunction<T>
    adornedFunc.contract = this
    return adornedFunc
  }
}
