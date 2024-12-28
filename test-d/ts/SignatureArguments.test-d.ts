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

import { expectError, expectType, expectAssignable, expectNotAssignable, expectNotType } from 'tsd'
import {
  finalOptionalArgument,
  multipleFinalOptionalArguments,
  pseudoOptionalBeforeRequiredRevisited,
  pseudoRestBeforeRequiredRevisited,
  undefinedNonFinal,
  type FinalOptionalArgument,
  type FinalRestArgument,
  type MultipleFinalOptionalArguments,
  type NoRestViaMultipleVariadics,
  type OneRestViaMultipleVariadics1,
  type OneRestViaMultipleVariadics2,
  type OneRest1,
  type OneRest2,
  type NoArguments,
  type OneArgument,
  type OneRestInTheMiddleTuple,
  type PseudoOptionalNonFinal,
  type TwoArguments,
  type UndefinedNonFinal
} from './PossibleSignatures.ts'

type LastTupleElement<T extends unknown[]> = T extends []
  ? never
  : T extends [...start: unknown[], last: infer Last] //required single
    ? [Last, 'required']
    : T extends [...start: infer _, last?: infer Last] // optional single
      ? [Last, 'optional']
      : never

/* The arguments of literal signatures of functions can be required, optional (`?`) , or rest (`...`), in that
   order. */

expectType<[]>([] as unknown as Parameters<NoArguments>)
expectType<0>(([] as unknown as Parameters<NoArguments>).length)
// @ts-expect-error
type NoElementAtIndex0 = NoArguments<OneArgument>[0]
expectType<never>(undefined as unknown as LastTupleElement<Parameters<NoArguments>>)

expectType<[a: number]>([] as unknown as Parameters<OneArgument>)
expectType<1>(([] as unknown as Parameters<OneArgument>).length)
expectType<number>(undefined as unknown as Parameters<OneArgument>[0])
// @ts-expect-error
type NoElementAtIndex1 = Parameters<OneArgument>[1]
expectType<[number, 'required']>(undefined as unknown as LastTupleElement<Parameters<OneArgument>>)

expectType<[a: number, b: string]>([] as unknown as Parameters<TwoArguments>)
expectType<2>(([] as unknown as Parameters<TwoArguments>).length)
expectType<number>(undefined as unknown as Parameters<TwoArguments>[0])
expectType<string>(undefined as unknown as Parameters<TwoArguments>[1])
// @ts-expect-error
type NoElementAtIndex2 = Parameters<TwoArguments>[2]
expectType<[string, 'required']>(undefined as unknown as LastTupleElement<Parameters<TwoArguments>>)

/* Optional last argument
   ---------------------- */

expectType<2 | 3>(([] as unknown as Parameters<FinalOptionalArgument>).length)
expectType<2 | 3>(([] as unknown as Parameters<typeof finalOptionalArgument>).length)

/* Note that it is necessary for the type of the optional argument to include `undefined`: */
expectType<[a: number, b: string, c?: boolean | undefined]>([] as unknown as Parameters<FinalOptionalArgument>)
/* Without `| undefined`, both `expectType` and `expectNotType` fail
   * `expectType` fails  because `boolean | undefined` is not assignable to `boolean`, which is sensible: the last
      element of the tuple might be optional, but if it is there, it must be `boolean` and cannot be `undefined`.
      The last element in the signature can be `undefined` in the implementation of the function (that is how we would
      recognize it is not given in the implementation). From the callers standpoint, we can also _call_ the function
      with `undefined` as the last actual argument when its optional. */
// expectType<[a:number, b:string, c?:boolean]>([] as unknown as Parameters<FinalOptionalArgument>)
finalOptionalArgument(0, '', undefined) // works fine.
/*    That is not ok for a tuple though (`undefined` is not assignable to type `boolean`): */
expectError(function (): [a: number, b: string, c?: boolean] {
  const tupleWithLastElementOptional: [a: number, b: string, c?: boolean] = [0, '', undefined]
  return tupleWithLastElementOptional
})
function allowUndefinedInOptionalTupleElement(): [a: number, b: string, c?: boolean | undefined] {
  const tupleWithLastElementOptional: [a: number, b: string, c?: boolean | undefined] = [0, '', undefined]
  return tupleWithLastElementOptional
}
allowUndefinedInOptionalTupleElement()
/*    The same applies to a bare tuple: */
// expectType<[a: number, b: string, c?: boolean]>([] as unknown as [a: number, b: string, c?: boolean | undefined])
/* * `expectNotType` fails because
      “`[a: number, b: string, c?: boolean]` is identical to  `[a: number, b: string, c?: boolean | undefined]`”.
      **That’s weird, given the above.** Is this a `tsd` thing?
      The same applies to a bare tuple: */
// expectNotType<[a:number, b:string, c?:boolean]>([] as unknown as Parameters<FinalOptionalArgument>)
// expectNotType<[a: number, b: string, c?: boolean]>([] as unknown as [a: number, b: string, c?: boolean | undefined])
/* So, it is to be expected that the parameters of the signature (or the similar bare tuple) are not assignable to the
   tuple where the last element does not allow `undefined`, but that such a tuple is assignable to the parameters of
   such a signature (or the similar bare tuple). They clearly are not identical. Where is that coming from? */
expectNotAssignable<[a: number, b: string, c?: boolean]>([] as unknown as Parameters<FinalOptionalArgument>)
expectNotAssignable<[a: number, b: string, c?: boolean]>(
  [] as unknown as [a: number, b: string, c?: boolean | undefined]
)
expectAssignable<Parameters<FinalOptionalArgument>>([] as unknown as [a: number, b: string, c?: boolean])
expectAssignable<[a: number, b: string, c?: boolean | undefined]>([] as unknown as [a: number, b: string, c?: boolean])

expectType<number>(undefined as unknown as Parameters<FinalOptionalArgument>[0])
expectType<string>(undefined as unknown as Parameters<FinalOptionalArgument>[1])
expectType<boolean | undefined>(undefined as unknown as Parameters<FinalOptionalArgument>[2])
// @ts-expect-error
type NoElementAtIndex3a = Parameters<FinalOptionalArgument>[3]
expectType<[boolean | undefined, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<FinalOptionalArgument>>
)
expectNotType<[string | boolean, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<FinalOptionalArgument>>
)

/* Multiple final optional arguments
   --------------------------------- */

expectType<2 | 3 | 4 | 5>(([] as unknown as Parameters<MultipleFinalOptionalArguments>).length)
expectType<2 | 3 | 4 | 5>(([] as unknown as Parameters<typeof multipleFinalOptionalArguments>).length)

multipleFinalOptionalArguments(0, '')
multipleFinalOptionalArguments(0, '', true)
multipleFinalOptionalArguments(0, '', undefined)
multipleFinalOptionalArguments(0, '', true, 1)
multipleFinalOptionalArguments(0, '', undefined, 1)
multipleFinalOptionalArguments(0, '', undefined, undefined)
multipleFinalOptionalArguments(0, '', true, 1, 'last')
multipleFinalOptionalArguments(0, '', undefined, 1, 'last')
multipleFinalOptionalArguments(0, '', undefined, undefined, 'last')
multipleFinalOptionalArguments(0, '', undefined, undefined, undefined)
const viaATuple: Parameters<MultipleFinalOptionalArguments> = [0, '', true, 1, 'last']
multipleFinalOptionalArguments(...viaATuple)
expectError(multipleFinalOptionalArguments(0, '', true, 1, 'last', 34))
expectError(multipleFinalOptionalArguments(0, '', undefined, 1, 'last', 'past last'))
expectError(multipleFinalOptionalArguments(0, '', undefined, undefined, 'last', true))
expectError(multipleFinalOptionalArguments(0, '', undefined, undefined, undefined, 'one more'))
expectError(multipleFinalOptionalArguments(0, '', undefined, undefined, undefined, undefined))
const notEvenViaATuple: [...Parameters<MultipleFinalOptionalArguments>, unknown] = [0, '', true, 1, 'last', 34]
expectError(multipleFinalOptionalArguments(...notEvenViaATuple))
expectType<[a: number, b: string, c?: boolean | undefined, d?: number | undefined, e?: string | undefined]>(
  [] as unknown as Parameters<MultipleFinalOptionalArguments>
)

expectType<number>(undefined as unknown as Parameters<MultipleFinalOptionalArguments>[0])
expectType<string>(undefined as unknown as Parameters<MultipleFinalOptionalArguments>[1])
expectType<boolean | undefined>(undefined as unknown as Parameters<MultipleFinalOptionalArguments>[2])
expectType<number | undefined>(undefined as unknown as Parameters<MultipleFinalOptionalArguments>[3])
expectType<string | undefined>(undefined as unknown as Parameters<MultipleFinalOptionalArguments>[4])
// @ts-expect-error
type NoElementAtIndex3 = Parameters<MultipleFinalOptionalArguments>[5]
expectType<[string | undefined, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArguments>>
)
expectNotType<[boolean | number | string, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArguments>>
)

/* Rest last argument
   ---------------------- */

expectType<number>(([] as unknown as Parameters<FinalRestArgument>).length)

/* There is no weirdness here: */
expectType<[a: number, b: string, ...c: boolean[]]>([] as unknown as Parameters<FinalRestArgument>)

/* An optional rest argument is rejected. It makes no sense. When there are no actual arguments for the
   rest part, the array is just empty. Actually, Prettier even corrects this. */
// function optionalRest(a: number, b?: string, ...c?: boolean[]): unknown {
//   return undefined
// }

expectType<number>(undefined as unknown as Parameters<FinalRestArgument>[0])
expectType<string>(undefined as unknown as Parameters<FinalRestArgument>[1])
// Note that `undefined` is not in the type!
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgument>[2])
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgument>[3])
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgument>[999999])
// Note that `undefined` is not in the union!
expectType<number | string | boolean>(undefined as unknown as Parameters<FinalRestArgument>[number])

// we cannot get the type of the last argument:
// MUDO should be 'rest'
expectType<[unknown, 'optional']>(undefined as unknown as LastTupleElement<Parameters<FinalRestArgument>>)
expectNotType<[boolean, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArguments>>
)
expectNotType<[boolean[], 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArguments>>
)
expectNotType<[boolean, 'rest']>(undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArguments>>)
expectNotType<[boolean[], 'rest']>(undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArguments>>)

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

// we can extract the last (non-rest) element’s type, but not with an index:
expectType<[boolean, 'required']>(undefined as unknown as LastTupleElement<OneRestInTheMiddleTuple>)

/* Non-final optional argument, revisited
   -------------------------------------- */

/* But that means that, through variadic shenanigans, we can have, or at least emulate, non-final optional elements.
   But they are not truly optional: we need to fill the position with `undefined`: */

expectType<3>(([] as unknown as PseudoOptionalNonFinal).length)
expectType<3>(([] as unknown as Parameters<typeof pseudoOptionalBeforeRequiredRevisited>).length)

expectError(pseudoOptionalBeforeRequiredRevisited(0, true))
pseudoOptionalBeforeRequiredRevisited(0, undefined, true)
pseudoOptionalBeforeRequiredRevisited(0, '', true)
expectError(pseudoOptionalBeforeRequiredRevisited(0, 'one', 'two', true))
expectType<[a: number, b: string | undefined, c: boolean]>(
  [] as unknown as Parameters<typeof pseudoOptionalBeforeRequiredRevisited>
)

expectType<number>(undefined as unknown as Parameters<typeof pseudoOptionalBeforeRequiredRevisited>[0])
expectType<string | undefined>(undefined as unknown as Parameters<typeof pseudoOptionalBeforeRequiredRevisited>[1])
expectType<boolean>(undefined as unknown as Parameters<typeof pseudoOptionalBeforeRequiredRevisited>[2])
// @ts-expect-error
type NoElementAtIndex3b = Parameters<typeof pseudoOptionalBeforeRequiredRevisited>[3]
expectType<[boolean, 'required']>(
  undefined as unknown as LastTupleElement<Parameters<typeof pseudoOptionalBeforeRequiredRevisited>>
)

function pseudoOptionalBeforeRequiredInTupleRevisited(): unknown {
  let pobrit: PseudoOptionalNonFinal
  pobrit = [0, undefined, true]
  pobrit = [0, '', true]
  expectError((pobrit = [0, 'one', 'two', true]))
  return pobrit
}
pseudoOptionalBeforeRequiredInTupleRevisited()

/* Of course, we can get the same effect much simpler by marking the middle element as possibly `undefined`: */
expectType<3>(([] as unknown as Parameters<typeof undefinedNonFinal>).length)

expectError(undefinedNonFinal(0, true))
undefinedNonFinal(0, undefined, true)
undefinedNonFinal(0, '', true)
expectError(undefinedNonFinal(0, 'one', 'two', true))
expectType<[a: number, b: string | undefined, c: boolean]>([] as unknown as Parameters<typeof undefinedNonFinal>)

function undefinedNonFinalInTuple(): unknown {
  let pobrit: UndefinedNonFinal
  pobrit = [0, undefined, true]
  pobrit = [0, '', true]
  expectError((pobrit = [0, 'one', 'two', true]))
  return pobrit
}
undefinedNonFinalInTuple()

/* Non-final rest argument, revisited
   -------------------------------------- */

/* With tuple shenanigans, we can create a signature with a rest argument in the middle: */

expectType<number>(([] as unknown as Parameters<typeof pseudoRestBeforeRequiredRevisited>).length)

pseudoRestBeforeRequiredRevisited(0, true)
pseudoRestBeforeRequiredRevisited(0, '', true)
pseudoRestBeforeRequiredRevisited(0, 'one', 'two', true)
expectError(pseudoRestBeforeRequiredRevisited(0, 'one', 'two', 'three'))
expectType<[a: number, ...b: string[], c: boolean]>(
  [] as unknown as Parameters<typeof pseudoRestBeforeRequiredRevisited>
)

expectType<number>(undefined as unknown as Parameters<typeof pseudoRestBeforeRequiredRevisited>[0])
expectType<string | boolean>(undefined as unknown as Parameters<typeof pseudoRestBeforeRequiredRevisited>[1])
expectType<string | boolean>(undefined as unknown as Parameters<typeof pseudoRestBeforeRequiredRevisited>[2])
expectType<string | boolean>(undefined as unknown as Parameters<typeof pseudoRestBeforeRequiredRevisited>[3])
expectType<string | boolean>(undefined as unknown as Parameters<typeof pseudoRestBeforeRequiredRevisited>[999999])
expectType<[boolean, 'required']>(
  undefined as unknown as LastTupleElement<Parameters<typeof pseudoRestBeforeRequiredRevisited>>
)

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

/* TODO:
   - optional before rest is ok
   - optional after rest is nok
   - but we can get around that with shenanigans */
