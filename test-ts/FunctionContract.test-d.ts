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

const contract = new FunctionContract<(a: number, b: number) => number>()

// Valid usage
expectType<(a: number, b: number) => number>(contract.implementation((a: number, b: number): number => a * b))
expectType<(a: number, b: number) => number>(contract.implementation((a: number): number => a))
expectType<(a: number, b: number) => number>(contract.implementation((): number => 0))
expectType<(a: number, b: number) => number>(contract.implementation((a: unknown, b: number): number => b))
expectType<(a: number, b: number) => number>(contract.implementation((a: any, b: number): number => b))
expectType<(a: number, b: number) => number>(
  contract.implementation((a: number, b: number): never => {
    throw new Error()
  })
)

// Sad usage
expectType<(a: number, b: number) => number>(contract.implementation((a: number, b: number): any => b))

// Invalid usage
expectError(contract.implementation((a: boolean, b: number): number => (a ? 1 : 0) * b))
expectError(contract.implementation((a: never, b: number): number => b))
expectError(contract.implementation((a: number, b: string): number => b))
expectError(contract.implementation((a: number, b: number, c: number): number => a + b + c))
expectError(contract.implementation((a: number, b: number): string => `${a + b}`))
expectError(contract.implementation((a: number, b: number): undefined => undefined))
