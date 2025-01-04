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
  FinalOptionalArgumentSignature,
  FinalRestArgumentAfterArraySignature,
  FinalRestArgumentSignature,
  MultipleFinalOptionalArgumentsSignature,
  NoArgumentsSignature,
  OneArgumentSignature,
  SingleOptionalArgumentSignature,
  TwoArgumentsSignature
} from '../../test2/util/SomeSignatures.ts'

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

// expectAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1BType], result: Level2Type): boolean => result.rootProperty > args[0]
// )
//
// expectAssignable<Postcondition<(a: number) => string | undefined>>(
//   (args: [number], result: string | undefined): boolean => args[0] > 0 && result !== undefined
// )
// expectAssignable<Postcondition<(a: number | undefined) => string | undefined>>(
//   (args: [number | undefined], result: string | undefined): boolean => !!args[0] && args[0] > 0 && result !== undefined
// )
// expectAssignable<Postcondition<(a?: number) => string | undefined>>(
//   (args: [number?], result: string | undefined): boolean => !!args[0] && args[0] > 0 && result !== undefined
// )
// expectAssignable<Postcondition<(a?: number) => string | undefined>>(
//   (args: [number] | [], result: string | undefined): boolean => !!args[0] && args[0] > 0 && result !== undefined
// )
// expectAssignable<Postcondition<(a?: number, b?: string) => string>>(
//   (args: [number?, string?], result: string): boolean => !!args[0] && args[0] > 0 && result !== undefined
// )
// expectAssignable<Postcondition<(a?: number, b?: string) => string>>(
//   (args: [number, string] | [number] | [], result: string): boolean => !!args[0] && args[0] > 0 && result !== undefined
// )
// expectAssignable<Postcondition<(a: number, b?: string) => string>>(
//   (args: [number, string?], result: string): boolean => args[0] > 0 && result !== undefined
// )
//
// expectAssignable<Postcondition<(a: number, b: string) => string>>(
//   (args: [number], result: string): boolean => !!args[0] && args[0] > 0 && result !== undefined
// )
// expectAssignable<Postcondition<(a: number, b: string) => string>>(
//   (args: [], result: string): boolean => result !== undefined
// )
//
// expectAssignable<Postcondition<(a: number, b?: string) => string>>(
//   (args: [number], result: string): boolean => !!args[0] && args[0] > 0 && result !== undefined
// )
// expectAssignable<Postcondition<(a: number, b?: string) => string>>(
//   (args: [], result: string): boolean => result !== undefined
// )
//
// expectAssignable<Postcondition<(a: number, b?: string) => string>>(
//   (args: [number?, string?], result: string): boolean => !!args[0] && args[0] > 0 && result !== undefined
// )
//
// expectAssignable<Postcondition<ASignatureWithOptionalArgs>>(
//   (args: [number, Level1BType?, number?], result: Level2Type): boolean => result.rootProperty > args[0]
// )
//
// // less arguments
// expectAssignable<Postcondition<ASignature>>((args: [number], result: Level2Type): boolean => result.rootProperty > 0)
// expectAssignable<Postcondition<ASignature>>((args: [], result: Level2Type): boolean => result.rootProperty > 0)
//
// // contravariant arguments
// expectAssignable<Postcondition<ASignature>>(
//   (args: [unknown, Level1BType], result: Level2Type): boolean => !!args[0] && result.rootProperty > 0
// )
// expectAssignable<Postcondition<ASignature>>(
//   (args: [number, RootType], result: Level2Type): boolean => result.rootProperty > args[0]
// )
// expectAssignable<Postcondition<ASignature>>(
//   (args: [number, unknown], result: Level2Type): boolean => result.rootProperty > args[0]
// )
//
// // contravariant result
// expectAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1BType], result: Level1AType): boolean => result.rootProperty > args[0]
// )
// expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: unknown): boolean => args[0] > 0)
//
// // not a boolean outcome
// expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): unknown => 'mystery')
// expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): number => 0)
// expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): undefined => undefined)
// expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): null => null)
// expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): '' => '')
// expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): string => 'a string')
// expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): void => {})
// expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): never => {
//   throw new Error()
// })
//
// // Sadly also ok
// expectAssignable<Postcondition<ASignature>>(
//   (args: [any, Level1BType], result: Level2Type): boolean => result.rootProperty > args[0]
// )
// expectAssignable<Postcondition<ASignature>>(
//   (args: [number, any], result: Level2Type): boolean => result.rootProperty > args[0]
// )
// expectAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1BType], result: any): boolean => result.rootProperty > args[0]
// )
// expectAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1BType], result: Level2Type): any => result.rootProperty > args[0]
// )
//
// /* Invalid postconditions */
//
// // too many arguments
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1BType, string], result: Level2Type): boolean => result.rootProperty > args[0]
// )
//
// // unrelated or covariant arguments
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [string, Level1BType], result: Level2Type): boolean => result.rootProperty > 0
// )
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [never, Level1BType], result: Level2Type): boolean => result.rootProperty > args[0]
// )
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [number, number], result: Level2Type): boolean => result.rootProperty > args[0]
// )
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1AClass], result: Level2Type): boolean => result.rootProperty > args[0]
// )
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1AClass], result: Level2Type): boolean => result.rootProperty > args[0]
// )
//
// // unrelated or covariant result
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1AType], result: undefined): boolean => result === 'worf'
// )
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1AType], result: null): boolean => result === 'worf'
// )
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1AType], result: string): boolean => result === 'worf'
// )
// expectNotAssignable<Postcondition<ASignature>>(
//   (args: [number, Level1BType], result: Level3Class): boolean => result.rootProperty > args[0]
// )
// expectNotAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: never): boolean => {
//   throw new Error()
// })
