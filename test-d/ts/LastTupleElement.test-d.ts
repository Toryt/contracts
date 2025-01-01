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

import { expectType, expectNotType } from 'tsd'
import type { FinalRestElement, LastTupleElement } from './LastTupleElement.ts'
import {
  type FinalOptionalArgumentSignature,
  type FinalRestArgumentSignature,
  type MultipleFinalOptionalArgumentsSignature,
  type NoArgumentsSignature,
  type OneArgumentSignature,
  type OneRestInTheMiddleTuple,
  type TwoArgumentsSignature,
  type OneRestInTheMiddleInArraysTuple,
  type PseudoOptionalNonFinalSignature,
  type PseudoRestNonFinalSignature,
  type OneRestInTheMiddleInArraysSignature,
  type OptionalBeforeRestSignature,
  type UndefinedBeforeRestSignature,
  type OptionalAfterRestSignature,
  type DoubleOptionalBeforeRestSignature,
  type DoubleOptionalAfterRestSignature,
  type SingleOptionalArgumentSignature,
  type SingleRestSignature
} from '../../test2/util/SomeSignatures.ts'

expectType<'error: tuple does not contain a rest element and is not an unbounded array'>(
  undefined as unknown as FinalRestElement<Parameters<NoArgumentsSignature>>
)
expectType<'error: there is no last tuple element in an empty tuple'>(
  undefined as unknown as LastTupleElement<Parameters<NoArgumentsSignature>>
)

expectType<'error: tuple does not contain a rest element and is not an unbounded array'>(
  undefined as unknown as FinalRestElement<Parameters<OneArgumentSignature>>
)
expectType<[number, 'required']>(undefined as unknown as LastTupleElement<Parameters<OneArgumentSignature>>)

expectType<'error: tuple does not contain a rest element and is not an unbounded array'>(
  undefined as unknown as FinalRestElement<Parameters<TwoArgumentsSignature>>
)
expectType<[string, 'required']>(undefined as unknown as LastTupleElement<Parameters<TwoArgumentsSignature>>)

expectType<'error: tuple does not contain a rest element and is not an unbounded array'>(
  undefined as unknown as FinalRestElement<Parameters<FinalOptionalArgumentSignature>>
)
expectType<[boolean | undefined, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<FinalOptionalArgumentSignature>>
)
expectNotType<[string | boolean, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<FinalOptionalArgumentSignature>>
)

expectType<'error: tuple does not contain a rest element and is not an unbounded array'>(
  undefined as unknown as FinalRestElement<Parameters<SingleOptionalArgumentSignature>>
)
expectType<[boolean | undefined, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<SingleOptionalArgumentSignature>>
)

expectType<[string | undefined, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArgumentsSignature>>
)
expectNotType<[boolean | number | string, 'optional']>(
  undefined as unknown as LastTupleElement<Parameters<MultipleFinalOptionalArgumentsSignature>>
)
expectType<'error: tuple does not contain a rest element and is not an unbounded array'>(
  undefined as unknown as FinalRestElement<Parameters<MultipleFinalOptionalArgumentsSignature>>
)

expectType<[boolean[], 'rest']>(undefined as unknown as FinalRestElement<Parameters<FinalRestArgumentSignature>>)
expectType<[boolean[], 'rest']>(undefined as unknown as LastTupleElement<Parameters<FinalRestArgumentSignature>>)

// we can extract the last (non-rest) element’s type, but not with an index:
expectType<[boolean, 'required']>(undefined as unknown as LastTupleElement<OneRestInTheMiddleTuple>)
expectType<[boolean[], 'required']>(undefined as unknown as LastTupleElement<OneRestInTheMiddleInArraysTuple>)

expectType<[(string | number)[], 'rest']>(undefined as unknown as LastTupleElement<Parameters<SingleRestSignature>>)

expectType<[boolean, 'required']>(undefined as unknown as LastTupleElement<Parameters<PseudoOptionalNonFinalSignature>>)

expectType<[boolean, 'required']>(undefined as unknown as LastTupleElement<Parameters<PseudoRestNonFinalSignature>>)

expectType<[boolean[], 'required']>(
  undefined as unknown as LastTupleElement<Parameters<OneRestInTheMiddleInArraysSignature>>
)

expectType<[string[], 'rest']>(undefined as unknown as FinalRestElement<Parameters<OptionalBeforeRestSignature>>)
expectType<[string[], 'rest']>(undefined as unknown as LastTupleElement<Parameters<OptionalBeforeRestSignature>>)

expectType<[string[], 'rest']>(undefined as unknown as FinalRestElement<Parameters<UndefinedBeforeRestSignature>>)
expectType<[string[], 'rest']>(undefined as unknown as LastTupleElement<Parameters<UndefinedBeforeRestSignature>>)

expectType<[string[], 'rest']>(undefined as unknown as FinalRestElement<Parameters<DoubleOptionalBeforeRestSignature>>)
expectType<[string[], 'rest']>(undefined as unknown as LastTupleElement<Parameters<DoubleOptionalBeforeRestSignature>>)

expectType<[(string | boolean | undefined)[], 'rest']>(
  undefined as unknown as FinalRestElement<Parameters<OptionalAfterRestSignature>>
)
expectType<[(string | boolean | undefined)[], 'rest']>(
  undefined as unknown as LastTupleElement<Parameters<OptionalAfterRestSignature>>
)

expectType<[(string | boolean | number | undefined)[], 'rest']>(
  undefined as unknown as FinalRestElement<Parameters<DoubleOptionalAfterRestSignature>>
)
expectType<[(string | boolean | number | undefined)[], 'rest']>(
  undefined as unknown as LastTupleElement<Parameters<DoubleOptionalAfterRestSignature>>
)
