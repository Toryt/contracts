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

import { expectAssignable, expectError, expectNotAssignable, expectType } from 'tsd'
import {
  frozenOwnProperty,
  functionArguments,
  primitive,
  stack,
  stackLocation
} from '../../lib/_private/is'
import { StackLocation } from '../../lib/Location'

const aNumber = 3543
const aString = ' a string'
const argumentsObject = (function(a: string, b: number) { return arguments })(aString, aNumber)
let something1 = {
  someProperty: true
}
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

// prepare
expectType<IArguments>(argumentsObject)
expectNotAssignable<IArguments>(something1)
expectNotAssignable<typeof something1>(argumentsObject)

// noinspection MagicNumberJS
expectType<3543>(aNumber)
expectAssignable<number>(aNumber)
expectNotAssignable<number>(something1)
expectNotAssignable<typeof something1>(aNumber)

expectType<' a string'>(aString)
expectAssignable<string>(aString)
expectNotAssignable<string>(something1)
expectNotAssignable<typeof something1>(aString)

expectType<true>(true)
expectAssignable<boolean>(true)
expectNotAssignable<boolean>(something1)
expectNotAssignable<typeof something1>(true)

expectType<typeof something2>(something2)
expectNotAssignable<typeof something2>(something1)
expectNotAssignable<typeof something1>(something2)

// test is.functionArguments
expectType<boolean>(functionArguments(something1))
if (functionArguments(something1)) {
  expectAssignable<IArguments>(something1)
  expectType<any>(something1[aNumber])
  expectType<number>(something1.length)
  expectType<Function>(something1.callee)

  expectType<{ someProperty: boolean; } & IArguments>(something1)
  expectAssignable<object>(something1) // because the type of something1 is preserved too

  expectNotAssignable<typeof something1>(aNumber)
  expectNotAssignable<typeof something1>(aString)
  expectNotAssignable<typeof something1>(true)
  expectNotAssignable<typeof something1>(argumentsObject) // because the type of something1 is preserved too
  expectNotAssignable<typeof something1>(something2)
  expectNotAssignable<typeof something1>([aString, aNumber])
} else {
  expectType<{ someProperty: boolean; }>(something1)
  expectNotAssignable<IArguments>(something1)
}
expectType<{ someProperty: boolean; }>(something1)
expectNotAssignable<IArguments>(something1)

// test is.primitive
expectNotAssignable<IArguments>(something1)
expectNotAssignable<typeof something1>(argumentsObject)
expectType<boolean>(primitive(something1))
if (primitive(something1)) {
  expectAssignable<number | string | boolean>(something1)

  expectType<{ someProperty: boolean; } & (number | string | boolean)>(something1)
  expectAssignable<object>(something1) // because the type of something1 is preserved too

  expectNotAssignable<typeof something1>(aNumber) // because the type of something1 is preserved too
  expectNotAssignable<typeof something1>(aString) // because the type of something1 is preserved too
  expectNotAssignable<typeof something1>(true) // because the type of something1 is preserved too
  expectNotAssignable<typeof something1>(argumentsObject)
  expectNotAssignable<typeof something1>(something2)
  expectNotAssignable<typeof something1>([aString, aNumber])
} else {
  expectType<{ someProperty: boolean; }>(something1)
  expectNotAssignable<number | string | boolean>(something1)
}
expectType<{ someProperty: boolean; }>(something1)
expectNotAssignable<number | string | boolean>(something1)

// test is.stackLocation
expectType<boolean>(stackLocation(something1))
if (stackLocation(something1)) {
  expectAssignable<StackLocation>(something1)

  expectType<{ someProperty: boolean; } & StackLocation>(something1)
  expectAssignable<string>(something1) // because StackLocation is just a string alias
  expectAssignable<object>(something1) // because the type of something1 is preserved too

  expectNotAssignable<typeof something1>(aNumber)
  expectNotAssignable<typeof something1>(aString) // because the type of something1 is preserved too
  expectNotAssignable<typeof something1>(true)
  expectNotAssignable<typeof something1>(argumentsObject)
  expectNotAssignable<typeof something1>(something2)
  expectNotAssignable<typeof something1>([aString, aNumber])
} else {
  expectType<{ someProperty: boolean; }>(something1)
  expectNotAssignable<StackLocation>(something1)
}
expectType<{ someProperty: boolean; }>(something1)
expectNotAssignable<StackLocation>(something1)

// test is.stack
expectType<boolean>(stack(something1))
if (stack(something1)) {
  expectAssignable<string>(something1)

  expectType<{ someProperty: boolean; } & string>(something1)
  expectAssignable<string>(something1)
  expectAssignable<object>(something1) // because the type of something1 is preserved too

  expectNotAssignable<typeof something1>(aNumber)
  expectNotAssignable<typeof something1>(aString) // because the type of something1 is preserved too
  expectNotAssignable<typeof something1>(true)
  expectNotAssignable<typeof something1>(argumentsObject)
  expectNotAssignable<typeof something1>(something2)
  expectNotAssignable<typeof something1>([aString, aNumber])
} else {
  expectType<{ someProperty: boolean; }>(something1)
  expectNotAssignable<string>(something1)
}
expectType<{ someProperty: boolean; }>(something1)
expectNotAssignable<string>(something1)

// test is.frozenOwnProperty
// starting position
expectType<{ aProperty: string; anotherProperty: boolean }>(something2)
expectType<boolean>(frozenOwnProperty(something2, 'does not exist'))
expectType<string>(something2.aProperty)
something2.aProperty = 'another value'
expectType<string>(something2.aProperty)
expectType<boolean>(something2.anotherProperty)
something2.anotherProperty = false
expectType<false>(something2.anotherProperty)
expectAssignable<boolean>(something2.anotherProperty)

if (frozenOwnProperty(something2, 'aProperty')) {
  expectType<{ aProperty: string; anotherProperty: boolean; } & { readonly aProperty: string; }>(something2)
  expectType<string>(something2.aProperty)
  expectError(something2.aProperty = 'cannot assign to readonly')

  // unchanged
  expectType<false>(something2.anotherProperty)
  expectAssignable<boolean>(something2.anotherProperty)
  something2.anotherProperty = true
  expectType<true>(something2.anotherProperty)
  expectAssignable<boolean>(something2.anotherProperty)
}

// outside the if, nothing should have changed; repeat starting position
/* TODO: the following should be true, because we are outside the if, but TS says it is not true …
expectType<{ aProperty: string; anotherProperty: boolean }>(something2)

         instead, we see the same type we see inside the if, which should be wrong: */
expectType<{ aProperty: string; anotherProperty: boolean; } & { readonly aProperty: string; }>(something2)

expectType<boolean>(frozenOwnProperty(something2, 'does not exist'))
expectType<string>(something2.aProperty)
/* TODO: the following should be allowed, but we are kept from assigning by TS

something2.aProperty = 'another value'

         instead we get an error:

         Cannot assign to aProperty because it is a read-only property
 */
expectError(something2.aProperty = 'another value')
expectType<string>(something2.aProperty)
/* TODO: yet, the assignment of true in the if was _not_ remembered; also the setup was not remembered (there the type
         was false) */
expectType<boolean>(something2.anotherProperty)
something2.anotherProperty = false
expectType<false>(something2.anotherProperty)
expectAssignable<boolean>(something2.anotherProperty)

if (frozenOwnProperty(something2, 'yetAnotherProperty')) {
/* TODO: the following should be true, because we are outside the if, but TS says it is not true …
  expectType<{ aProperty: string; anotherProperty: boolean; } & { readonly yetAnotherProperty: unknown; }>(something2)

         instead, we see an extra conjunction, from the previous if: */
  expectType<{ aProperty: string; anotherProperty: boolean; } & { readonly aProperty: string; } & { readonly yetAnotherProperty: unknown; }>(something2)

  expectType<unknown>(something2.yetAnotherProperty)

  expectError(something2.yetAnotherProperty = 'cannot assign to readonly')
  expectType<string>(something2.aProperty)
  /* TODO "Cannot assign to aProperty because it is a read-only property." This is _wrong_! It is not in the if above.
          This should be allowed here
  something2.aProperty = 'another value'
  */
  expectType<false>(something2.anotherProperty) // not boolean, because of the assignment in the repeat
  something2.anotherProperty = true
  expectType<true>(something2.anotherProperty)
  expectAssignable<boolean>(something2.anotherProperty)
}

// now demonstrate that the negation does nothing, on a fresh object
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

// afterwards, nothing is changed
/* TODO: that is, nothing should have changed …
expectType<{aProperty: string, anotherProperty: boolean}>(something3)

         but it is! */
expectType<{ aProperty: string; anotherProperty: boolean; } & { readonly anotherProperty: boolean; }>(something3)

// TODO are these TS bugs? or tsd bugs?
// TODO note that these issues do not occur with the other predicates


// function-ability is retained
// TODO: this does NOT work for functions
function aFunction(a: number): number {
  return 2 * a
}
aFunction.someProperty = 'a value'

// noinspection MagicNumberJS
expectType<number>(aFunction(499343))
if (frozenOwnProperty(aFunction, 'someProperty')) {
  // noinspection MagicNumberJS
  expectType<number>(aFunction(499343))
  expectType<string>(aFunction.someProperty)
  // TODO: it does not work for a known property
  // noinspection MagicNumberJS
  aFunction.someProperty = 423
}
// noinspection MagicNumberJS
expectType<number>(aFunction(499343))

if (frozenOwnProperty(aFunction, 'aPropertyThatDoesntExistYet')) {
  // noinspection MagicNumberJS
  expectType<number>(aFunction(499343))
  // TODO: it does not work for an unknown
  expectError/*expectType<unknown>*/(aFunction.aPropertyThatDoesntExistYet)
}
// noinspection MagicNumberJS
expectType<number>(aFunction(499343))

