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

import { expectType, expectError } from 'tsd'
import { FunctionContract } from '../src'
import type { ContractFunctionProperties } from '../src/FunctionContract'

type signature = (a: number, b: number) => number
const contract = new FunctionContract<signature>()

type AdornedSignature = signature & ContractFunctionProperties<signature>

// Valid usage

const exactSignature = contract.implementation((a: number, b: number): number => a * b)
expectType<AdornedSignature>(exactSignature)
expectType<FunctionContract<signature>>(exactSignature.contract)

const lessArguments = contract.implementation((a: number): number => a)
expectType<AdornedSignature>(lessArguments)
expectType<FunctionContract<signature>>(lessArguments.contract)

const noArguments = contract.implementation((): number => 0)
expectType<AdornedSignature>(noArguments)
expectType<FunctionContract<signature>>(noArguments.contract)

const supertypeArgument = contract.implementation((a: unknown, b: number): number => b)
expectType<AdornedSignature>(supertypeArgument)
expectType<FunctionContract<signature>>(supertypeArgument.contract)

const anyArgument = contract.implementation((a: any, b: number): number => b)
expectType<AdornedSignature>(anyArgument)
expectType<FunctionContract<signature>>(anyArgument.contract)

const subtypeReturn = contract.implementation((a: number, b: number): never => {
  throw new Error()
})
expectType<AdornedSignature>(subtypeReturn)
expectType<FunctionContract<signature>>(subtypeReturn.contract)

// Sad usage
const anyReturn = contract.implementation((a: number, b: number): any => b)
expectType<AdornedSignature>(contract.implementation(anyReturn))
expectType<FunctionContract<signature>>(anyReturn.contract)

// Invalid usage
expectError(contract.implementation((a: boolean, b: number): number => (a ? 1 : 0) * b))
expectError(contract.implementation((a: never, b: number): number => b))
expectError(contract.implementation((a: number, b: string): number => b))
expectError(contract.implementation((a: number, b: number, c: number): number => a + b + c))
expectError(contract.implementation((a: number, b: number): string => `${a + b}`))
expectError(contract.implementation((a: number, b: number): undefined => undefined))
