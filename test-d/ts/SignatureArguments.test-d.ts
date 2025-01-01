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
  pseudoOptionalNonFinal,
  pseudoRestNonFinal,
  oneRestInTheMiddleInArrays,
  optionalAfterRest,
  optionalBeforeRest,
  undefinedNonFinal,
  undefinedBeforeRest,
  type FinalRestArgumentSignature,
  type NoRestViaMultipleVariadics,
  type OneRestViaMultipleVariadics1,
  type OneRestViaMultipleVariadics2,
  type OneRest1,
  type OneRest2,
  type OneRestInTheMiddleTuple,
  type PseudoOptionalNonFinalTuple,
  type UndefinedNonFinalTuple,
  type FinalRestArgumentAfterArraySignature,
  type OneRestInTheMiddleInArraysTuple,
  type PseudoOptionalNonFinalSignature,
  type UndefinedNonFinalSignature,
  type PseudoRestNonFinalSignature,
  type OneRestInTheMiddleInArraysSignature,
  type OptionalBeforeRestSignature,
  type UndefinedBeforeRestSignature,
  type OptionalAfterRestSignature,
  type DoubleOptionalBeforeRestSignature,
  doubleOptionalBeforeRest,
  type DoubleOptionalAfterRestSignature,
  doubleOptionalAfterRest,
  type SingleRestSignature
} from './PossibleSignatures.ts'

/* Rest last argument
   ---------------------- */

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

/* Single rest argument
   --------------------------- */

expectType<number>(([] as unknown as Parameters<SingleRestSignature>).length)
expectType<(string | number)[]>([] as unknown as Parameters<SingleRestSignature>)

expectType<string | number>(undefined as unknown as Parameters<SingleRestSignature>[0])
expectType<string | number>(undefined as unknown as Parameters<SingleRestSignature>[1])
expectType<string | number>(undefined as unknown as Parameters<SingleRestSignature>[999999])

/* Non-final optional argument, revisited
   -------------------------------------- */

/* But that means that, through variadic shenanigans, we can have, or at least emulate, non-final optional elements.
   But they are not truly optional: we need to fill the position with `undefined`: */

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

/* Multiple rest arguments, revisited
   -------------------------------------- */

/* There seems to be no way to get a signature, or a tuple type, with multiple rest arguments or elements. */

/* We can combine multiple variadics in a tuple type: */

expectType<4>(([] as unknown as NoRestViaMultipleVariadics).length)
expectType<[number, string, boolean, string]>([] as unknown as NoRestViaMultipleVariadics)

expectType<number>(([] as unknown as OneRestViaMultipleVariadics1).length)
expectType<[number, ...string[], boolean, string]>([] as unknown as OneRestViaMultipleVariadics1)

expectType<number>(([] as unknown as OneRestViaMultipleVariadics2).length)
expectType<[number, string, ...boolean[], string]>([] as unknown as OneRestViaMultipleVariadics2)

/* But not if the different rest elements together contain more than 1 rest element. Note that the error message is
   confusing (“A rest element cannot follow another rest element.”). */
// @ts-expect-error
type MultipleRestsViaMultipleVariadics = [...OneRest1, ...OneRest2]

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
