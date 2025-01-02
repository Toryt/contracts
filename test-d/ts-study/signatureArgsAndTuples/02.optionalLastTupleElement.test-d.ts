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

import { expectError, expectType, expectAssignable, expectNotAssignable } from 'tsd'
import {
  finalOptionalArgument,
  multipleFinalOptionalArguments,
  type FinalOptionalArgumentSignature,
  type MultipleFinalOptionalArgumentsSignature,
  type SingleOptionalArgumentSignature,
  singleOptionalArgument,
  noArgumentFunction,
  type TwoArgumentsSignature
} from '../../../test2/util/SomeSignatures.ts'

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

expectAssignable<FinalOptionalArgumentSignature>(finalOptionalArgument)
expectAssignable<FinalOptionalArgumentSignature>((a: number[], b: string, c: boolean | undefined): unknown => undefined)
expectAssignable<FinalOptionalArgumentSignature>(
  (a: number[], b: string, c?: boolean | undefined): unknown => undefined
)
expectAssignable<FinalOptionalArgumentSignature>((a: number[], b: string): unknown => undefined)
expectAssignable<FinalOptionalArgumentSignature>((a: number[]): unknown => undefined)
expectAssignable<FinalOptionalArgumentSignature>(noArgumentFunction)

/* Single optional argument
   ------------------------ */

expectType<0 | 1>(([] as unknown as Parameters<SingleOptionalArgumentSignature>).length)
expectType<0 | 1>(([] as unknown as Parameters<typeof singleOptionalArgument>).length)

singleOptionalArgument(true)
singleOptionalArgument(undefined)
singleOptionalArgument()
expectError(singleOptionalArgument(true, 0))

expectType<[a?: boolean | undefined]>([] as unknown as Parameters<SingleOptionalArgumentSignature>)

expectType<boolean | undefined>(undefined as unknown as Parameters<SingleOptionalArgumentSignature>[0])

expectAssignable<SingleOptionalArgumentSignature>(singleOptionalArgument)
expectAssignable<SingleOptionalArgumentSignature>((a: boolean | undefined): unknown => undefined)
expectAssignable<SingleOptionalArgumentSignature>((a?: boolean | undefined): unknown => undefined)
expectAssignable<SingleOptionalArgumentSignature>(noArgumentFunction)

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

expectAssignable<MultipleFinalOptionalArgumentsSignature>(multipleFinalOptionalArguments)

expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c?: boolean, d?: number, e?: string | undefined): unknown => undefined
)
expectAssignable<string | undefined>('' as unkown as string) // contravariant
// @ts-expect-error
function fail1(a: number, b: string[], c?: boolean, d?: number, e: string | undefined): unknown {
  return undefined
}
expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c: boolean | undefined, d?: number, e?: string): unknown => undefined
)
expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c: boolean | undefined, d?: number, e?: string): unknown => undefined
)
expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c: boolean | undefined, d: number | undefined, e?: string): unknown => undefined
)
expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c: boolean | undefined, d: number | undefined, e: string | undefined): unknown => undefined
)

expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c?: boolean, d?: number): unknown => undefined
)
expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c?: boolean, d?: number): unknown => undefined
)
// @ts-expect-error
function fail2(a: number, b: string[], c?: boolean, d: number | undefined): unknown {
  return undefined
}
expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c: boolean | undefined, d?: number): unknown => undefined
)
expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c: boolean | undefined, d: number | undefined): unknown => undefined
)

expectAssignable<MultipleFinalOptionalArgumentsSignature>((a: number, b: string[], c?: boolean): unknown => undefined)
expectAssignable<MultipleFinalOptionalArgumentsSignature>(
  (a: number, b: string[], c: boolean | undefined): unknown => undefined
)

expectAssignable<MultipleFinalOptionalArgumentsSignature>((a: number, b: string[]): unknown => undefined)
expectAssignable<MultipleFinalOptionalArgumentsSignature>((a: number): unknown => undefined)
expectAssignable<MultipleFinalOptionalArgumentsSignature>(noArgumentFunction)

/* So: `X | undefined <: X? <: X` */

expectAssignable<TwoArgumentsSignature>((a?: number[], b?: string): unknown => undefined)
expectAssignable<TwoArgumentsSignature>((a: number[] | undefined, b: string | undefined): unknown => undefined)
