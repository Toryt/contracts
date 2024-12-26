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

import { expectError, expectType, expectAssignable, expectNotAssignable } from 'tsd'

/* The arguments of literal signatures of functions can be required, optional (`?`) , or variadic (`...`), in that
   order. */

expectType<[]>([] as unknown as Parameters<() => unknown>)
expectType<[a: number]>([] as unknown as Parameters<(a: number) => unknown>)
expectType<[a: number, b: string]>([] as unknown as Parameters<(a: number, b: string) => unknown>)

/* Optional last argument
   ---------------------- */

type FinalOptionalArgument = (a: number, b: string, c?: boolean) => unknown
const finalOptionalArgument: FinalOptionalArgument = (a: number, b: string, c?: boolean) => {
  return undefined
}

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

/* Variadic last argument
   ---------------------- */

type FinalVariadicArgument = (a: number, b: string, ...c: boolean[]) => unknown

/* There is no weirdness here: */
expectType<[a: number, b: string, ...c: boolean[]]>([] as unknown as Parameters<FinalVariadicArgument>)

/* An optional variadic argument is rejected. It makes no sense. When there are no actual arguments for the
   variadic part, the array is just empty. Actually, Prettier even corrects this. */
// function optionalVariadic(a: number, b?: string, ...c?: boolean[]): unknown {
//   return undefined
// }

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

/* Non-final variadic argument
   --------------------------- */

/* There can be no required arguments after a variadic argument in a signature either. Even `expectError` of `tsd`
   rejects this. We need `@ts-expect-error` to show this. */
// @ts-expect-error
function variadicBeforeRequired(a: number, ...b: string[], c: boolean): unknown {
  return undefined
}
/* But we _can_ have variadic elements before required elements in a tuple: */
function variadicBeforeRequiredInTuple(): unknown {
  let vbrit: [a: number, ...b: string[], c: boolean] = [0, '', true]
  vbrit = [0, true]
  vbrit = [0, '', true]
  vbrit = [0, 'one', 'two', true]
  return vbrit
}
variadicBeforeRequiredInTuple()

/* Non-final optional argument, revisited
   -------------------------------------- */

/* But that means that, through variadic shenanigans, we can have, or at least emulate, non-final optional elements.
   But they are not truly optional: we need to fill the position with `undefined`: */
type PseudoOptionalString = [b?: string]
type PseudoOptionalNonFinal = [a: number, ...b: PseudoOptionalString, c: boolean]
function pseudoOptionalBeforeRequiredRevisited(...args: PseudoOptionalNonFinal): unknown {
  return undefined
}
expectError(pseudoOptionalBeforeRequiredRevisited(0, true))
pseudoOptionalBeforeRequiredRevisited(0, undefined, true)
pseudoOptionalBeforeRequiredRevisited(0, '', true)
expectError(pseudoOptionalBeforeRequiredRevisited(0, 'one', 'two', true))
expectType<[a: number, b: string | undefined, c: boolean]>(
  [] as unknown as Parameters<typeof pseudoOptionalBeforeRequiredRevisited>
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
function undefinedNonFinal(a: number, b: string | undefined, c: boolean): unknown {
  return undefined
}
expectError(undefinedNonFinal(0, true))
undefinedNonFinal(0, undefined, true)
undefinedNonFinal(0, '', true)
expectError(undefinedNonFinal(0, 'one', 'two', true))
expectType<[a: number, b: string | undefined, c: boolean]>([] as unknown as Parameters<typeof undefinedNonFinal>)

function undefinedNonFinalInTuple(): unknown {
  let pobrit: [a: number, b: string | undefined, c: boolean]
  pobrit = [0, undefined, true]
  pobrit = [0, '', true]
  expectError((pobrit = [0, 'one', 'two', true]))
  return pobrit
}
undefinedNonFinalInTuple()

/* TODO:
   - multiple optionals is ok (?)
   - multiple variadics is ok
   - optional before variadic is ok
   - optional after variadic is nok
   - but we can get around that with shenanigans */
