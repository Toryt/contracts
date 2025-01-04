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
  type NoRestViaMultipleRest,
  type OneRestViaMultipleRests1,
  type OneRestViaMultipleRests2,
  type OneRest1,
  type OneRest2
} from '../../../test2/util/SomeSignatures.ts'

/* There seems to be no way to get a signature, or a tuple type, with multiple rest arguments or elements. */

/* We can combine multiple rest elements in a tuple type: */

expectType<4>(([] as unknown as NoRestViaMultipleRest).length)
expectType<[number, string, boolean, string]>([] as unknown as NoRestViaMultipleRest)

expectType<number>(([] as unknown as OneRestViaMultipleRests1).length)
expectType<[number, ...string[], boolean, string]>([] as unknown as OneRestViaMultipleRests1)

expectType<number>(([] as unknown as OneRestViaMultipleRests2).length)
expectType<[number, string, ...boolean[], string]>([] as unknown as OneRestViaMultipleRests2)

/* But not if the different rest elements together contain more than 1 rest element. Note that the error message is
   confusing (“A rest element cannot follow another rest element.”). */
// @ts-expect-error
type MultipleRestsViaMultipleVariadics = [...OneRest1, ...OneRest2]

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
