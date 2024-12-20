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

// ASignature

import { expectAssignable, expectNotAssignable } from 'tsd'
import type { UnknownFunction } from '../../src/index.ts'

export type ASignature = (a: number, b: number) => number

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
