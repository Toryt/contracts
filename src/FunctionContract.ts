/*
  Copyright 2024–2025 Jan Dockx

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
import type { Postcondition, PostconditionKwargs } from './Postcondition.ts'
import type { UnknownFunction } from './types/UnknownFunction.ts'

export interface ContractFunctionProperties<T extends UnknownFunction> {
  contract: FunctionContract<T>
}

export type ContractFunction<T extends UnknownFunction> = T & ContractFunctionProperties<T>

export interface FunctionContractKwargs<T extends UnknownFunction> {
  post?: Postcondition<T>[]
}

/**
 * A class representing a function contract where the implementation must conform to a specified signature.
 *
 * @template T - The generic signature type defining the contract.
 */
export class FunctionContract<Signature extends UnknownFunction> {
  private readonly _post: ReadonlyArray<Postcondition<Signature>>

  constructor(kwargs: FunctionContractKwargs<Signature>) {
    ok(kwargs, 'kwargs is mandatory')
    strictEqual(typeof kwargs, 'object', 'kwargs must be an object')
    ok(
      kwargs.post === undefined || (Array.isArray(kwargs.post) && kwargs.post.every(p => typeof p === 'function')),
      'optional kwargs.post must be an array of functions as postconditions'
    )

    this._post = Object.freeze(kwargs.post ? kwargs.post.slice() : [])
  }

  public get post(): ReadonlyArray<Postcondition<Signature>> {
    return this._post // safe: has been frozen
  }

  private checkPostconditions(result: unknown, args: Parameters<Signature>): result is ReturnType<Signature> {
    const postconditionKwargs: PostconditionKwargs<Signature> = Object.freeze({ result, args })
    return this._post.every((pc: Postcondition<Signature>) => pc.call(undefined, postconditionKwargs))
  }

  /**
   * Accepts a function whose signature is a behavioral subtype of the contract's signature.
   *
   * @param implFunction - The function to validate.
   * @returns The provided function.
   */
  implementation(implFunction: Signature): ContractFunction<Signature> {
    strictEqual(typeof implFunction, 'function')

    const contract = this

    const contractFunction = function contractFunction(...args: Parameters<Signature>): ReturnType<Signature> {
      const result: unknown = implFunction.apply(undefined, args)
      if (contract.checkPostconditions(result, args.slice() as Parameters<Signature>)) {
        return result
      }
      throw new Error('Postcondition failed')
    }

    const adornedFunc = contractFunction as ContractFunction<Signature>
    adornedFunc.contract = contract

    return adornedFunc
  }
}
