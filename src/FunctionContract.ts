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
import type { StartingTuples } from './util/StartingTuples.ts'
import type { UnknownFunction } from './types/UnknownFunction.ts'

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
