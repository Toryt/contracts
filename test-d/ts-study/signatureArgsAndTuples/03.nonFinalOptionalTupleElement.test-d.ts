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
  pseudoOptionalNonFinal,
  type PseudoOptionalNonFinalSignature,
  type PseudoOptionalNonFinalTuple,
  undefinedNonFinal,
  type UndefinedNonFinalSignature,
  type UndefinedNonFinalTuple
} from '../../../test2/util/SomeSignatures.ts'

/* Non-final optional argument
   --------------------------- */

/* There can be no required arguments after an optional argument in a signature, or a tuple. Even `expectError` of
   `tsd` rejects this. We need `@ts-expect-error` to show this. */

// @ts-expect-error
function optionalBeforeRequired(a: number, b?: string, c: boolean): unknown {
  return undefined
}

function optionalBeforeRequiredInTuple(): unknown {
  // @ts-expect-error
  const obrit: [a: number, b?: string, c: boolean] = [0, '', true]
  return obrit
}
optionalBeforeRequiredInTuple()

/* Non-final optional argument, revisited
   -------------------------------------- */

/* Through variadic shenanigans, we can have, or at least emulate, non-final optional elements. But they are not truly
   optional: we need to fill the position with `undefined`: */

expectType<3>(([] as unknown as PseudoOptionalNonFinalTuple).length)
expectType<3>(([] as unknown as Parameters<typeof pseudoOptionalNonFinal>).length)

expectError(pseudoOptionalNonFinal(0, true))
pseudoOptionalNonFinal(0, undefined, true)
pseudoOptionalNonFinal(0, '', true)
expectError(pseudoOptionalNonFinal(0, 'one', 'two', true))
expectType<[a: number, b: string | undefined, c: boolean]>([] as unknown as Parameters<PseudoOptionalNonFinalSignature>)

expectType<number>(undefined as unknown as Parameters<PseudoOptionalNonFinalSignature>[0])
expectType<string | undefined>(undefined as unknown as Parameters<PseudoOptionalNonFinalSignature>[1])
expectType<boolean>(undefined as unknown as Parameters<PseudoOptionalNonFinalSignature>[2])
// @ts-expect-error
type NoElementAtIndex3b = Parameters<PseudoOptionalNonFinalSignature>[3]

function pseudoOptionalBeforeRequiredInTupleRevisited(): unknown {
  let pobrit: PseudoOptionalNonFinalTuple
  pobrit = [0, undefined, true]
  pobrit = [0, '', true]
  expectError((pobrit = [0, 'one', 'two', true]))
  return pobrit
}
pseudoOptionalBeforeRequiredInTupleRevisited()

/* Of course, we can get the same effect much simpler by marking the middle element as possibly `undefined`: */
expectType<3>(([] as unknown as Parameters<typeof undefinedNonFinal>).length)
expectType<3>(([] as unknown as Parameters<UndefinedNonFinalSignature>).length)

expectError(undefinedNonFinal(0, true))
undefinedNonFinal(0, undefined, true)
undefinedNonFinal(0, '', true)
expectError(undefinedNonFinal(0, 'one', 'two', true))
expectType<[a: number, b: string | undefined, c: boolean]>([] as unknown as Parameters<UndefinedNonFinalSignature>)

function undefinedNonFinalInTuple(): unknown {
  let pobrit: UndefinedNonFinalTuple
  pobrit = [0, undefined, true]
  pobrit = [0, '', true]
  expectError((pobrit = [0, 'one', 'two', true]))
  return pobrit
}
undefinedNonFinalInTuple()
