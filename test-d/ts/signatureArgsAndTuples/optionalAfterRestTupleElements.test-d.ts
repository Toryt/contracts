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
  optionalAfterRest,
  type OptionalAfterRestSignature,
  type DoubleOptionalAfterRestSignature,
  doubleOptionalAfterRest
} from '../../../test2/util/SomeSignatures.ts'

/* Optional after rest
   -------------------- */

/* An optional after a rest argument is impossible directly: */

// @ts-expect-error
type OptionalAfterRestSignatureFail = (a: number[], ...b: string[], c?: boolean) => unknown
// @ts-expect-error
function optionalAfterRestFail(a: number[], ...b: string[], c?: boolean): unknown {
  return undefined
}

/* Optional after rest, revisited
   ------------------------------ */

/* Yet it is possible through complicated variadic shenanigans, but you do not get what you would expect: */

expectType<number>(([] as unknown as Parameters<OptionalAfterRestSignature>).length)

optionalAfterRest([0], 'one', 'two', true)
optionalAfterRest([0], 'one', true)
optionalAfterRest([0], true)
optionalAfterRest([0], 'one', 'two')
optionalAfterRest([0], 'one')
optionalAfterRest([0])
// but! also!
optionalAfterRest([0], false, 'one', true, 'two', true)

expectType<number[]>(undefined as unknown as Parameters<OptionalAfterRestSignature>[0])
expectType<string | boolean | undefined>(undefined as unknown as Parameters<OptionalAfterRestSignature>[1])
expectType<string | boolean | undefined>(undefined as unknown as Parameters<OptionalAfterRestSignature>[2])
expectType<string | boolean | undefined>(undefined as unknown as Parameters<OptionalAfterRestSignature>[3])
expectType<string | boolean | undefined>(undefined as unknown as Parameters<OptionalAfterRestSignature>[999999])

// Note that the 2 last arguments are collapsed:
expectType<[a: number[], ...b: (string | boolean | undefined)[]]>(
  [] as unknown as Parameters<OptionalAfterRestSignature>
)

/* Multiple optionals after rest: */

expectType<number>(([] as unknown as Parameters<DoubleOptionalAfterRestSignature>).length)

doubleOptionalAfterRest([0], 'one', 'two', true, 1)
doubleOptionalAfterRest([0], 'one', 'two', true)
doubleOptionalAfterRest([0], 'one', true)
doubleOptionalAfterRest([0], true)
doubleOptionalAfterRest([0], 'one', 'two')
doubleOptionalAfterRest([0], 'one')
doubleOptionalAfterRest([0])
// but! also!
doubleOptionalAfterRest([0], false, 1, 'one', true, 'two', true)

expectType<number[]>(undefined as unknown as Parameters<DoubleOptionalAfterRestSignature>[0])
expectType<string | boolean | number | undefined>(
  undefined as unknown as Parameters<DoubleOptionalAfterRestSignature>[1]
)
expectType<string | boolean | number | undefined>(
  undefined as unknown as Parameters<DoubleOptionalAfterRestSignature>[2]
)
expectType<string | boolean | number | undefined>(
  undefined as unknown as Parameters<DoubleOptionalAfterRestSignature>[3]
)
expectType<string | boolean | number | undefined>(
  undefined as unknown as Parameters<DoubleOptionalAfterRestSignature>[999999]
)

// Note that the 3 last arguments are collapsed:
expectType<[a: number[], ...b: (string | boolean | number | undefined)[]]>(
  [] as unknown as Parameters<DoubleOptionalAfterRestSignature>
)

/* Although optionals after a rest are possible, they fully behave as a disjunctive rest argument. There is no
   difference, and we can never encounter them when matching types. */
