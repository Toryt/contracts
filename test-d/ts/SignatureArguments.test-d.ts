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
  pseudoOptionalNonFinal,
  pseudoRestNonFinal,
  oneRestInTheMiddleInArrays,
  optionalAfterRest,
  optionalBeforeRest,
  undefinedNonFinal,
  undefinedBeforeRest,
  type FinalOptionalArgumentSignature,
  type FinalRestArgumentSignature,
  type MultipleFinalOptionalArgumentsSignature,
  type NoRestViaMultipleVariadics,
  type OneRestViaMultipleVariadics1,
  type OneRestViaMultipleVariadics2,
  type OneRest1,
  type OneRest2,
  type NoArgumentsSignature,
  type OneArgumentSignature,
  type OneRestInTheMiddleTuple,
  type PseudoOptionalNonFinalTuple,
  type TwoArgumentsSignature,
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
  doubleOptionalAfterRest
} from './PossibleSignatures.ts'

// type Succ<N extends number> = [1, 2, 3, 4, 5, 6, 7, 8, 9][N]

// type ZoomIn0<T extends unknown[], N extends number = 0> = T extends []
//   ? 'empty'
//   : T extends [first: infer First, ...tail: infer Tail]
//     ? [i: N, type: 'required', first: First, tail1: Tail, tailLength: Tail['length'], tail: ZoomIn0<Tail, Succ<N>>] // required single
//     : T extends [first?: infer First, ...tail: infer Tail]
//       ? number extends Tail['length']
//         ? // MUDO this works, but maybe not when the last element is a required array?
//           [i: N, type: 'rest', first: Tail, tail1: [], tailLength: 0, tail: 'empty']
//         : [i: N, type: 'optional', first: First, tail1: Tail, tailLength: Tail['length'], tail: ZoomIn0<Tail, Succ<N>>]
//       : 'done'
// // : T extends [first?: unknown, ...tail: infer Tail] // optional single or rest
// //   ? FinalRestElement<Tail, Succ<N>>
// //   : [T, 'rest', N]

type FinalRestElement<T extends unknown[]> = number extends T['length']
  ? T extends [first: unknown, ...tail: infer Tail1]
    ? FinalRestElement<Tail1> // required single first element, continue
    : T extends [first?: unknown, ...tail: infer Tail2]
      ? // MUDO error: first is optional, but there is no continuation here, for when Tail contains still other optional OR REQUIRED elements
        [Tail2, 'rest']
      : [T, 'rest']
  : 'error: tuple does not contain a rest element'

type LastTupleElement<T extends unknown[]> = T extends []
  ? 'error: there is no last tuple element in an empty tuple'
  : T extends [...start: unknown[], last: infer Last1] // required single
    ? [Last1, 'required']
    : /* The last element is not required. It is either optional or rest.
         Since rest elements can not be followed by optional or other rest elements, if there is a rest element in `T`,
         it is the last one. */ number extends T['length'] // T has a rest element (otherwise T['length'] would be a (union of) bounded numbers)
      ? FinalRestElement<T>
      : T extends [...start: infer _, last?: infer Last2]
        ? [Last2, 'optional'] // optional single
        : 'impossible: not empty, not required, not optional or rest'

/* The arguments of literal signatures of functions can be required, optional (`?`) , or rest (`...`), in that
   order. */

expectType<[]>([] as unknown as Parameters<NoArgumentsSignature>)
expectType<0>(([] as unknown as Parameters<NoArgumentsSignature>).length)
// @ts-expect-error
type NoElementAtIndex0 = NoArgumentsSignature<OneArgumentSignature>[0]
expectType<'error: there is no last tuple element in an empty tuple'>(
  undefined as unknown as LastTupleElement<Parameters<NoArgumentsSignature>>
)
expectType<'error: tuple does not contain a rest element'>(
  undefined as unknown as FinalRestElement<Parameters<NoArgumentsSignature>>
)

expectType<[a: number]>([] as unknown as Parameters<OneArgumentSignature>)
expectType<1>(([] as unknown as Parameters<OneArgumentSignature>).length)
expectType<number>(undefined as unknown as Parameters<OneArgumentSignature>[0])
// @ts-expect-error
type NoElementAtIndex1 = Parameters<OneArgumentSignature>[1]
expectType<[number, 'required']>(undefined as unknown as LastTupleElement<Parameters<OneArgumentSignature>>)
expectType<'error: tuple does not contain a rest element'>(
  undefined as unknown as FinalRestElement<Parameters<OneArgumentSignature>>
)

expectType<[a: number[], b: string]>([] as unknown as Parameters<TwoArgumentsSignature>)
expectType<2>(([] as unknown as Parameters<TwoArgumentsSignature>).length)
expectType<number[]>(undefined as unknown as Parameters<TwoArgumentsSignature>[0])
expectType<string>(undefined as unknown as Parameters<TwoArgumentsSignature>[1])
// @ts-expect-error
type NoElementAtIndex2 = Parameters<TwoArgumentsSignature>[2]
expectType<[string, 'required']>(undefined as unknown as LastTupleElement<Parameters<TwoArgumentsSignature>>)
expectType<'error: tuple does not contain a rest element'>(
  undefined as unknown as FinalRestElement<Parameters<TwoArgumentsSignature>>
)

/* Optional last argument
   ---------------------- */

expectType<2 | 3>(([] as unknown as Parameters<FinalOptionalArgumentSignature>).length)
expectType<2 | 3>(([] as unknown as Parameters<typeof finalOptionalArgument>).length)

/* Note that it is necessary for the type of the optional argument to include `undefined`: */
expectType<[a: number[], b: string, c?: boolean | undefined]>(
  [] as unknown as Parameters<FinalOptionalArgumentSignature>
)
/* Without `| undefined`, both `expectType` and `expectNotType` fail
   * `expectType` fails  because `boolean | undefined` is not assignable to `boolean`, which is sensible: the last
      element of the tuple might be optional, but if it is there, it must be `boolean` and cannot be `undefined`.
      The last element in the signature can be `undefined` in the implementation of the function (that is how we would
      recognize it is not given in the implementation). From the callers standpoint, we can also _call_ the function
      with `undefined` as the last actual argument when its optional. */
// expectType<[a:number, b:string, c?:boolean]>([] as unknown as Parameters<FinalOptionalArgumentSignature>)
finalOptionalArgument([0], '', undefined) // works fine.
/*    That is not ok for a tuple though (`undefined` is not assignable to type `boolean`): */
expectError(function (): [a: number[], b: string, c?: boolean] {
  const tupleWithLastElementOptional: [a: number[], b: string, c?: boolean] = [[0], '', undefined]
  return tupleWithLastElementOptional
})
function allowUndefinedInOptionalTupleElement(): [a: number[], b: string, c?: boolean | undefined] {
  const tupleWithLastElementOptional: [a: number[], b: string, c?: boolean | undefined] = [[0], '', undefined]
  return tupleWithLastElementOptional
}
allowUndefinedInOptionalTupleElement()
/*    The same applies to a bare tuple: */
// expectType<[a: number, b: string, c?: boolean]>([] as unknown as [a: number, b: string, c?: boolean | undefined])
/* * `expectNotType` fails because
      “`[a: number, b: string, c?: boolean]` is identical to  `[a: number, b: string, c?: boolean | undefined]`”.
      **That’s weird, given the above.** Is this a `tsd` thing?
      The same applies to a bare tuple: */
// expectNotType<[a:number, b:string, c?:boolean]>([] as unknown as Parameters<FinalOptionalArgumentSignature>)
// expectNotType<[a: number, b: string, c?: boolean]>([] as unknown as [a: number, b: string, c?: boolean | undefined])
/* So, it is to be expected that the parameters of the signature (or the similar bare tuple) are not assignable to the
   tuple where the last element does not allow `undefined`, but that such a tuple is assignable to the parameters of
   such a signature (or the similar bare tuple). They clearly are not identical. Where is that coming from? */
expectNotAssignable<[a: number[], b: string, c?: boolean]>([] as unknown as Parameters<FinalOptionalArgumentSignature>)
expectNotAssignable<[a: number[], b: string, c?: boolean]>(
  [] as unknown as [a: number[], b: string, c?: boolean | undefined]
)
expectAssignable<Parameters<FinalOptionalArgumentSignature>>([] as unknown as [a: number[], b: string, c?: boolean])
expectAssignable<[a: number[], b: string, c?: boolean | undefined]>(
  [] as unknown as [a: number[], b: string, c?: boolean]
)

expectType<number[]>(undefined as unknown as Parameters<FinalOptionalArgumentSignature>[0])
expectType<string>(undefined as unknown as Parameters<FinalOptionalArgumentSignature>[1])
expectType<boolean | undefined>(undefined as unknown as Parameters<FinalOptionalArgumentSignature>[2])
// @ts-expect-error
type NoElementAtIndex3a = Parameters<FinalOptionalArgumentSignature>[3]
expectType<[boolean | undefined, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<FinalOptionalArgumentSignature>>
)
expectNotType<[string | boolean, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<FinalOptionalArgumentSignature>>
)
expectType<'error: tuple does not contain a rest element'>(
  undefined as unknown as FinalRestElement<Parameters<FinalOptionalArgumentSignature>>
)

/* Multiple final optional arguments
   --------------------------------- */

expectType<2 | 3 | 4 | 5>(([] as unknown as Parameters<MultipleFinalOptionalArgumentsSignature>).length)
expectType<2 | 3 | 4 | 5>(([] as unknown as Parameters<typeof multipleFinalOptionalArguments>).length)

multipleFinalOptionalArguments(0, [''])
multipleFinalOptionalArguments(0, [''], true)
multipleFinalOptionalArguments(0, [''], undefined)
multipleFinalOptionalArguments(0, [''], true, 1)
multipleFinalOptionalArguments(0, [''], undefined, 1)
multipleFinalOptionalArguments(0, [''], undefined, undefined)
multipleFinalOptionalArguments(0, [''], true, 1, 'last')
multipleFinalOptionalArguments(0, [''], undefined, 1, 'last')
multipleFinalOptionalArguments(0, [''], undefined, undefined, 'last')
multipleFinalOptionalArguments(0, [''], undefined, undefined, undefined)
const viaATuple: Parameters<MultipleFinalOptionalArgumentsSignature> = [0, [''], true, 1, 'last']
multipleFinalOptionalArguments(...viaATuple)
expectError(multipleFinalOptionalArguments(0, [''], true, 1, 'last', 34))
expectError(multipleFinalOptionalArguments(0, [''], undefined, 1, 'last', 'past last'))
expectError(multipleFinalOptionalArguments(0, [''], undefined, undefined, 'last', true))
expectError(multipleFinalOptionalArguments(0, [''], undefined, undefined, undefined, 'one more'))
expectError(multipleFinalOptionalArguments(0, [''], undefined, undefined, undefined, undefined))
const notEvenViaATuple: [...Parameters<MultipleFinalOptionalArgumentsSignature>, unknown] = [
  0,
  [''],
  true,
  1,
  'last',
  34
]
expectError(multipleFinalOptionalArguments(...notEvenViaATuple))
expectType<[a: number, b: string[], c?: boolean | undefined, d?: number | undefined, e?: string | undefined]>(
  [] as unknown as Parameters<MultipleFinalOptionalArgumentsSignature>
)

expectType<number>(undefined as unknown as Parameters<MultipleFinalOptionalArgumentsSignature>[0])
expectType<string[]>(undefined as unknown as Parameters<MultipleFinalOptionalArgumentsSignature>[1])
expectType<boolean | undefined>(undefined as unknown as Parameters<MultipleFinalOptionalArgumentsSignature>[2])
expectType<number | undefined>(undefined as unknown as Parameters<MultipleFinalOptionalArgumentsSignature>[3])
expectType<string | undefined>(undefined as unknown as Parameters<MultipleFinalOptionalArgumentsSignature>[4])
// @ts-expect-error
type NoElementAtIndex3 = Parameters<MultipleFinalOptionalArgumentsSignature>[5]
expectType<[string | undefined, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArgumentsSignature>>
)
expectNotType<[boolean | number | string, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArgumentsSignature>>
)
expectType<'error: tuple does not contain a rest element'>(
  undefined as unknown as FinalRestElement<Parameters<MultipleFinalOptionalArgumentsSignature>>
)

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

expectType<number>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[0])
expectType<string[]>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[1])
// Note that `undefined` is not in the type!
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[2])
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[3])
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[999999])
// Note that `undefined` is not in the union!
expectType<number | string[] | boolean>(
  undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[number]
)

// we can get the type of the last argument:
expectType<[boolean[], 'rest']>(
  undefined as unknown as FinalRestElement<Parameters<FinalRestArgumentAfterArraySignature>>
)
expectType<[boolean[], 'rest']>(
  undefined as unknown as LastTupleElement<Parameters<FinalRestArgumentAfterArraySignature>>
)

/* After an array: */

expectType<number>(([] as unknown as Parameters<FinalRestArgumentAfterArraySignature>).length)

/* There is no weirdness here: */
expectType<[a: number, b: string[], ...c: boolean[]]>([] as unknown as Parameters<FinalRestArgumentAfterArraySignature>)

/* An optional rest argument is rejected. It makes no sense. When there are no actual arguments for the
   rest part, the array is just empty. Actually, Prettier even corrects this. */
// function optionalRest(a: number, b?: string, ...c?: boolean[]): unknown {
//   return undefined
// }

expectType<number>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[0])
expectType<string[]>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[1])
// Note that `undefined` is not in the type!
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[2])
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[3])
expectType<boolean>(undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[999999])
// Note that `undefined` is not in the union!
expectType<number | string[] | boolean>(
  undefined as unknown as Parameters<FinalRestArgumentAfterArraySignature>[number]
)

// we can get the type of the last argument:
expectType<[boolean[], 'rest']>(
  undefined as unknown as FinalRestElement<Parameters<FinalRestArgumentAfterArraySignature>>
)
expectType<[boolean[], 'rest']>(
  undefined as unknown as LastTupleElement<Parameters<FinalRestArgumentAfterArraySignature>>
)

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

// we can extract the last (non-rest) element’s type, but not with an index:
expectType<[boolean[], 'required']>(undefined as unknown as LastTupleElement<OneRestInTheMiddleInArraysTuple>)

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
expectType<[boolean, 'required']>(undefined as unknown as LastTupleElement<Parameters<PseudoOptionalNonFinalSignature>>)

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
expectType<[boolean, 'required']>(undefined as unknown as LastTupleElement<Parameters<PseudoRestNonFinalSignature>>)

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
expectType<[boolean[], 'required']>(
  undefined as unknown as LastTupleElement<Parameters<OneRestInTheMiddleInArraysSignature>>
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
expectType<[string[], 'rest']>(undefined as unknown as LastTupleElement<Parameters<OptionalBeforeRestSignature>>)
expectType<[string[], 'rest']>(undefined as unknown as FinalRestElement<Parameters<OptionalBeforeRestSignature>>)

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
expectType<[string[], 'rest']>(undefined as unknown as LastTupleElement<Parameters<UndefinedBeforeRestSignature>>)
expectType<[string[], 'rest']>(undefined as unknown as FinalRestElement<Parameters<UndefinedBeforeRestSignature>>)

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
// MUDO ERRORs in FinalRestElement
expectNotType<[string[], 'rest']>(
  undefined as unknown as LastTupleElement<Parameters<DoubleOptionalBeforeRestSignature>>
)
expectNotType<[string[], 'rest']>(
  undefined as unknown as FinalRestElement<Parameters<DoubleOptionalBeforeRestSignature>>
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
expectType<[(string | boolean | undefined)[], 'rest']>(
  undefined as unknown as LastTupleElement<Parameters<OptionalAfterRestSignature>>
)
expectType<[(string | boolean | undefined)[], 'rest']>(
  undefined as unknown as FinalRestElement<Parameters<OptionalAfterRestSignature>>
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
doubleOptionalAfterRest([0], false, 'one', true, 'two', true)

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
expectType<[(string | boolean | number | undefined)[], 'rest']>(
  undefined as unknown as LastTupleElement<Parameters<DoubleOptionalAfterRestSignature>>
)
expectType<[(string | boolean | number | undefined)[], 'rest']>(
  undefined as unknown as FinalRestElement<Parameters<DoubleOptionalAfterRestSignature>>
)
