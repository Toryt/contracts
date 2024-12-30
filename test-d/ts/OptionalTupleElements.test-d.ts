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

import { expectAssignable, expectNotAssignable, expectNotType, expectType } from 'tsd'

expectAssignable<[string, number]>(['a string', 0])

/* NOTE: `number?` is _not_ equivalent to `number | undefined`
         * Optional tuple elements (`number?`) allow omission.
         * Union with undefined (`number | undefined`) allows explicit `undefined` but requires the element to be
           present. */

type OptionalLastElement = [string, number?]
expectAssignable<OptionalLastElement>(['a string', 0])
expectAssignable<OptionalLastElement>(['a string'])
expectNotAssignable<OptionalLastElement>(['a string', undefined])

// equal
expectAssignable<OptionalLastElement>(undefined as unknown as [string, number?])
expectAssignable<[string, number?]>(undefined as unknown as OptionalLastElement)
expectType<[string, number?]>(undefined as unknown as OptionalLastElement)
expectType<[string, (number | undefined)?]>(undefined as unknown as OptionalLastElement)
expectType<[string, number?]>(undefined as unknown as [string, (number | undefined)?])

// equivalent, but not equal (<: and :>, but not === ???)
expectAssignable<OptionalLastElement>(undefined as unknown as [string, number?] | [string])
expectAssignable<[string, number?] | [string]>(undefined as unknown as OptionalLastElement)
expectNotType<OptionalLastElement>(undefined as unknown as [string, number?] | [string])
expectNotType<[string, number?] | [string]>(undefined as unknown as OptionalLastElement)

expectAssignable<OptionalLastElement>(undefined as unknown as [string, (number | undefined)?] | [string])
expectAssignable<[string, (number | undefined)?] | [string]>(undefined as unknown as OptionalLastElement)
expectNotType<OptionalLastElement>(undefined as unknown as [string, (number | undefined)?] | [string])
expectNotType<[string, (number | undefined)?] | [string]>(undefined as unknown as OptionalLastElement)

// assignable
expectAssignable<OptionalLastElement>(undefined as unknown as [string, number | undefined] | [string])
expectAssignable<OptionalLastElement>(undefined as unknown as [string, number] | [string])
expectAssignable<OptionalLastElement>(undefined as unknown as [string])
expectNotAssignable<OptionalLastElement>(undefined as unknown as [])

expectAssignable<[string, number?]>(undefined as unknown as OptionalLastElement)
expectAssignable<[string, number?] | [string]>(undefined as unknown as OptionalLastElement)
expectAssignable<[string, (number | undefined)?] | [string]>(undefined as unknown as OptionalLastElement)
expectNotAssignable<[string, number | undefined] | [string]>(undefined as unknown as OptionalLastElement)
expectNotAssignable<[string, number] | [string]>(undefined as unknown as OptionalLastElement)
expectNotAssignable<[string]>(undefined as unknown as OptionalLastElement)
expectNotAssignable<[string, number | undefined] | [string]>(undefined as unknown as OptionalLastElement)

type PossiblyUndefinedLastElement = [string, number | undefined]
expectAssignable<PossiblyUndefinedLastElement>(['a string', 0])
expectAssignable<PossiblyUndefinedLastElement>(['a string', undefined])
expectNotAssignable<PossiblyUndefinedLastElement>(['a string'])

expectAssignable<PossiblyUndefinedLastElement>(undefined as unknown as [string, number | undefined])
expectAssignable<PossiblyUndefinedLastElement>(undefined as unknown as [string, undefined])
expectAssignable<PossiblyUndefinedLastElement>(undefined as unknown as [string, number])
expectNotAssignable<PossiblyUndefinedLastElement>(undefined as unknown as [string, number] | [string])
expectNotAssignable<PossiblyUndefinedLastElement>(undefined as unknown as [string])

expectAssignable<[string, number | undefined]>(undefined as unknown as PossiblyUndefinedLastElement)
expectAssignable<[string, number | undefined] | [string]>(undefined as unknown as PossiblyUndefinedLastElement)
expectNotAssignable<[string, undefined]>(undefined as unknown as PossiblyUndefinedLastElement)
expectNotAssignable<[string, number]>(undefined as unknown as PossiblyUndefinedLastElement)
expectNotAssignable<[string, number] | [string]>(undefined as unknown as PossiblyUndefinedLastElement)
expectNotAssignable<[string]>(undefined as unknown as PossiblyUndefinedLastElement)

type TwoOptionalLastElements = [string, number?, boolean?]
expectAssignable<TwoOptionalLastElements>(['a string', 0, true])
expectAssignable<TwoOptionalLastElements>(['a string', 0])
expectAssignable<TwoOptionalLastElements>(['a string'])

expectAssignable<TwoOptionalLastElements>(undefined as unknown as [string, number?, boolean?])
expectAssignable<TwoOptionalLastElements>(undefined as unknown as [string, number?, boolean?] | [string, number?])
expectAssignable<TwoOptionalLastElements>(undefined as unknown as [string, number?])
expectAssignable<TwoOptionalLastElements>(undefined as unknown as [string])
expectNotAssignable<OptionalLastElement>(undefined as unknown as [])

expectAssignable<[string, number?, boolean?]>(undefined as unknown as TwoOptionalLastElements)
expectAssignable<[string, number?, boolean?] | [string, number?] | [string]>(
  undefined as unknown as TwoOptionalLastElements
)
expectNotAssignable<[string, number, boolean] | [string, number?] | [string]>(
  undefined as unknown as TwoOptionalLastElements
)
