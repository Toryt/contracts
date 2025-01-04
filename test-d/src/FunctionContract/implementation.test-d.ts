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

// import { expectType, expectError } from 'tsd'
// import { FunctionContract, type ContractFunction } from '../../../src/index.ts'
// import type { ASignature } from '../../../test2/util/ASignature.ts'
//
// // `implementation`
//
// const contract = new FunctionContract<ASignature>({})
//
// // Valid usage
//
// const exactASignature = contract.implementation((a: number, b: number): number => a * b)
// expectType<ContractFunction<ASignature>>(exactASignature)
// expectType<FunctionContract<ASignature>>(exactASignature.contract)
//
// const lessArguments = contract.implementation((a: number): number => a)
// expectType<ContractFunction<ASignature>>(lessArguments)
// expectType<FunctionContract<ASignature>>(lessArguments.contract)
//
// const noArguments = contract.implementation((): number => 0)
// expectType<ContractFunction<ASignature>>(noArguments)
// expectType<FunctionContract<ASignature>>(noArguments.contract)
//
// const supertypeArgument = contract.implementation((a: unknown, b: number): number => b)
// expectType<ContractFunction<ASignature>>(supertypeArgument)
// expectType<FunctionContract<ASignature>>(supertypeArgument.contract)
//
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const anyArgument = contract.implementation((a: any, b: number): number => b)
// expectType<ContractFunction<ASignature>>(anyArgument)
// expectType<FunctionContract<ASignature>>(anyArgument.contract)
//
// const subtypeReturn = contract.implementation((a: number, b: number): never => {
//   throw new Error()
// })
// expectType<ContractFunction<ASignature>>(subtypeReturn)
// expectType<FunctionContract<ASignature>>(subtypeReturn.contract)
//
// // Sad usage
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const anyReturn = contract.implementation((a: number, b: number): any => b)
// expectType<ContractFunction<ASignature>>(contract.implementation(anyReturn))
// expectType<FunctionContract<ASignature>>(anyReturn.contract)
//
// // Invalid usage
// expectError(contract.implementation((a: boolean, b: number): number => (a ? 1 : 0) * b))
// expectError(contract.implementation((a: never, b: number): number => b))
// expectError(contract.implementation((a: number, b: string): number => b))
// expectError(contract.implementation((a: number, b: number, c: number): number => a + b + c))
// expectError(contract.implementation((a: number, b: number): string => `${a + b}`))
// expectError(contract.implementation((a: number, b: number): undefined => undefined))
