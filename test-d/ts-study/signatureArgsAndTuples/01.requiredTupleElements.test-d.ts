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

import { expectAssignable, expectType } from 'tsd'
import {
  type OneArgumentSignature,
  type TwoArgumentsSignature,
  noArgumentFunction,
  oneArgumentsFunction,
  twoArgumentsFunction
} from '../../../test2/util/SomeSignatures.ts'

/* The arguments of literal signatures of functions can be required, optional (`?`) , or rest (`...`), in that
   order. */

expectType<[a: number]>([] as unknown as Parameters<OneArgumentSignature>)
expectType<1>(([] as unknown as Parameters<OneArgumentSignature>).length)
expectType<number>(undefined as unknown as Parameters<OneArgumentSignature>[0])
// @ts-expect-error
type NoElementAtIndex1 = Parameters<OneArgumentSignature>[1]
expectAssignable<OneArgumentSignature>(oneArgumentsFunction)
expectAssignable<OneArgumentSignature>(noArgumentFunction)

expectType<[a: number[], b: string]>([] as unknown as Parameters<TwoArgumentsSignature>)
expectType<2>(([] as unknown as Parameters<TwoArgumentsSignature>).length)
expectType<number[]>(undefined as unknown as Parameters<TwoArgumentsSignature>[0])
expectType<string>(undefined as unknown as Parameters<TwoArgumentsSignature>[1])
// @ts-expect-error
type NoElementAtIndex2 = Parameters<TwoArgumentsSignature>[2]
expectAssignable<TwoArgumentsSignature>(twoArgumentsFunction)
expectAssignable<TwoArgumentsSignature>((a: number[]): unknown => undefined)
expectAssignable<TwoArgumentsSignature>(noArgumentFunction)
