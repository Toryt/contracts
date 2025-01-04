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
  ({ value: result, args }) => typeof result === 'string' && args.length === 0
)
expectAssignable<Postcondition<NoArgumentsSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length === 0
)
expectAssignable<Postcondition<NoArgumentsSignature>>(({ args }) => args.length === 0)
expectAssignable<Postcondition<NoArgumentsSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<NoArgumentsSignature>>(({}) => globalThis)
expectAssignable<Postcondition<NoArgumentsSignature>>(() => globalThis)
expectNotAssignable<Postcondition<NoArgumentsSignature>>(
  ({ value, args, somethingElse }: PostconditionKwargs<NoArgumentsSignature> & { readonly somethingElse: unknown }) =>
    typeof value === 'string' && args.length === 0 && !!somethingElse
)
expectNotAssignable<Postcondition<NoArgumentsSignature>>(
  ({ value, args: [a] }: { value: unknown; args: [unknown] }) => typeof value === 'string' && !!a
)

/* OneArgumentSignature */

expectAssignable<Postcondition<OneArgumentSignature>>(({ value, args: [a] }) => typeof value === 'string' && a === 0)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<OneArgumentSignature>>(({ args: [a] }) => a === 0)
expectAssignable<Postcondition<OneArgumentSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<OneArgumentSignature>>(({}) => globalThis)
expectAssignable<Postcondition<OneArgumentSignature>>(() => globalThis)
expectNotAssignable<Postcondition<OneArgumentSignature>>(
  ({ args: [a, b] }: { args: [number, unknown] }) => a === 0 && !!b
)
expectNotAssignable<Postcondition<OneArgumentSignature>>(
  ({ value, args: [a] }: { value: unknown; args: [unknown] }) => typeof value === 'string' && !!a
)

/* TwoArgumentsSignature */

expectAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ value, args: [a, b] }) => typeof value === 'string' && a.length === 0 && b !== ''
)
expectAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a.length === 0
)
expectAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<TwoArgumentsSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<TwoArgumentsSignature>>(({}) => globalThis)
expectAssignable<Postcondition<TwoArgumentsSignature>>(() => globalThis)
expectNotAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ args: [a, b] }: { args: [number, unknown] }) => a === 0 && !!b
)
expectNotAssignable<Postcondition<TwoArgumentsSignature>>(
  ({ value, args: [a] }: { value: unknown; args: [unknown] }) => typeof value === 'string' && !!a
)

/* FinalOptionalArgumentSignature */

expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ value, args: [a, b, c] }) => typeof value === 'string' && a.length === 0 && b !== '' && c === undefined
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ value, args: [a, b, c] }: { value: unknown; args: readonly [number[], string, (boolean | undefined)?] }) =>
    typeof value === 'string' && a.length === 0 && b !== '' && c === undefined
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ value, args: [a, b] }) => typeof value === 'string' && a.length === 0 && b !== ''
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a.length === 0
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(({}) => globalThis)
expectAssignable<Postcondition<FinalOptionalArgumentSignature>>(() => globalThis)
expectNotAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ args: [a, b] }: { args: [number, unknown] }) => a === 0 && !!b
)
expectNotAssignable<Postcondition<FinalOptionalArgumentSignature>>(
  ({ value, args: [a] }: { value: unknown; args: [unknown] }) => typeof value === 'string' && !!a
)

/* SingleOptionalArgumentSignature */

expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(({ value, args: [a] }) =>
  typeof value === 'string' && a === undefined ? 'undefined' : a
)
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(
  ({ value, args: [a] }: { value: unknown; args: readonly [(boolean | undefined)?] }) =>
    typeof value === 'string' && a === undefined ? 'undefined' : a
)
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(({}) => globalThis)
expectAssignable<Postcondition<SingleOptionalArgumentSignature>>(() => globalThis)
expectNotAssignable<Postcondition<SingleOptionalArgumentSignature>>(({ args: [a] }: { args: [boolean] }) => a)
expectNotAssignable<Postcondition<SingleOptionalArgumentSignature>>(
  ({ args: [a, b] }: { args: [boolean?, unknown?] }) => a !== undefined && !!b
)
expectNotAssignable<Postcondition<SingleOptionalArgumentSignature>>(
  ({ value, args: [a] }: { value: unknown; args: [unknown] }) => typeof value === 'string' && !!a
)

/* MultipleFinalOptionalArgumentsSignature */

expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ value, args: [a, b, c, d, e] }) =>
    typeof value === 'string' &&
    a === 0 &&
    b.length > 0 &&
    c === undefined &&
    (d === undefined || d < 0) &&
    (e === undefined || e !== '')
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ value, args: [a, b, c, d] }) =>
    typeof value === 'string' && a === 0 && b.length > 0 && c === undefined && (d === undefined || d < 0)
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ value, args: [a, b, c] }) => typeof value === 'string' && a === 0 && b.length > 0 && c === undefined
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ value, args: [a, b] }) => typeof value === 'string' && a === 0 && b.length > 0
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a === 0
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(({}) => globalThis)
expectAssignable<Postcondition<MultipleFinalOptionalArgumentsSignature>>(() => globalThis)

/* FinalRestArgumentSignature */

expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ value, args: [a, b, ...c] }) => typeof value === 'string' && a === 0 && b !== '' && c.every(e => e)
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ value, args: [a, b, c] }) => typeof value === 'string' && a === 0 && b !== '' && c !== undefined && c
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ value, args: [a, b, c, d, e] }) =>
    typeof value === 'string' &&
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
  ({ value, args: [a, b] }) => typeof value === 'string' && a === 0 && b !== ''
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a === 0
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<FinalRestArgumentSignature>>(({}) => globalThis)
expectAssignable<Postcondition<FinalRestArgumentSignature>>(() => globalThis)

/* FinalRestArgumentAfterArraySignature */

expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ value, args: [a, b, ...c] }) => typeof value === 'string' && a === 0 && b.length > 0 && c.every(e => e)
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ value, args: [a, b, c] }) => typeof value === 'string' && a === 0 && b.length > 0 && c !== undefined && c
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ value, args: [a, b, c, d, e] }) =>
    typeof value === 'string' &&
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
  ({ value, args: [a, b] }) => typeof value === 'string' && a === 0 && b.length > 0
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a === 0
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(({}) => globalThis)
expectAssignable<Postcondition<FinalRestArgumentAfterArraySignature>>(() => globalThis)

/* SingleRestSignature */

expectAssignable<Postcondition<SingleRestSignature>>(
  ({ value, args: [...a] }) => typeof value === 'string' && a.some(e => value === e)
)
expectAssignable<Postcondition<SingleRestSignature>>(({ value, args: [a] }) => typeof value === 'string' && value === a)
expectAssignable<Postcondition<SingleRestSignature>>(
  ({ value, args: [a, b, c] }) => typeof value === 'string' && (value === a || value === b || value === c)
)
expectAssignable<Postcondition<SingleRestSignature>>(
  ({ value, args }) => typeof value === 'string' && args.some(e => value === e)
)
expectAssignable<Postcondition<SingleRestSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<SingleRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<SingleRestSignature>>(() => globalThis)

/* PseudoOptionalNonFinalSignature */

expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ value, args: [a, b, c] }) => typeof value === 'string' && a > 0 && (b === undefined || b === '') && c
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ value, args: [a, ...b] }) => typeof value === 'string' && a > 0 && b.length > 1 && typeof b[0] === 'boolean'
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ value, args: [a, b] }) => typeof value === 'string' && a > 0 && (b === undefined || b === '')
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a > 0
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(({}) => globalThis)
expectAssignable<Postcondition<PseudoOptionalNonFinalSignature>>(() => globalThis)

/* UndefinedNonFinalSignature */

expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ value, args: [a, b, c] }) => typeof value === 'string' && a > 0 && (b === undefined || b === '') && c
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ value, args: [a, ...b] }) => typeof value === 'string' && a > 0 && b.length > 1 && typeof b[0] === 'boolean'
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ value, args: [a, b] }) => typeof value === 'string' && a > 0 && (b === undefined || b === '')
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a > 0
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(({}) => globalThis)
expectAssignable<Postcondition<UndefinedNonFinalSignature>>(() => globalThis)

/* PseudoRestNonFinalSignature */

expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ value, args: [a, ...b] }) =>
    typeof value === 'string' && a === 0 && b.length > 0 && b.every(e => (typeof e === 'boolean' ? e : e === ''))
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ value, args: [a, b] }) => typeof value === 'string' && a === 0 && (typeof b === 'boolean' ? b : b === '')
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ value, args: [a, b, c] }) =>
    typeof value === 'string' &&
    a === 0 &&
    (typeof b === 'boolean' ? b : b === '') &&
    (typeof c === 'boolean' ? c : typeof c === 'string' ? c === '' : !!c)
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ value, args: [a, b, c, d] }) =>
    typeof value === 'string' &&
    a === 0 &&
    (typeof b === 'boolean' ? b : b === '') &&
    (typeof c === 'boolean' ? c : typeof c === 'string' ? c === '' : !!c) &&
    (typeof d === 'boolean' ? d : typeof d === 'string' ? d === '' : !!c)
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a === 0
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(({}) => globalThis)
expectAssignable<Postcondition<PseudoRestNonFinalSignature>>(() => globalThis)

/* OneRestInTheMiddleInArraysSignature */

expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ value, args: [a, ...b] }) =>
    typeof value === 'string' &&
    a.length === 0 &&
    b.length > 0 &&
    b.every(e => (typeof e === 'string' ? e === '' : e.length === 0))
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ value, args: [a, b, c] }) =>
    typeof value === 'string' &&
    a.length === 0 &&
    b.length > 0 &&
    c !== undefined &&
    (typeof c === 'string' ? c === '' : c.every(e => e))
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ value, args: [a, b, c, d] }) =>
    typeof value === 'string' &&
    a.length === 0 &&
    (typeof b === 'string' ? b === '' : b.every(e => e)) &&
    c !== undefined &&
    (typeof c === 'string' ? c === '' : c.every(e => e)) &&
    d !== undefined &&
    (typeof d === 'string' ? d === '' : d.every(e => e))
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a.length === 0
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(({}) => globalThis)
expectAssignable<Postcondition<OneRestInTheMiddleInArraysSignature>>(() => globalThis)

/* OptionalBeforeRestSignature */

expectAssignable<Postcondition<OptionalBeforeRestSignature>>(
  ({ value, args: [a, b, ...c] }) =>
    (typeof value === 'string' && a.length > 0 && (b === undefined || !b) && c.length === 0) || c.every(e => e === '')
)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(
  ({ value, args: [a, b, c, d, e] }) =>
    typeof value === 'string' &&
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
  ({ value, args: [a, b] }) => typeof value === 'string' && a.length > 0 && (b === undefined || !b)
)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a.length > 0
)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<OptionalBeforeRestSignature>>(() => globalThis)

/* DoubleOptionalBeforeRestSignature */

expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ value, args: [a, b, c, ...d] }) =>
    (typeof value === 'string' &&
      a.length > 0 &&
      (b === undefined || b.length > 0) &&
      (c === undefined || !c) &&
      d.length === 0) ||
    d.every(e => e === '')
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ value, args: [a, b, c, d, e, f] }) =>
    typeof value === 'string' &&
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
  ({ value, args: [a, b, c] }) =>
    typeof value === 'string' && a.length > 0 && (b === undefined || b.length > 0) && (c === undefined || !c)
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ value, args: [a, b] }) => typeof value === 'string' && a.length > 0 && (b === undefined || b.length > 0)
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a.length > 0
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<DoubleOptionalBeforeRestSignature>>(() => globalThis)

/* UndefinedBeforeRestSignature */

expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(
  ({ value, args: [a, b, ...c] }) =>
    (typeof value === 'string' && a.length > 0 && (b === undefined || !b) && c.length === 0) || c.every(e => e === '')
)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(
  ({ value, args: [a, b, c, d, e] }) =>
    typeof value === 'string' &&
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
  ({ value, args: [a, b] }) => typeof value === 'string' && a.length > 0 && (b === undefined || !b)
)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a.length > 0
)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<UndefinedBeforeRestSignature>>(() => globalThis)

/* DoubleOptionalAfterRestSignature */

expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(
  ({ value, args: [a, ...b] }) => typeof value === 'string' && a.length > 0 && b.every(e => e === '' || e === 0 || e)
)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(
  ({ value, args: [a, b, ...c] }) =>
    typeof value === 'string' &&
    a.length > 0 &&
    b !== undefined &&
    ((typeof b === 'string' && b === '') || (typeof b === 'number' && b > 0) || (typeof b === 'boolean' && !b)) &&
    c.every(e => e === '' || e === 0 || e)
)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(
  ({ value, args: [a] }) => typeof value === 'string' && a.length > 0
)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(
  ({ value, args }) => typeof value === 'string' && args.length <= 1
)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(({ value }) => typeof value === 'string')
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(({}) => globalThis)
expectAssignable<Postcondition<DoubleOptionalAfterRestSignature>>(() => globalThis)

expectAssignable<Postcondition<ASignature>>(
  ({ value, args: [a, b] }): boolean => isLevel2Type(value) && value.rootProperty > a + (b.level1BProperty ? 1 : 0)
)
expectAssignable<Postcondition<ASignature>>(
  ({ value, args: [a] }): boolean => isLevel2Type(value) && value.rootProperty > a
)
expectAssignable<Postcondition<ASignature>>(({ value, args }) => isLevel2Type(value) && args.length <= 1)
expectAssignable<Postcondition<ASignature>>(
  ({ value, args: [a, b] }: { value: unknown; args: Readonly<[number, RootType]> }): boolean =>
    isLevel2Type(value) && value.rootProperty > a + b.rootProperty
)
expectAssignable<Postcondition<ASignature>>(
  ({ value, args: [a, b] }: { value: unknown; args: Readonly<[number, unknown]> }): boolean =>
    isLevel2Type(value) && isRootType(b) && value.rootProperty > a + b.rootProperty
)
expectNotAssignable<Postcondition<ASignature>>(
  ({ value, args: [a, b] }: { value: unknown; args: Readonly<[number, Level3Class]> }): boolean =>
    isLevel2Type(value) && value.rootProperty > a + b.level3Property.length
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
  ({ value, args: [a] }: any) => typeof value === 'string' && a === 0
)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ value, args: [a] }: { value: any; args: any }) => typeof value === 'string' && a === 0
)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ value, args: [a] }: { value: unknown; args: any }) => typeof value === 'string' && a === 0
)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ value, args: [a] }: { value: unknown; args: Readonly<[number]> }) => typeof value === 'string' && a === 0
)
expectAssignable<Postcondition<OneArgumentSignature>>(
  ({ value, args: [a] }: { value: unknown; args: Readonly<[any]> }) => typeof value === 'string' && a === 0
)

/* Unrelated or covariant result */

expectAssignable<Postcondition<NoArgumentsSignature>>(({ value }: { value: unknown }) => typeof value === 'string')
function c1({ value }: { value: string }) {
  return value === ''
}
expectNotAssignable<Postcondition<NoArgumentsSignature>>(c1)
function c2({ value }: { value: number }) {
  return value === 0
}
expectNotAssignable<Postcondition<NoArgumentsSignature>>(c2)
function c3({ value }: { value: never }) {
  throw new Error('' + value)
}
expectNotAssignable<Postcondition<NoArgumentsSignature>>(c3)
