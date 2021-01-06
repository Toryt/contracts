/*
 Copyright 2020 - 2021 by Jan Dockx

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

import { expectAssignable, expectError, expectNotAssignable, expectNotType, expectType } from 'tsd'
import {
  frozenOwnProperty,
  functionArguments,
  primitive,
  stack,
  stackLocation
} from '../../lib/_private/is'
import { StackLocation } from '../../lib/Location'

const aStackLocation = '    at REPLServer.emit (events.js:327:22)\n'
const aNumber = 3543
const aString = ' a string'
let something1 = {}
let something2 = {
  aProperty: 'a property value',
  anotherProperty: true
}
let something3 = {
  aProperty: 'a property value',
  anotherProperty: true
}
const aStack = `    at REPL1:1:1
    at Script.runInThisContext (vm.js:132:18)
    at REPLServer.defaultEval (repl.js:484:29)
    at bound (domain.js:430:14)
    at REPLServer.runBound [as eval] (domain.js:443:12)
    at REPLServer.onLine (repl.js:817:10)
    at REPLServer.emit (events.js:327:22)
    at REPLServer.EventEmitter.emit (domain.js:486:12)
    at REPLServer.Interface._onLine (readline.js:337:10)
    at REPLServer.Interface._line (readline.js:666:8)`


expectAssignable<StackLocation>(aStackLocation)
expectNotType<StackLocation>(aStackLocation) // it's a string
expectNotType<StackLocation>(null)
expectNotType<StackLocation>(undefined)
// noinspection MagicNumberJS
expectNotType<StackLocation>(42)
expectNotType<StackLocation>(true)
expectNotType<StackLocation>(false)
expectNotType<StackLocation>([])
expectNotType<StackLocation>({})

const typedStackLocation: StackLocation = aStackLocation
expectType<StackLocation>(typedStackLocation)

// sadly …
expectAssignable<StackLocation>(  '')

if (functionArguments(something1)) {
  expectAssignable<typeof something1>((function(a: string, b: number) { return arguments })(aString, aNumber))
  expectNotAssignable<typeof something1>(something2)
  expectNotAssignable<typeof something1>(aString)
  expectNotAssignable<typeof something1>(aNumber)
  expectNotAssignable<typeof something1>([aString, aNumber])
  expectType<IArguments>(something1)
  expectType<any>(something1[aNumber])
  expectType<number>(something1.length)
  expectType<Function>(something1.callee)
}

if (primitive(something1)) {
  expectAssignable<typeof something1>(aNumber)
  expectAssignable<typeof something1>(aString)
  expectAssignable<typeof something1>(true)
  expectType<number | string | boolean>(something1)
  expectNotAssignable<object>(something1)
}

if (stackLocation(something1)) {
  expectAssignable<typeof something1>(aString)
  expectType<StackLocation>(something1)
  expectNotAssignable<typeof something1>(aNumber)
  expectNotAssignable<typeof something1>(true)
  expectNotAssignable<object>(something1)
}

if (stack(something1)) {
  expectAssignable<typeof something1>(aStack)
  expectType<string>(something1)
  expectNotAssignable<typeof something1>(aNumber)
  expectNotAssignable<typeof something1>(true)
  expectNotAssignable<object>(something1)
}

expectType<boolean>(frozenOwnProperty(something2, 'does not exist'))
expectType<string>(something2.aProperty)
something2.aProperty = 'another value'
expectType<string>(something2.aProperty)
expectType<boolean>(something2.anotherProperty)
something2.anotherProperty = false
expectType<false>(something2.anotherProperty)
expectAssignable<boolean>(something2.anotherProperty)
if (frozenOwnProperty(something2, 'aProperty')) {
  expectType<string>(something2.aProperty)
  expectError(something2.aProperty = 'cannot assign to readonly')
  expectType<false>(something2.anotherProperty)
  expectAssignable<boolean>(something2.anotherProperty)
  something2.anotherProperty = true
  expectType<true>(something2.anotherProperty)
  expectAssignable<boolean>(something2.anotherProperty)
  expectType<{ aProperty: string; anotherProperty: boolean; } & { readonly aProperty: string; }>(something2)
}

if (frozenOwnProperty(something2, 'yetAnotherProperty')) {
  expectType<unknown>(something2.yetAnotherProperty)
  expectError(something2.yetAnotherProperty = 'cannot assign to readonly')
  expectType<string>(something2.aProperty)
  /* TODO "Cannot assign to aProperty because it is a read-only property." This is _wrong_! It is not in the if above.
          This should be allowed here
  something2.aProperty = 'another value'
  */
  expectType<boolean>(something2.anotherProperty)
  something2.anotherProperty = false
  expectType<false>(something2.anotherProperty)
  expectAssignable<boolean>(something2.anotherProperty)
}

expectType<{aProperty: string, anotherProperty: boolean}>(something3)
if (!frozenOwnProperty(something3, 'anotherProperty')) {
  /* TODO The "not frozen own property" makes us loose all type information, and that is not the intention. We should
          keep at least what we already know …
  expectType<{aProperty: string, anotherProperty: boolean}>(something3)
  */
  expectType<never>(something3)
  /* TODO … and because it now is `never`, nothing works anymore
  expectType<boolean>(something3.anotherProperty)
  something2.anotherProperty = false
  expectType<false>(something3.anotherProperty)
  */
}
