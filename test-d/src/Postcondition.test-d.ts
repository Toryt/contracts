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

import { expectAssignable, expectNotAssignable } from 'tsd'
import type { Postcondition } from '../../src/Postcondition.ts'
import type { ASignature } from '../../test2/util/ASignature.ts'
import {
  Level1AClass,
  type Level1AType,
  type Level1BType,
  type Level2Type,
  Level3Class,
  type RootType
} from '../../test2/util/SomeTypes.ts'

/* Valid postconditions */

// nominal
expectAssignable<Postcondition<ASignature>>(
  (args: [number, Level1BType], result: Level2Type): boolean => result.rootProperty > args[0]
)

// less arguments
expectAssignable<Postcondition<ASignature>>((args: [number], result: Level2Type): boolean => result.rootProperty > 0)
expectAssignable<Postcondition<ASignature>>((args: [], result: Level2Type): boolean => result.rootProperty > 0)

// contravariant arguments
expectAssignable<Postcondition<ASignature>>(
  (args: [unknown, Level1BType], result: Level2Type): boolean => !!args[0] && result.rootProperty > 0
)
expectAssignable<Postcondition<ASignature>>(
  (args: [number, RootType], result: Level2Type): boolean => result.rootProperty > args[0]
)
expectAssignable<Postcondition<ASignature>>(
  (args: [number, unknown], result: Level2Type): boolean => result.rootProperty > args[0]
)

// contravariant result
expectAssignable<Postcondition<ASignature>>(
  (args: [number, Level1BType], result: Level1AType): boolean => result.rootProperty > args[0]
)
expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: unknown): boolean => args[0] > 0)

// not a boolean outcome
expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): unknown => 'mystery')
expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): number => 0)
expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): undefined => undefined)
expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): null => null)
expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): '' => '')
expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): string => 'a string')
expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): void => {})
expectAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: Level2Type): never => {
  throw new Error()
})

// Sadly also ok
expectAssignable<Postcondition<ASignature>>(
  (args: [any, Level1BType], result: Level2Type): boolean => result.rootProperty > args[0]
)
expectAssignable<Postcondition<ASignature>>(
  (args: [number, any], result: Level2Type): boolean => result.rootProperty > args[0]
)
expectAssignable<Postcondition<ASignature>>(
  (args: [number, Level1BType], result: any): boolean => result.rootProperty > args[0]
)
expectAssignable<Postcondition<ASignature>>(
  (args: [number, Level1BType], result: Level2Type): any => result.rootProperty > args[0]
)

/* Invalid postconditions */

// too many arguments
expectNotAssignable<Postcondition<ASignature>>(
  (args: [number, Level1BType, string], result: Level2Type): boolean => result.rootProperty > args[0]
)

// unrelated or covariant arguments
expectNotAssignable<Postcondition<ASignature>>(
  (args: [string, Level1BType], result: Level2Type): boolean => result.rootProperty > 0
)
expectNotAssignable<Postcondition<ASignature>>(
  (args: [never, Level1BType], result: Level2Type): boolean => result.rootProperty > args[0]
)
expectNotAssignable<Postcondition<ASignature>>(
  (args: [number, number], result: Level2Type): boolean => result.rootProperty > args[0]
)
expectNotAssignable<Postcondition<ASignature>>(
  (args: [number, Level1AClass], result: Level2Type): boolean => result.rootProperty > args[0]
)
expectNotAssignable<Postcondition<ASignature>>(
  (args: [number, Level1AClass], result: Level2Type): boolean => result.rootProperty > args[0]
)

// unrelated or covariant result
expectNotAssignable<Postcondition<ASignature>>(
  (args: [number, Level1AType], result: undefined): boolean => result === 'worf'
)
expectNotAssignable<Postcondition<ASignature>>(
  (args: [number, Level1AType], result: null): boolean => result === 'worf'
)
expectNotAssignable<Postcondition<ASignature>>(
  (args: [number, Level1AType], result: string): boolean => result === 'worf'
)
expectNotAssignable<Postcondition<ASignature>>(
  (args: [number, Level1BType], result: Level3Class): boolean => result.rootProperty > args[0]
)
expectNotAssignable<Postcondition<ASignature>>((args: [number, Level1BType], result: never): boolean => {
  throw new Error()
})
