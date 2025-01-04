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

import type { UnknownFunction } from './types/UnknownFunction.ts'

export interface PostconditionKwargs<Signature extends UnknownFunction> {
  readonly result: unknown
  readonly args: Readonly<Parameters<Signature>>
}

export type Postcondition<Signature extends UnknownFunction> = (kwargs: PostconditionKwargs<Signature>) => unknown

// MUDO temporary

function myFunction(a: number[], b: string, c?: boolean, ...rest: (number | string)[]): number {
  return a.length + b.length + (c ? 1 : 0) + rest.length
}

function checkPostconditions<Signature extends UnknownFunction>(
  pcs: ReadonlyArray<Postcondition<Signature>>,
  result: unknown,
  args: Parameters<Signature>
): result is ReturnType<Signature> {
  const postconditionKwargs: PostconditionKwargs<Signature> = Object.freeze({ result, args })
  return pcs.every((pc: Postcondition<Signature>) => pc.call(undefined, postconditionKwargs))
}

function implementation<Signature extends UnknownFunction>(
  postconditions: ReadonlyArray<Postcondition<Signature>>,
  impl: Signature
) {
  return function contractFunction(...args: Parameters<Signature>): ReturnType<Signature> {
    const result: unknown = impl.apply(undefined, args)
    if (checkPostconditions<Signature>(postconditions, result, args.slice() as Parameters<Signature>)) {
      return result
    }
    throw new Error('PC failed')
  }
}

function generalConditionA({ args }: { args: Readonly<unknown[]> }) {
  return args.length > 2
}

function generalConditionB({ args: [a] }: { args: Readonly<[number[]]> }) {
  return a[0] !== undefined && a[0] < 0
}

const contractFunction = implementation(
  [
    kwargs =>
      kwargs.result ===
      kwargs.args[0].length + kwargs.args[1].length + (kwargs.args[2] ? 1 : 0) + kwargs.args.length - 3,
    ({ result, args }) => result === args[0].length + args[1].length + (args[2] ? 1 : 0) + args.length - 3,
    ({ result, args: [a, b, c, ...rest] }) => result === a.length + b.length + (c ? 1 : 0) + rest.length,
    ({ result, args: [a, b, c, d] }) => result === a.length + b.length + (c ? 1 : 0) + +(d ? 2 : 1),
    ({ result, args: [a, b, c] }) => result === a.length + b.length + (c ? 1 : 0),
    ({ result, args: [a, b] }) => result === a.length + b.length,
    ({ result, args: [a] }) => typeof result === 'number' && result >= a.length,
    ({ result }) => Number.isInteger(result),
    generalConditionA,
    ({ args: [a] }) => generalConditionB({ args: [a] })
  ],
  myFunction
)
console.log(contractFunction([0], ''))
console.log(contractFunction([0], '', true))
console.log(contractFunction([0], '', true, 'str', 1))
