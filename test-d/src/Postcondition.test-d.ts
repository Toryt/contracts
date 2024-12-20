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

import { expectAssignable, expectNotAssignable } from 'tsd'
import type { Postcondition } from '../../src/Postcondition.ts'
import type { ASignature } from '../../test2/util/ASignature.ts'

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
