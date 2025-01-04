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

import { expectAssignable, expectNotAssignable } from 'tsd'
import type { Postcondition, PostconditionKwargs } from '../../src/index.ts'
import type {
  ASignature,
  DoubleOptionalAfterRestSignature,
  DoubleOptionalBeforeRestSignature,
  FinalOptionalArgumentSignature,
  FinalRestArgumentAfterArraySignature,
  FinalRestArgumentSignature,
  MultipleFinalOptionalArgumentsSignature,
  NoArgumentsSignature,
  OneArgumentSignature,
  OneRestInTheMiddleInArraysSignature,
  OptionalBeforeRestSignature,
  PseudoOptionalNonFinalSignature,
  PseudoRestNonFinalSignature,
  SingleOptionalArgumentSignature,
  SingleRestSignature,
  TwoArgumentsSignature,
  UndefinedBeforeRestSignature,
  UndefinedNonFinalSignature
} from '../../test2/util/SomeSignatures.ts'
import { type RootType, isRootType, isLevel2Type, Level3Class } from '../../test2/util/SomeTypes.ts'

/* NoArgumentsSignature */

expectAssignable<Postcondition<NoArgumentsSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length === 0
)
expectAssignable<Postcondition<NoArgumentsSignature>>(({ args }) => args.length === 0)
expectAssignable<Postcondition<NoArgumentsSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<NoArgumentsSignature>>(({}) => globalThis)
expectAssignable<Postcondition<NoArgumentsSignature>>(() => globalThis)
expectNotAssignable<Postcondition<NoArgumentsSignature>>(
  ({ result, args, somethingElse }: PostconditionKwargs<NoArgumentsSignature> & { readonly somethingElse: unknown }) =>
    typeof result === 'string' && args.length === 0 && !!somethingElse
)
expectNotAssignable<Postcondition<NoArgumentsSignature>>(
  ({ result, args: [a] }: { result: unknown; args: [unknown] }) => typeof result === 'string' && !!a
)

/* OneArgumentSignature */

expectAssignable<Postcondition<OneArgumentSignature>>(({ result, args: [a] }) => typeof result === 'string' && a === 0)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<OneArgumentSignature>>(({ args: [a] }) => a === 0)
expectAssignable<Postcondition<OneArgumentSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<OneArgumentSignature>>(({}) => globalThis)
expectAssignable<Postcondition<OneArgumentSignature>>(() => globalThis)
expectNotAssignable<Postcondition<OneArgumentSignature>>(
  ({ args: [a, b] }: { args: [number, unknown] }) => a === 0 && !!b
)
expectNotAssignable<Postcondition<OneArgumentSignature>>(
  ({ result, args: [a] }: { result: unknown; args: [unknown] }) => typeof result === 'string' && !!a
)

/* TwoArgumentsSignature */

expectAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a.length === 0 && b !== ''
)
expectAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a.length === 0
)
expectAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<TwoArgumentsSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<TwoArgumentsSignature>>(({}) => globalThis)
expectAssignable<Postcondition<TwoArgumentsSignature>>(() => globalThis)
expectNotAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ args: [a, b] }: { args: [number, unknown] }) => a === 0 && !!b
)
expectNotAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ result, args: [a] }: { result: unknown; args: [unknown] }) => typeof result === 'string' && !!a
)

/* FinalOptionalArgumentSignature */

expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ result, args: [a, b, c] }) => typeof result === 'string' && a.length === 0 && b !== '' && c === undefined
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ result, args: [a, b, c] }: { result: unknown; args: readonly [number[], string, (boolean | undefined)?] }) =>
    typeof result === 'string' && a.length === 0 && b !== '' && c === undefined
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a.length === 0 && b !== ''
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a.length === 0
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(({}) => globalThis)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(() => globalThis)
expectNotAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ args: [a, b] }: { args: [number, unknown] }) => a === 0 && !!b
)
expectNotAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ result, args: [a] }: { result: unknown; args: [unknown] }) => typeof result === 'string' && !!a
)

/* SingleOptionalArgumentSignature */

expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(({ result, args: [a] }) =>
  typeof result === 'string' && a === undefined ? 'undefined' : a
)
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(
  ({ result, args: [a] }: { result: unknown; args: readonly [(boolean | undefined)?] }) =>
    typeof result === 'string' && a === undefined ? 'undefined' : a
)
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(({}) => globalThis)
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(() => globalThis)
expectNotAssignable<Postcondition<SingleOptionalArgumentSignature>>(({ args: [a] }: { args: [boolean] }) => a)
expectNotAssignable<Postcondition<SingleOptionalArgumentSignature>>(
  ({ args: [a, b] }: { args: [boolean?, unknown?] }) => a !== undefined && !!b
)
expectNotAssignable<Postcondition<SingleOptionalArgumentSignature>>(
  ({ result, args: [a] }: { result: unknown; args: [unknown] }) => typeof result === 'string' && !!a
)

/* MultipleFinalOptionalArgumentsSignature */

expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ result, args: [a, b, c, d, e] }) =>
    typeof result === 'string' &&
    a === 0 &&
    b.length > 0 &&
    c === undefined &&
    (d === undefined || d < 0) &&
    (e === undefined || e !== '')
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ result, args: [a, b, c, d] }) =>
    typeof result === 'string' && a === 0 && b.length > 0 && c === undefined && (d === undefined || d < 0)
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ result, args: [a, b, c] }) => typeof result === 'string' && a === 0 && b.length > 0 && c === undefined
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a === 0 && b.length > 0
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a === 0
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(({}) => globalThis)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(() => globalThis)

/* FinalRestArgumentSignature */

expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ result, args: [a, b, ...c] }) => typeof result === 'string' && a === 0 && b !== '' && c.every(e => e)
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ result, args: [a, b, c] }) => typeof result === 'string' && a === 0 && b !== '' && c !== undefined && c
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ result, args: [a, b, c, d, e] }) =>
    typeof result === 'string' &&
    a === 0 &&
    b !== '' &&
    c !== undefined &&
    c &&
    d !== undefined &&
    d &&
    e !== undefined &&
    e
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a === 0 && b !== ''
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a === 0
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<FinalRestArgumentSignature>>(({}) => globalThis)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(() => globalThis)

/* FinalRestArgumentAfterArraySignature */

expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ result, args: [a, b, ...c] }) => typeof result === 'string' && a === 0 && b.length > 0 && c.every(e => e)
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ result, args: [a, b, c] }) => typeof result === 'string' && a === 0 && b.length > 0 && c !== undefined && c
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ result, args: [a, b, c, d, e] }) =>
    typeof result === 'string' &&
    a === 0 &&
    b.length > 0 &&
    c !== undefined &&
    c &&
    d !== undefined &&
    d &&
    e !== undefined &&
    e
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a === 0 && b.length > 0
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a === 0
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(({}) => globalThis)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(() => globalThis)

/* SingleRestSignature */

expectAssignable<Postcondition<SingleRestSignature>>(
  ({ result, args: [...a] }) => typeof result === 'string' && a.some(e => result === e)
)
expectAssignable<Postcondition<SingleRestSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && result === a
)
expectAssignable<Postcondition<SingleRestSignature>>(
  ({ result, args: [a, b, c] }) => typeof result === 'string' && (result === a || result === b || result === c)
)
expectAssignable<Postcondition<SingleRestSignature>>(
  ({ result, args }) => typeof result === 'string' && args.some(e => result === e)
)
expectAssignable<Postcondition<SingleRestSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<SingleRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<SingleRestSignature>>(() => globalThis)

/* PseudoOptionalNonFinalSignature */

expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ result, args: [a, b, c] }) => typeof result === 'string' && a > 0 && (b === undefined || b === '') && c
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ result, args: [a, ...b] }) => typeof result === 'string' && a > 0 && b.length > 1 && typeof b[0] === 'boolean'
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a > 0 && (b === undefined || b === '')
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a > 0
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(({}) => globalThis)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(() => globalThis)

/* UndefinedNonFinalSignature */

expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ result, args: [a, b, c] }) => typeof result === 'string' && a > 0 && (b === undefined || b === '') && c
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ result, args: [a, ...b] }) => typeof result === 'string' && a > 0 && b.length > 1 && typeof b[0] === 'boolean'
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a > 0 && (b === undefined || b === '')
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a > 0
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(({}) => globalThis)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(() => globalThis)

/* PseudoRestNonFinalSignature */

expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ result, args: [a, ...b] }) =>
    typeof result === 'string' && a === 0 && b.length > 0 && b.every(e => (typeof e === 'boolean' ? e : e === ''))
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a === 0 && (typeof b === 'boolean' ? b : b === '')
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ result, args: [a, b, c] }) =>
    typeof result === 'string' &&
    a === 0 &&
    (typeof b === 'boolean' ? b : b === '') &&
    (typeof c === 'boolean' ? c : typeof c === 'string' ? c === '' : !!c)
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ result, args: [a, b, c, d] }) =>
    typeof result === 'string' &&
    a === 0 &&
    (typeof b === 'boolean' ? b : b === '') &&
    (typeof c === 'boolean' ? c : typeof c === 'string' ? c === '' : !!c) &&
    (typeof d === 'boolean' ? d : typeof d === 'string' ? d === '' : !!c)
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a === 0
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(({}) => globalThis)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(() => globalThis)

/* OneRestInTheMiddleInArraysSignature */

expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ result, args: [a, ...b] }) =>
    typeof result === 'string' &&
    a.length === 0 &&
    b.length > 0 &&
    b.every(e => (typeof e === 'string' ? e === '' : e.length === 0))
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ result, args: [a, b, c] }) =>
    typeof result === 'string' &&
    a.length === 0 &&
    b.length > 0 &&
    c !== undefined &&
    (typeof c === 'string' ? c === '' : c.every(e => e))
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ result, args: [a, b, c, d] }) =>
    typeof result === 'string' &&
    a.length === 0 &&
    (typeof b === 'string' ? b === '' : b.every(e => e)) &&
    c !== undefined &&
    (typeof c === 'string' ? c === '' : c.every(e => e)) &&
    d !== undefined &&
    (typeof d === 'string' ? d === '' : d.every(e => e))
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a.length === 0
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(({}) => globalThis)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(() => globalThis)

/* OptionalBeforeRestSignature */

expectAssignable<Postcondition<OptionalBeforeRestSignature>>(
  ({ result, args: [a, b, ...c] }) =>
    (typeof result === 'string' && a.length > 0 && (b === undefined || !b) && c.length === 0) || c.every(e => e === '')
)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(
  ({ result, args: [a, b, c, d, e] }) =>
    typeof result === 'string' &&
    a.length > 0 &&
    (b === undefined || !b) &&
    typeof c === 'string' &&
    c === '' &&
    typeof d === 'string' &&
    d === '' &&
    typeof e === 'string' &&
    e === ''
)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a.length > 0 && (b === undefined || !b)
)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a.length > 0
)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(() => globalThis)

/* DoubleOptionalBeforeRestSignature */

expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ result, args: [a, b, c, ...d] }) =>
    (typeof result === 'string' &&
      a.length > 0 &&
      (b === undefined || b.length > 0) &&
      (c === undefined || !c) &&
      d.length === 0) ||
    d.every(e => e === '')
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ result, args: [a, b, c, d, e, f] }) =>
    typeof result === 'string' &&
    a.length > 0 &&
    (b === undefined || b.length > 0) &&
    (c === undefined || !c) &&
    typeof d === 'string' &&
    d === '' &&
    typeof e === 'string' &&
    e === '' &&
    typeof f === 'string' &&
    f === ''
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ result, args: [a, b, c] }) =>
    typeof result === 'string' && a.length > 0 && (b === undefined || b.length > 0) && (c === undefined || !c)
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a.length > 0 && (b === undefined || b.length > 0)
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a.length > 0
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(() => globalThis)

/* UndefinedBeforeRestSignature */

expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(
  ({ result, args: [a, b, ...c] }) =>
    (typeof result === 'string' && a.length > 0 && (b === undefined || !b) && c.length === 0) || c.every(e => e === '')
)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(
  ({ result, args: [a, b, c, d, e] }) =>
    typeof result === 'string' &&
    a.length > 0 &&
    (b === undefined || !b) &&
    typeof c === 'string' &&
    c === '' &&
    typeof d === 'string' &&
    d === '' &&
    typeof e === 'string' &&
    e === ''
)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(
  ({ result, args: [a, b] }) => typeof result === 'string' && a.length > 0 && (b === undefined || !b)
)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a.length > 0
)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(() => globalThis)

/* DoubleOptionalAfterRestSignature */

expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(
  ({ result, args: [a, ...b] }) => typeof result === 'string' && a.length > 0 && b.every(e => e === '' || e === 0 || e)
)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(
  ({ result, args: [a, b, ...c] }) =>
    typeof result === 'string' &&
    a.length > 0 &&
    b !== undefined &&
    ((typeof b === 'string' && b === '') || (typeof b === 'number' && b > 0) || (typeof b === 'boolean' && !b)) &&
    c.every(e => e === '' || e === 0 || e)
)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(
  ({ result, args: [a] }) => typeof result === 'string' && a.length > 0
)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(
  ({ result, args }) => typeof result === 'string' && args.length <= 1
)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(({ result }) => typeof result === 'string')
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(() => globalThis)

expectAssignable<Postcondition<ASignature>>(
  ({ result, args: [a, b] }): boolean => isLevel2Type(result) && result.rootProperty > a + (b.level1BProperty ? 1 : 0)
)
expectAssignable<Postcondition<ASignature>>(
  ({ result, args: [a] }): boolean => isLevel2Type(result) && result.rootProperty > a
)
expectAssignable<Postcondition<ASignature>>(({ result, args }) => isLevel2Type(result) && args.length <= 1)
expectAssignable<Postcondition<ASignature>>(
  ({ result, args: [a, b] }: { result: unknown; args: Readonly<[number, RootType]> }): boolean =>
    isLevel2Type(result) && result.rootProperty > a + b.rootProperty
)
expectAssignable<Postcondition<ASignature>>(
  ({ result, args: [a, b] }: { result: unknown; args: Readonly<[number, unknown]> }): boolean =>
    isLevel2Type(result) && isRootType(b) && result.rootProperty > a + b.rootProperty
)
expectNotAssignable<Postcondition<ASignature>>(
  ({ result, args: [a, b] }: { result: unknown; args: Readonly<[number, Level3Class]> }): boolean =>
    isLevel2Type(result) && result.rootProperty > a + b.level3Property.length
)

/* Not a boolean outcome */
expectAssignable<Postcondition<NoArgumentsSignature>>((): unknown => 'mystery')
expectAssignable<Postcondition<NoArgumentsSignature>>((): number => 0)
expectAssignable<Postcondition<NoArgumentsSignature>>((): undefined => undefined)
expectAssignable<Postcondition<NoArgumentsSignature>>((): null => null)
expectAssignable<Postcondition<NoArgumentsSignature>>((): '' => '')
expectAssignable<Postcondition<NoArgumentsSignature>>((): string => 'a string')
expectAssignable<Postcondition<NoArgumentsSignature>>((): void => {})
expectAssignable<Postcondition<NoArgumentsSignature>>((): never => {
  throw new Error()
})

/* Sadly also ok */

expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ result, args: [a] }: any) => typeof result === 'string' && a === 0
)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ result, args: [a] }: { result: any; args: any }) => typeof result === 'string' && a === 0
)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ result, args: [a] }: { result: unknown; args: any }) => typeof result === 'string' && a === 0
)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ result, args: [a] }: { result: unknown; args: Readonly<[number]> }) => typeof result === 'string' && a === 0
)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ result, args: [a] }: { result: unknown; args: Readonly<[any]> }) => typeof result === 'string' && a === 0
)

/* Unrelated or covariant result */

expectAssignable<Postcondition<NoArgumentsSignature>>(({ result }: { result: unknown }) => typeof result === 'string')
function c1({ result }: { result: string }) {
  return result === ''
}
expectNotAssignable<Postcondition<NoArgumentsSignature>>(c1)
function c2({ result }: { result: number }) {
  return result === 0
}
expectNotAssignable<Postcondition<NoArgumentsSignature>>(c2)
function c3({ result }: { result: never }) {
  throw new Error('' + result)
}
expectNotAssignable<Postcondition<NoArgumentsSignature>>(c3)
