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

import { expectType } from 'tsd'
import {
  type FinalRestArgumentSignature,
  type FinalRestArgumentAfterArraySignature,
  type SingleRestSignature
} from '../../../test2/util/SomeSignatures.ts'

expectType<number>(([] as unknown as Parameters<FinalRestArgumentSignature>).length)

/* There is no weirdness here: */
expectType<[a: number, b: string, ...c: boolean[]]>([] as unknown as Parameters<FinalRestArgumentSignature>)

/* An optional rest argument is rejected. It makes no sense. When there are no actual arguments for the
   rest part, the array is just empty. Actually, Prettier even corrects this. */
// function optionalRest(a: number, b?: string, ...c?: boolean[]): unknown {
//   return undefined
// }

expectType<number>(undefined as unknown as Parameters<FinalRestArgumentSignature>[0])
expectType<string>(undefined as unknown as Parameters<FinalRestArgumentSignature>[1])
// Note that `undefined` is not in the type!
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgumentSignature>[2])
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgumentSignature>[3])
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgumentSignature>[999999])
// Note that `undefined` is not in the union!
expectType<number | string | boolean>(undefined as unknown as Parameters<FinalRestArgumentSignature>[number])

/* After an array: */

expectType<number>(([] as unknown as Parameters<FinalRestArgumentAfterArraySignature>).length)

/* There is no weirdness here: */
expectType<[a: number, b: string[], ...c: boolean[]]>([] as unknown as Parameters<FinalRestArgumentAfterArraySignature>)

/* An optional rest argument is rejected. It makes no sense. When there are no actual arguments for the
   rest part, the array is just empty. Actually, Prettier even corrects this. */
// function optionalRest(a: number, b?: string, ...c?: boolean[]): unknown {
//   return undefined
// }

/* Multiple final rest arguments
   --------------------------------- */

/* Multiple final rest arguments are not possible, and even do not pass `tsd` `expectError` */

function multipleFinalRestArguments(
  a: number,
  b: string,
  // @ts-expect-error
  ...c: boolean[],
  ...d: number[],
  ...e: string[]
): unknown {
  return undefined
}
multipleFinalRestArguments(0, '')

/* The same applies to tuples: */
// @ts-expect-error
type NoMultipleRestsInTuple = [a: number, b: string, ...c: boolean[], ...d: number[], ...e: string[]]

/* Even when we introduce separator types: */
// @ts-expect-error
type SeparatedMultipleRestsInTuple = [
  a: number,
  b: string,
  ...c: boolean[],
  c1: string,
  // @ts-expect-error
  ...d: number[],
  d1: boolean,
  ...e: string[]
]

/* Single rest argument
   --------------------------- */

expectType<number>(([] as unknown as Parameters<SingleRestSignature>).length)
expectType<(string | number)[]>([] as unknown as Parameters<SingleRestSignature>)

expectType<string | number>(undefined as unknown as Parameters<SingleRestSignature>[0])
expectType<string | number>(undefined as unknown as Parameters<SingleRestSignature>[1])
expectType<string | number>(undefined as unknown as Parameters<SingleRestSignature>[999999])
