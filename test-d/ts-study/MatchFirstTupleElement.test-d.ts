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

type RequiredMatches<T extends unknown[]> = T extends [first: infer First, ...tail: unknown[]] ? [First] : false
type OptionalMatches1<T extends unknown[]> = T extends [first?: infer First, ...tail: unknown[]] ? [First] : false
type OptionalMatches2<T extends unknown[]> = T extends [first?: infer First, ...tail: unknown[]] ? [First?] : false
type OptionalMatches<T extends unknown[]> = T extends [first?: infer First, ...tail: unknown[]]
  ? T extends [first: infer FirstRequired, ...tail: unknown[]]
    ? [FirstRequired]
    : [First?]
  : false

expectType<[number]>(true as unknown as RequiredMatches<[number, ...string[]]>)
expectType<[number]>(true as unknown as OptionalMatches1<[number, ...string[]]>)
expectType<[number?]>(true as unknown as OptionalMatches2<[number, ...string[]]>)
expectType<[number]>(true as unknown as OptionalMatches<[number, ...string[]]>)

expectType<[number[]]>(true as unknown as RequiredMatches<[number[], ...string[]]>)
expectType<[number[]]>(true as unknown as OptionalMatches1<[number[], ...string[]]>)
expectType<[number[]?]>(true as unknown as OptionalMatches2<[number[], ...string[]]>)
expectType<[number[]]>(true as unknown as OptionalMatches<[number[], ...string[]]>)

expectType<false>(true as unknown as RequiredMatches<[number?, ...string[]]>)
expectType<[number]>(true as unknown as OptionalMatches1<[number?, ...string[]]>)
expectType<[number?]>(true as unknown as OptionalMatches2<[number?, ...string[]]>)
expectType<[number?]>(true as unknown as OptionalMatches<[number?, ...string[]]>)

expectType<false>(true as unknown as RequiredMatches<[number[]?, ...string[]]>)
expectType<[number[]]>(true as unknown as OptionalMatches1<[number[]?, ...string[]]>)
expectType<[number[]?]>(true as unknown as OptionalMatches2<[number[]?, ...string[]]>)
expectType<[number[]?]>(true as unknown as OptionalMatches<[number[]?, ...string[]]>)
