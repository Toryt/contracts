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

import { strictEqual } from 'node:assert'

export interface ContractFunctionProperties<T extends (...args: never[]) => unknown> {
  contract: FunctionContract<T>
}

export type ContractFunction<T extends (...args: never[]) => unknown> = T & ContractFunctionProperties<T>

export type Postcondition<T extends (...args: never[]) => unknown> = (
  args: Parameters<T>,
  result: ReturnType<T>
) => boolean

export interface FunctionContractKwargs<T extends (...args: never[]) => unknown> {
  post?: Postcondition<T>[]
}

/**
 * A class representing a function contract where the implementation
 * must conform to a specified signature.
 *
 * @template T - The generic signature type defining the contract.
 */
export class FunctionContract<T extends (...args: never[]) => unknown> {
  public readonly post: ReadonlyArray<Postcondition<T>>

  constructor(kwargs: FunctionContractKwargs<T> = {}) {
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