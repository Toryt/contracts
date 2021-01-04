/*
 Copyright 2016 - 2020 by Jan Dockx

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

import { expectAssignable, expectError, expectNotAssignable, expectType } from 'tsd'
import { AFunction1, someError, SomeError, SomeObject, SomeSubError } from './subjects'
import { CallableExceptionCondition } from '../types'

function canThrowSomeError (): void {
  throw someError
}

function canThrowUndefined (): void {
  throw undefined
}

function canThrowNull (): void {
  throw null
}

function doesntThrow (): number {
  return 5
}

try {
  canThrowSomeError()
} catch (e) {
  expectType<any>(e)
}

try {
  canThrowUndefined()
} catch (e) {
  expectType<any>(e)
}

try {
  canThrowNull()
} catch (e) {
  expectType<any>(e)
}

try {
  doesntThrow()
} catch (e) {
  expectType<any>(e)
}

try {
  canThrowSomeError()
} catch (e: any) {
  expectType<any>(e)
}

try {
  canThrowSomeError()
} catch (e: unknown) {
  expectType<unknown>(e)
}

/* cannot
try {
  canThrowSomeError()
} catch (e: SomeError) {
  …
}
*/

expectAssignable<CallableExceptionCondition<AFunction1, unknown>> (
    function (this: SomeObject, a: string, b: number): boolean {
    return typeof a === 'string' && typeof b === 'number'
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, unknown>> (
  function (this: SomeObject, a: string, b: number, exc: unknown): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

// exc can be anything, but function only deals with SomeError
expectNotAssignable<CallableExceptionCondition<AFunction1, unknown>> (
  function (this: SomeObject, a: string, b: number, exc: SomeError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectNotAssignable<CallableExceptionCondition<AFunction1, unknown>> (
  function (this: SomeObject, a: string, b: number, exc: undefined): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, unknown>> (
  function (this: SomeObject, a: string, b: number, exc: any): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

// exc can be undefined, but function only deals with SomeError
expectNotAssignable<CallableExceptionCondition<AFunction1, undefined>> (
  function (this: SomeObject, a: string, b: number, exc: SomeError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, undefined>> (
  function (this: SomeObject, a: string, b: number, exc?: SomeError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, undefined>> (
  function (this: SomeObject, a: string, b: number, exc: undefined): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, undefined>> (
  function (this: SomeObject, a: string, b: number, exc: unknown): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, undefined>> (
  function (this: SomeObject, a: string, b: number, exc: any): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, never>> (
  function (this: SomeObject, a: string, b: number, exc: never): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, never>> (
  function (this: SomeObject, a: string, b: number, exc: SomeError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, never>> (
  function (this: SomeObject, a: string, b: number, exc: undefined): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, never>> (
  function (this: SomeObject, a: string, b: number, exc: unknown): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, never>> (
  function (this: SomeObject, a: string, b: number, exc: any): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, SomeError>> (
  function (this: SomeObject, a: string, b: number, exc: SomeError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

// Error and SomeError are not related
expectNotAssignable<CallableExceptionCondition<AFunction1, Error>> (
  function (this: SomeObject, a: string, b: number, exc: SomeError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

// Error and SomeError are not related
expectNotAssignable<CallableExceptionCondition<AFunction1, SomeError>> (
  function (this: SomeObject, a: string, b: number, exc: Error): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

// cannot only accept subtypes of Exceptions
expectNotAssignable<CallableExceptionCondition<AFunction1, SomeError>> (
  function (this: SomeObject, a: string, b: number, exc: SomeSubError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

// accept super types of Exceptions
expectAssignable<CallableExceptionCondition<AFunction1, SomeSubError>> (
  function (this: SomeObject, a: string, b: number, exc: SomeError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, SomeError>> (
  function (this: SomeObject, a: string, b: number, exc: unknown): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, SomeError>> (
  function (this: SomeObject, a: string, b: number, exc: any): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectNotAssignable<CallableExceptionCondition<AFunction1, SomeError>> (
  function (this: SomeObject, a: string, b: number, exc: undefined): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

const unknown1: unknown = someError
let notUnknown: SomeError
// noinspection AssignmentResultUsedJS
expectError(notUnknown = unknown1)
expectType<unknown>(unknown1)

// any is assignable in 2 directions
const any1: any = someError
expectType<any>(any1)
const notAny: SomeSubError = any1
expectType<SomeSubError>(notAny)

expectAssignable<CallableExceptionCondition<AFunction1, any>> (
  function (this: SomeObject, a: string, b: number): boolean {
    return typeof a === 'string' && typeof b === 'number'
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, any>> (
  function (this: SomeObject, a: string, b: number, exc: any): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, any>> (
  function (this: SomeObject, a: string, b: number, exc: unknown): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, any>> (
  function (this: SomeObject, a: string, b: number, exc: SomeError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectAssignable<CallableExceptionCondition<AFunction1, any>> (
  function (this: SomeObject, a: string, b: number, exc?: SomeError): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)
expectAssignable<CallableExceptionCondition<AFunction1, any>> (
  function (this: SomeObject, a: string, b: number, exc: undefined): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)

expectNotAssignable<CallableExceptionCondition<AFunction1, any>> (
  function (this: SomeObject, a: string, b: number, exc: never): boolean {
    return typeof a === 'string' && typeof b === 'number' && !!exc
  }
)
