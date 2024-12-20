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
import { FunctionContract, type ContractFunction, type UnknownFunction } from '../src/index.ts'
import type { Postcondition } from '../src/FunctionContract.ts'

// ASignature

type ASignature = (a: number, b: number) => number

expectAssignable<ASignature>((a: number, b: number): number => a + b)
expectAssignable<ASignature>((a: number): number => a)
expectAssignable<ASignature>((): number => 0)
expectAssignable<ASignature>((a: unknown, b: number): number => b)
expectAssignable<ASignature>((a: number, b: unknown): number => a)
expectAssignable<ASignature>((a: number, b: unknown): never => {
  throw new Error()
})

expectNotAssignable<ASignature>((a: number, b: number): string => `${a + b}`)
expectNotAssignable<ASignature>((a: number, b: number): unknown => 'booh!')

// UnknownFunction

expectAssignable<UnknownFunction>((a: number, b: number): number => a + b)
expectAssignable<UnknownFunction>((a: number): number => a)
expectAssignable<UnknownFunction>((): number => 0)
expectAssignable<UnknownFunction>((a: unknown, b: number): number => b)
expectAssignable<UnknownFunction>((a: number, b: unknown): number => a)
expectAssignable<UnknownFunction>((a: number, b: unknown): never => {
  throw new Error()
})
expectAssignable<UnknownFunction>((a: number, b: number): string => `${a + b}`)
expectAssignable<UnknownFunction>((a: number, b: number): unknown => a | b)

// Postcondition
// Valid postconditions
const validPost1: Postcondition<ASignature> = (args: [number, number], result: number) => result > args[0]
const validPost2: Postcondition<ASignature> = (args: [number], result: number) => result > 0
const validPost3: Postcondition<ASignature> = (args: [], result: number) => result > 0
const validPost4: Postcondition<ASignature> = (args: [unknown, number], result: number) => result > 0

// Validate types
expectAssignable<Postcondition<ASignature>>(validPost1)
expectAssignable<Postcondition<ASignature>>(validPost2)
expectAssignable<Postcondition<ASignature>>(validPost3)
expectAssignable<Postcondition<ASignature>>(validPost4)
expectAssignable<Postcondition<ASignature>>((args: [number, number], result: number) => 42)
expectAssignable<Postcondition<ASignature>>((args: [number, number], result: number) => undefined)
expectAssignable<Postcondition<ASignature>>((args: [number, number], result: number) => null)
expectAssignable<Postcondition<ASignature>>((args: [number, number], result: number) => '')
expectAssignable<Postcondition<ASignature>>((args: [number, number], result: number) => 'a string')
expectAssignable<Postcondition<ASignature>>((args: [number, number], result: number) => {})
expectAssignable<Postcondition<ASignature>>((args: [number, number], result: number): unknown => 'mystery')

// Sadly also ok
expectAssignable<Postcondition<ASignature>>((args: [number, number], result: number): never => {
  throw new Error()
})

// Invalid postconditions
expectNotAssignable<Postcondition<ASignature>>((args: [string, number], result: number) => result > 0)
expectNotAssignable<Postcondition<ASignature>>((args: [number, never], result: number) => result > 0)
expectNotAssignable<Postcondition<ASignature>>((args: [number, number, string], result: number) => result > 0)
expectNotAssignable<Postcondition<ASignature>>((args: [number, number], result: string) => result === 'worf')

const post: Array<Postcondition<ASignature>> = [
  (args: Array<number>, result: number): boolean => result > (args[0] ?? 0),
  (args: Array<number>, result: number): boolean => result === args[1]
]

// Constructor

// Default postconditions
const contractDefault = new FunctionContract<ASignature>({})
expectType<FunctionContract<ASignature>>(contractDefault)
expectType<ReadonlyArray<Postcondition<ASignature>>>(contractDefault.post)

// With postconditions
const contractWithPost = new FunctionContract<ASignature>({ post })
expectType<FunctionContract<ASignature>>(contractWithPost)
expectType<ReadonlyArray<Postcondition<ASignature>>>(contractWithPost.post)

// broader arguments
const broaderArgumentsInPost = new FunctionContract<ASignature>({
  post: [(args: [unknown, number], result: number): boolean => typeof args[0] === 'number']
})
expectType<FunctionContract<ASignature>>(broaderArgumentsInPost)
expectType<ReadonlyArray<Postcondition<ASignature>>>(broaderArgumentsInPost.post)

const lessArgumentsInPost = new FunctionContract<ASignature>({
  post: [(args: [number], result: number): boolean => true]
})
expectType<FunctionContract<ASignature>>(lessArgumentsInPost)
expectType<ReadonlyArray<Postcondition<ASignature>>>(lessArgumentsInPost.post)

const broaderReturnTypeInPost = new FunctionContract<ASignature>({
  post: [(args: [number, number], result: unknown): boolean => typeof result === 'number']
})
expectType<FunctionContract<ASignature>>(broaderReturnTypeInPost)
expectType<ReadonlyArray<Postcondition<ASignature>>>(broaderReturnTypeInPost.post)

const stringPostResult = new FunctionContract<ASignature>({
  post: [(args: [number, number], result: unknown): string => typeof result]
})
expectType<FunctionContract<ASignature>>(stringPostResult)
expectType<ReadonlyArray<Postcondition<ASignature>>>(stringPostResult.post)

const numberPostResult = new FunctionContract<ASignature>({
  post: [(args: [number, number], result: unknown): number | undefined => args[0]]
})
expectType<FunctionContract<ASignature>>(numberPostResult)
expectType<ReadonlyArray<Postcondition<ASignature>>>(numberPostResult.post)

const objectPostResult = new FunctionContract<ASignature>({
  post: [(args: [number, number], result: unknown): object | null => null]
})
expectType<FunctionContract<ASignature>>(objectPostResult)
expectType<ReadonlyArray<Postcondition<ASignature>>>(objectPostResult.post)

const unknownPostResult = new FunctionContract<ASignature>({
  post: [(args: [number, number], result: unknown): unknown => null]
})
expectType<FunctionContract<ASignature>>(unknownPostResult)
expectType<ReadonlyArray<Postcondition<ASignature>>>(unknownPostResult.post)

// Sadly valid
const sadlyValidPostCondition = new FunctionContract<ASignature>({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: [(args: [number, number], result: number): any => 42]
})
expectType<FunctionContract<ASignature>>(sadlyValidPostCondition)
expectType<ReadonlyArray<Postcondition<ASignature>>>(sadlyValidPostCondition.post)

// wrong arguments
expectError(
  new FunctionContract<ASignature>({
    post: [(args: [string, number], result: number): boolean => result.startsWith(args[0])]
  })
)
expectError(
  new FunctionContract<ASignature>({
    post: [(args: [number, never], result: number): boolean => result.startsWith(args[0])]
  })
)
expectError(
  new FunctionContract<ASignature>({
    post: [(args: [number, number, string], result: number): boolean => result.startsWith(args[0])]
  })
)

// wrong return type
expectError(
  new FunctionContract<ASignature>({
    post: [(args: [number, number], result: string): boolean => result.startsWith(args[0])]
  })
)
expectError(
  new FunctionContract<ASignature>({
    post: [(args: [number, number], result: never): boolean => result.startsWith(args[0])]
  })
)

// Invalid argument for postconditions
expectError(
  new FunctionContract<ASignature>({
    post: [(args: [number, number], result: string): boolean => result === 'worf']
  })
)

// `implementation`

const contract = new FunctionContract<ASignature>({})

// Valid usage

const exactASignature = contract.implementation((a: number, b: number): number => a * b)
expectType<ContractFunction<ASignature>>(exactASignature)
expectType<FunctionContract<ASignature>>(exactASignature.contract)

const lessArguments = contract.implementation((a: number): number => a)
expectType<ContractFunction<ASignature>>(lessArguments)
expectType<FunctionContract<ASignature>>(lessArguments.contract)

const noArguments = contract.implementation((): number => 0)
expectType<ContractFunction<ASignature>>(noArguments)
expectType<FunctionContract<ASignature>>(noArguments.contract)

const supertypeArgument = contract.implementation((a: unknown, b: number): number => b)
expectType<ContractFunction<ASignature>>(supertypeArgument)
expectType<FunctionContract<ASignature>>(supertypeArgument.contract)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyArgument = contract.implementation((a: any, b: number): number => b)
expectType<ContractFunction<ASignature>>(anyArgument)
expectType<FunctionContract<ASignature>>(anyArgument.contract)

const subtypeReturn = contract.implementation((a: number, b: number): never => {
  throw new Error()
})
expectType<ContractFunction<ASignature>>(subtypeReturn)
expectType<FunctionContract<ASignature>>(subtypeReturn.contract)

// Sad usage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyReturn = contract.implementation((a: number, b: number): any => b)
expectType<ContractFunction<ASignature>>(contract.implementation(anyReturn))
expectType<FunctionContract<ASignature>>(anyReturn.contract)

// Invalid usage
expectError(contract.implementation((a: boolean, b: number): number => (a ? 1 : 0) * b))
expectError(contract.implementation((a: never, b: number): number => b))
expectError(contract.implementation((a: number, b: string): number => b))
expectError(contract.implementation((a: number, b: number, c: number): number => a + b + c))
expectError(contract.implementation((a: number, b: number): string => `${a + b}`))
expectError(contract.implementation((a: number, b: number): undefined => undefined))
