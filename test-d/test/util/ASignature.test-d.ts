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
import type { ASignature, ASignatureWithOptionalArgs } from '../../../test2/util/ASignature.ts'
import {
  type Level1AType,
  type Level1BType,
  type Level2Type,
  type RootType,
  Level1AClass,
  Level2Class,
  Level3Class
} from '../../../test2/util/SomeTypes.ts'

const level1AInstance: Level1AType = new Level1AClass(0, 'a string')

/* ASignature
   ---------- */

/* Valid signatures */

// nominal
expectAssignable<ASignature>(
  (a: number, b: Level1BType): Level2Type => new Level2Class(a, b.rootProperty > 0, level1AInstance)
)

// optional arguments
expectAssignable<ASignature>(
  (a: number, b?: Level1BType): Level2Type => new Level2Class(a, !!b && b.rootProperty > 0, level1AInstance)
)
expectAssignable<ASignature>(
  (a?: number, b?: Level1BType): Level2Type => new Level2Class(a ?? 0, !!b && b.rootProperty > 0, level1AInstance)
)
expectAssignable<ASignature>((a?: number): Level2Type => new Level2Class(a ?? 0, !!a && a > 0, level1AInstance))

// less arguments
expectAssignable<ASignature>((a: number): Level2Type => new Level2Class(a, true, level1AInstance))
expectAssignable<ASignature>((): Level2Type => new Level2Class(0, false, level1AInstance))

// contravariant arguments
expectAssignable<ASignature>(
  (a: unknown, b: Level1BType): Level2Type => new Level2Class(a ? 0 : 1, b.rootProperty > 0, level1AInstance)
)
expectAssignable<ASignature>(
  (a: number, b: RootType): Level2Type => new Level2Class(a, b.rootProperty > 0, level1AInstance)
)
expectAssignable<ASignature>((a: number, b: unknown): Level2Type => new Level2Class(a, !!b, level1AInstance))

// covariant result
expectAssignable<ASignature>((a: number, b: Level1BType): Level3Class => new Level3Class(a, true, level1AInstance))
expectAssignable<ASignature>((a: number, b: Level1BType): never => {
  throw new Error()
})

// Sadly also ok
expectAssignable<ASignature>(
  (a: any, b: Level1BType): Level2Type => new Level2Class(a, b.rootProperty > 0, level1AInstance)
)
expectAssignable<ASignature>((a: number, b: any): Level2Type => new Level2Class(a, b.rootProperty > 0, level1AInstance))
expectAssignable<ASignature>(
  (a: number, b: Level1BType): any => new Level2Class(a, b.rootProperty > 0, level1AInstance)
)

/* Invalid signatures */

// too many arguments
expectNotAssignable<ASignature>(
  (a: number, b: Level1BType, c: string): Level2Type => new Level2Class(a, b.rootProperty > 0, level1AInstance)
)

// unrelated or covariant arguments
expectNotAssignable<ASignature>(
  (a: string, b: Level1BType): Level2Type => new Level2Class(0, b.rootProperty > 0, level1AInstance)
)
expectNotAssignable<ASignature>(
  (a: never, b: Level1BType): Level2Type => new Level2Class(0, b.rootProperty > 0, level1AInstance)
)
expectNotAssignable<ASignature>((a: number, b: number): Level2Type => new Level2Class(a, b > 0, level1AInstance))
expectNotAssignable<ASignature>((a: number, b: Level1AClass): Level2Type => new Level2Class(a, a > 0, b))
expectNotAssignable<ASignature>((a: number, b: never): Level2Type => new Level2Class(a, a > 0, level1AInstance))

// unrelated or contravariant result
expectNotAssignable<ASignature>((a: number, b: Level1BType): boolean => a > 0 && b.level1BProperty)
expectNotAssignable<ASignature>((a: number, b: Level1BType): Level1AType => new Level1AClass(a, 'a string'))
expectNotAssignable<ASignature>((a: number, b: Level1BType): unknown => 'unknown')

/* ASignatureWithOptionalArgs
   ---------- */

/* Valid signatures */

// nominal
expectAssignable<ASignatureWithOptionalArgs>(
  (a: number, b: string, c?: Level1BType, d?: number): Level2Type =>
    new Level2Class(a, !!c && c.rootProperty > 0, level1AInstance)
)

// less arguments
expectAssignable<ASignatureWithOptionalArgs>(
  (a: number, b: string, c?: Level1BType): Level2Type => new Level2Class(a, !!c && c.rootProperty > 0, level1AInstance)
)
expectAssignable<ASignatureWithOptionalArgs>(
  (a: number, b: string): Level2Type => new Level2Class(a, !!b && a > 0, level1AInstance)
)
expectAssignable<ASignatureWithOptionalArgs>((a: number): Level2Type => new Level2Class(a, a > 0, level1AInstance))
expectAssignable<ASignatureWithOptionalArgs>((): Level2Type => new Level2Class(0, false, level1AInstance))

/* Invalid signatures */

// required arguments
expectNotAssignable<ASignatureWithOptionalArgs>(
  (a: number, b: string, c: Level1BType, d?: number): Level2Type =>
    new Level2Class(a, !!c && c.rootProperty > 0, level1AInstance)
)
expectNotAssignable<ASignatureWithOptionalArgs>(
  (a: number, b: string, c: Level1BType, d: number): Level2Type =>
    new Level2Class(a, !!c && c.rootProperty > 0, level1AInstance)
)
