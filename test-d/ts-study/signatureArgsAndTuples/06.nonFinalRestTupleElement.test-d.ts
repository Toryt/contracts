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

import { expectError, expectType } from 'tsd'
import {
  type OneRestInTheMiddleTuple,
  type OneRestInTheMiddleInArraysTuple,
  type PseudoRestNonFinalSignature,
  pseudoRestNonFinal,
  type OneRestInTheMiddleInArraysSignature,
  oneRestInTheMiddleInArrays
} from '../../../test2/util/SomeSignatures.ts'

/* Non-final rest argument
   --------------------------- */

/* There can be no required arguments after a rest argument in a signature either. Even `expectError` of `tsd`
   rejects this. We need `@ts-expect-error` to show this. */
// @ts-expect-error
function restBeforeRequired(a: number, ...b: string[], c: boolean): unknown {
  return undefined
}

/* But we _can_ have rest elements before required elements in a tuple: */
function restBeforeRequiredInTuple(): OneRestInTheMiddleTuple {
  let vbrit: OneRestInTheMiddleTuple = [0, '', true]
  vbrit = [0, true]
  vbrit = [0, '', true]
  vbrit = [0, 'one', 'two', true]
  return vbrit
}
restBeforeRequiredInTuple()

expectType<number>(([] as unknown as ReturnType<typeof restBeforeRequiredInTuple>).length)
expectType<number>(([] as unknown as OneRestInTheMiddleTuple).length)

expectType<number>(undefined as unknown as OneRestInTheMiddleTuple[0])
expectType<string | boolean>(undefined as unknown as OneRestInTheMiddleTuple[1])
expectType<string | boolean>(undefined as unknown as OneRestInTheMiddleTuple[2])
expectType<string | boolean>(undefined as unknown as OneRestInTheMiddleTuple[3])
expectType<string | boolean>(undefined as unknown as OneRestInTheMiddleTuple[999999])

/* Inbetween arrays: */

/* But we _can_ have rest elements before required elements in a tuple: */
function restBeforeRequiredInbewteenArraysInTuple(): OneRestInTheMiddleInArraysTuple {
  let vbrit: OneRestInTheMiddleInArraysTuple = [[0], '', [true]]
  vbrit = [[0], [true]]
  vbrit = [[0], '', [true]]
  vbrit = [[0], 'one', 'two', [true]]
  return vbrit
}
restBeforeRequiredInbewteenArraysInTuple()

expectType<number>(([] as unknown as ReturnType<typeof restBeforeRequiredInbewteenArraysInTuple>).length)
expectType<number>(([] as unknown as OneRestInTheMiddleInArraysTuple).length)

expectType<number[]>(undefined as unknown as OneRestInTheMiddleInArraysTuple[0])
expectType<string | boolean[]>(undefined as unknown as OneRestInTheMiddleInArraysTuple[1])
expectType<string | boolean[]>(undefined as unknown as OneRestInTheMiddleInArraysTuple[2])
expectType<string | boolean[]>(undefined as unknown as OneRestInTheMiddleInArraysTuple[3])
expectType<string | boolean[]>(undefined as unknown as OneRestInTheMiddleInArraysTuple[999999])

/* Non-final rest argument, revisited
   -------------------------------------- */

/* With tuple shenanigans, we can create a signature with a rest argument in the middle: */

expectType<number>(([] as unknown as Parameters<PseudoRestNonFinalSignature>).length)
expectType<number>(([] as unknown as Parameters<typeof pseudoRestNonFinal>).length)

pseudoRestNonFinal(0, true)
pseudoRestNonFinal(0, '', true)
pseudoRestNonFinal(0, 'one', 'two', true)
expectError(pseudoRestNonFinal(0, 'one', 'two', 'three'))
expectType<[a: number, ...b: string[], c: boolean]>([] as unknown as Parameters<PseudoRestNonFinalSignature>)

expectType<number>(undefined as unknown as Parameters<PseudoRestNonFinalSignature>[0])
expectType<string | boolean>(undefined as unknown as Parameters<PseudoRestNonFinalSignature>[1])
expectType<string | boolean>(undefined as unknown as Parameters<PseudoRestNonFinalSignature>[2])
expectType<string | boolean>(undefined as unknown as Parameters<PseudoRestNonFinalSignature>[3])
expectType<string | boolean>(undefined as unknown as Parameters<PseudoRestNonFinalSignature>[999999])

/* Inbetween arrays: */

expectType<number>(([] as unknown as Parameters<OneRestInTheMiddleInArraysSignature>).length)
expectType<number>(([] as unknown as Parameters<typeof oneRestInTheMiddleInArrays>).length)

oneRestInTheMiddleInArrays([0], [true])
oneRestInTheMiddleInArrays([0], '', [true])
oneRestInTheMiddleInArrays([0], 'one', 'two', [true])
expectError(oneRestInTheMiddleInArrays([0], 'one', 'two', 'three'))
expectType<[a: number[], ...b: string[], c: boolean[]]>(
  [] as unknown as Parameters<OneRestInTheMiddleInArraysSignature>
)

expectType<number[]>(undefined as unknown as Parameters<OneRestInTheMiddleInArraysSignature>[0])
expectType<string | boolean[]>(undefined as unknown as Parameters<OneRestInTheMiddleInArraysSignature>[1])
expectType<string | boolean[]>(undefined as unknown as Parameters<OneRestInTheMiddleInArraysSignature>[2])
expectType<string | boolean[]>(undefined as unknown as Parameters<OneRestInTheMiddleInArraysSignature>[3])
expectType<string | boolean[]>(undefined as unknown as Parameters<OneRestInTheMiddleInArraysSignature>[999999])
