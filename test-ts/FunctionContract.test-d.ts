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

import { expectType, expectError, expectAssignable, expectNotAssignable } from 'tsd'
import { FunctionContract, type ContractFunction } from '../src'
import type { Postcondition } from '../src/FunctionContract'

type Signature = (a: number, b: number) => number

// Postcondition
// Valid postconditions
const validPost1: Postcondition<Signature> = (args: [number, number], result: number) => result > args[0]
const validPost2: Postcondition<Signature> = (args: [number], result: number) => result > 0
const validPost3: Postcondition<Signature> = (args: [], result: number) => result > 0
const validPost4: Postcondition<Signature> = (args: [unknown, number], result: number) => result > 0

// Validate types
expectAssignable<Postcondition<Signature>>(validPost1)
expectAssignable<Postcondition<Signature>>(validPost2)
expectAssignable<Postcondition<Signature>>(validPost3)
expectAssignable<Postcondition<Signature>>(validPost4)
expectAssignable<Postcondition<Signature>>((args: [number, number], result: number) => 42)
expectAssignable<Postcondition<Signature>>((args: [number, number], result: number) => undefined)
expectAssignable<Postcondition<Signature>>((args: [number, number], result: number) => null)
expectAssignable<Postcondition<Signature>>((args: [number, number], result: number) => '')
expectAssignable<Postcondition<Signature>>((args: [number, number], result: number) => 'a string')
expectAssignable<Postcondition<Signature>>((args: [number, number], result: number) => {})
expectAssignable<Postcondition<Signature>>((args: [number, number], result: number): unknown => 'mystery')

// Sadly also ok
expectAssignable<Postcondition<Signature>>((args: [number, number], result: number): never => {
  throw new Error()
})

// Invalid postconditions
expectNotAssignable<Postcondition<Signature>>((args: [string, number], result: number) => result > 0)
expectNotAssignable<Postcondition<Signature>>((args: [number, never], result: number) => result > 0)
expectNotAssignable<Postcondition<Signature>>((args: [number, number, string], result: number) => result > 0)
expectNotAssignable<Postcondition<Signature>>((args: [number, number], result: string) => result === 'worf')

const post: Array<Postcondition<Signature>> = [
  (args: Array<number>, result: number): boolean => result > (args[0] ?? 0),
  (args: Array<number>, result: number): boolean => result === args[1]
]

// Constructor

// Default postconditions
const contractDefault = new FunctionContract<Signature>({})
expectType<FunctionContract<Signature>>(contractDefault)
expectType<ReadonlyArray<Postcondition<Signature>>>(contractDefault.post)

// With postconditions
const contractWithPost = new FunctionContract<Signature>({ post })
expectType<FunctionContract<Signature>>(contractWithPost)
expectType<ReadonlyArray<Postcondition<Signature>>>(contractWithPost.post)

// broader arguments
const broaderArgumentsInPost = new FunctionContract<Signature>({
  post: [(args: [unknown, number], result: number): boolean => typeof args[0] === 'number']
})
expectType<FunctionContract<Signature>>(broaderArgumentsInPost)
expectType<ReadonlyArray<Postcondition<Signature>>>(broaderArgumentsInPost.post)

const lessArgumentsInPost = new FunctionContract<Signature>({
  post: [(args: [number], result: number): boolean => true]
})
expectType<FunctionContract<Signature>>(lessArgumentsInPost)
expectType<ReadonlyArray<Postcondition<Signature>>>(lessArgumentsInPost.post)

const broaderReturnTypeInPost = new FunctionContract<Signature>({
  post: [(args: [number, number], result: unknown): boolean => typeof result === 'number']
})
expectType<FunctionContract<Signature>>(broaderReturnTypeInPost)
expectType<ReadonlyArray<Postcondition<Signature>>>(broaderReturnTypeInPost.post)

const stringPostResult = new FunctionContract<Signature>({
  post: [(args: [number, number], result: unknown): string => typeof result]
})
expectType<FunctionContract<Signature>>(stringPostResult)
expectType<ReadonlyArray<Postcondition<Signature>>>(stringPostResult.post)

const numberPostResult = new FunctionContract<Signature>({
  post: [(args: [number, number], result: unknown): number | undefined => args[0]]
})
expectType<FunctionContract<Signature>>(numberPostResult)
expectType<ReadonlyArray<Postcondition<Signature>>>(numberPostResult.post)

const objectPostResult = new FunctionContract<Signature>({
  post: [(args: [number, number], result: unknown): object | null => null]
})
expectType<FunctionContract<Signature>>(objectPostResult)
expectType<ReadonlyArray<Postcondition<Signature>>>(objectPostResult.post)

const unknownPostResult = new FunctionContract<Signature>({
  post: [(args: [number, number], result: unknown): unknown => null]
})
expectType<FunctionContract<Signature>>(unknownPostResult)
expectType<ReadonlyArray<Postcondition<Signature>>>(unknownPostResult.post)

// Sadly valid
const sadlyValidPostCondition = new FunctionContract<Signature>({
  post: [(args: [number, number], result: number): any => 42]
})
expectType<FunctionContract<Signature>>(sadlyValidPostCondition)
expectType<ReadonlyArray<Postcondition<Signature>>>(sadlyValidPostCondition.post)

// wrong arguments
expectError(
  new FunctionContract<Signature>({
    post: [(args: [string, number], result: number): boolean => result.startsWith(args[0])]
  })
)
expectError(
  new FunctionContract<Signature>({
    post: [(args: [number, never], result: number): boolean => result.startsWith(args[0])]
  })
)
expectError(
  new FunctionContract<Signature>({
    post: [(args: [number, number, string], result: number): boolean => result.startsWith(args[0])]
  })
)

// wrong return type
expectError(
  new FunctionContract<Signature>({
    post: [(args: [number, number], result: string): boolean => result.startsWith(args[0])]
  })
)
expectError(
  new FunctionContract<Signature>({
    post: [(args: [number, number], result: never): boolean => result.startsWith(args[0])]
  })
)

// Invalid argument for postconditions
expectError(
  new FunctionContract<Signature>({
    post: [(args: [number, number], result: string) => result === 'worf']
  })
)

// `implementation`

const contract = new FunctionContract<Signature>({})

// Valid usage

const exactSignature = contract.implementation((a: number, b: number): number => a * b)
expectType<ContractFunction<Signature>>(exactSignature)
expectType<FunctionContract<Signature>>(exactSignature.contract)

const lessArguments = contract.implementation((a: number): number => a)
expectType<ContractFunction<Signature>>(lessArguments)
expectType<FunctionContract<Signature>>(lessArguments.contract)

const noArguments = contract.implementation((): number => 0)
expectType<ContractFunction<Signature>>(noArguments)
expectType<FunctionContract<Signature>>(noArguments.contract)

const supertypeArgument = contract.implementation((a: unknown, b: number): number => b)
expectType<ContractFunction<Signature>>(supertypeArgument)
expectType<FunctionContract<Signature>>(supertypeArgument.contract)

const anyArgument = contract.implementation((a: any, b: number): number => b)
expectType<ContractFunction<Signature>>(anyArgument)
expectType<FunctionContract<Signature>>(anyArgument.contract)

const subtypeReturn = contract.implementation((a: number, b: number): never => {
  throw new Error()
})
expectType<ContractFunction<Signature>>(subtypeReturn)
expectType<FunctionContract<Signature>>(subtypeReturn.contract)

// Sad usage
const anyReturn = contract.implementation((a: number, b: number): any => b)
expectType<ContractFunction<Signature>>(contract.implementation(anyReturn))
expectType<FunctionContract<Signature>>(anyReturn.contract)

// Invalid usage
expectError(contract.implementation((a: boolean, b: number): number => (a ? 1 : 0) * b))
expectError(contract.implementation((a: never, b: number): number => b))
expectError(contract.implementation((a: number, b: string): number => b))
expectError(contract.implementation((a: number, b: number, c: number): number => a + b + c))
expectError(contract.implementation((a: number, b: number): string => `${a + b}`))
expectError(contract.implementation((a: number, b: number): undefined => undefined))
