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
import type { ASignature } from '../../../test2/util/ASignature.ts'

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
