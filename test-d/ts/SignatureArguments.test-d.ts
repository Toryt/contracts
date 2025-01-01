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

import { expectError, expectType, expectNotType } from 'tsd'
import {
  optionalAfterRest,
  optionalBeforeRest,
  undefinedBeforeRest,
  type OptionalBeforeRestSignature,
  type UndefinedBeforeRestSignature,
  type OptionalAfterRestSignature,
  type DoubleOptionalBeforeRestSignature,
  doubleOptionalBeforeRest,
  type DoubleOptionalAfterRestSignature,
  doubleOptionalAfterRest
} from './PossibleSignatures.ts'

/* Optional before rest
   -------------------- */

/* An optional before a rest argument can be specified in a signature directly. */

expectType<number>(([] as unknown as Parameters<OptionalBeforeRestSignature>).length)

optionalBeforeRest([0], true, 'one', 'two')
optionalBeforeRest([0], true, 'one')
optionalBeforeRest([0], true)
optionalBeforeRest([0], undefined, 'one', 'two')
optionalBeforeRest([0], undefined, 'one')
optionalBeforeRest([0], undefined)
expectError(optionalBeforeRest([0], 'one')) // not truly optional!
optionalBeforeRest([0])

expectType<number[]>(undefined as unknown as Parameters<OptionalBeforeRestSignature>[0])
// Note this!
expectType<boolean | undefined>(undefined as unknown as Parameters<OptionalBeforeRestSignature>[1])
expectNotType<boolean | undefined | string>(undefined as unknown as Parameters<OptionalBeforeRestSignature>[1])
expectType<string>(undefined as unknown as Parameters<OptionalBeforeRestSignature>[2])
expectType<string>(undefined as unknown as Parameters<OptionalBeforeRestSignature>[3])
expectType<string>(undefined as unknown as Parameters<OptionalBeforeRestSignature>[999999])

expectType<[a: number[], b?: boolean | undefined, ...c: string[]]>(
  [] as unknown as Parameters<OptionalBeforeRestSignature>
)

/* By marking the middle element as possibly `undefined` we get close to the same result, but not entirely: */

expectType<number>(([] as unknown as Parameters<UndefinedBeforeRestSignature>).length)

undefinedBeforeRest([0], true, 'one', 'two')
undefinedBeforeRest([0], true, 'one')
undefinedBeforeRest([0], true)
undefinedBeforeRest([0], undefined, 'one', 'two')
undefinedBeforeRest([0], undefined, 'one')
undefinedBeforeRest([0], undefined)
expectError(undefinedBeforeRest([0], 'one')) // not truly optional!
expectError(undefinedBeforeRest([0])) // this is different

expectType<number[]>(undefined as unknown as Parameters<UndefinedBeforeRestSignature>[0])
// Note this!
expectType<boolean | undefined>(undefined as unknown as Parameters<UndefinedBeforeRestSignature>[1])
expectNotType<boolean | undefined | string>(undefined as unknown as Parameters<UndefinedBeforeRestSignature>[1])
expectType<string>(undefined as unknown as Parameters<UndefinedBeforeRestSignature>[2])
expectType<string>(undefined as unknown as Parameters<UndefinedBeforeRestSignature>[3])
expectType<string>(undefined as unknown as Parameters<UndefinedBeforeRestSignature>[999999])

expectType<[a: number[], b: boolean | undefined, ...c: string[]]>(
  [] as unknown as Parameters<UndefinedBeforeRestSignature>
)

/* Multiple optionals also work. */

expectType<number>(([] as unknown as Parameters<DoubleOptionalBeforeRestSignature>).length)

doubleOptionalBeforeRest([0], ['array'], true, 'one', 'two')
doubleOptionalBeforeRest([0], ['array'], true, 'one')
doubleOptionalBeforeRest([0], ['array'], true)
doubleOptionalBeforeRest([0], ['array'])
doubleOptionalBeforeRest([0], ['array'], undefined, 'one', 'two')
doubleOptionalBeforeRest([0], ['array'], undefined, 'one')
doubleOptionalBeforeRest([0], ['array'], undefined)
doubleOptionalBeforeRest([0], undefined, true, 'one', 'two')
doubleOptionalBeforeRest([0], undefined, true, 'one')
doubleOptionalBeforeRest([0], undefined, true)
doubleOptionalBeforeRest([0], undefined)
doubleOptionalBeforeRest([0], undefined, undefined, 'one', 'two')
doubleOptionalBeforeRest([0], undefined, undefined, 'one')
doubleOptionalBeforeRest([0], undefined, undefined)
expectError(doubleOptionalBeforeRest([0], 'one')) // not truly optional!
doubleOptionalBeforeRest([0])

expectType<number[]>(undefined as unknown as Parameters<DoubleOptionalBeforeRestSignature>[0])
// Note this!
expectType<string[] | undefined>(undefined as unknown as Parameters<DoubleOptionalBeforeRestSignature>[1])
expectNotType<string[] | boolean | undefined | string>(
  undefined as unknown as Parameters<DoubleOptionalBeforeRestSignature>[1]
)
expectType<boolean | undefined>(undefined as unknown as Parameters<DoubleOptionalBeforeRestSignature>[2])
expectNotType<boolean | undefined | string>(undefined as unknown as Parameters<DoubleOptionalBeforeRestSignature>[1])
expectType<string>(undefined as unknown as Parameters<DoubleOptionalBeforeRestSignature>[3])
expectType<string>(undefined as unknown as Parameters<DoubleOptionalBeforeRestSignature>[999999])

expectType<[a: number[], b?: string[] | undefined, c?: boolean | undefined, ...d: string[]]>(
  [] as unknown as Parameters<DoubleOptionalBeforeRestSignature>
)

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
