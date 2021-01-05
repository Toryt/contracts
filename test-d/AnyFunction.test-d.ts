/*
 Copyright 2020 - 2020 by Jan Dockx

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
  aB,
  aFunction1,
  AFunction1,
  aFunction2,
  AFunction2,
  aFunction3,
  AFunction3,
  anA,
  ANewableFunction, someObject
} from './subjects'
import { NeverUnknownCallableFunction, NeverUnknownFunction, NeverUnknownNewableFunction } from '../lib/AnyFunction'


type NeverUnknownF = (...args: never[]) => unknown
type AnyUnknownF = (...args: any[]) => unknown
type UnknownUnknownF = (...args: unknown[]) => unknown
type NoArgsUnknownF = () => unknown

const neverUnknownFunction: NeverUnknownF = (a: never, b: never) => '' + a + b
expectError(neverUnknownFunction(anA, aB)) // cannot call a never function
expectError(neverUnknownFunction(undefined, undefined)) // cannot call a never function
expectType<unknown>(neverUnknownFunction()) // surprise!

const anyUnknownFunction: AnyUnknownF = (a: any, b: any) => '' + a + b
expectType<unknown>(anyUnknownFunction(anA, aB))
expectType<unknown>(anyUnknownFunction())

const unknownUnknownFunction: AnyUnknownF = (a: unknown, b: unknown) => '' + a + b
expectType<unknown>(unknownUnknownFunction(anA, aB))
expectType<unknown>(unknownUnknownFunction())

const noArgsUnknownFunction: NoArgsUnknownF = () => ''
expectType<unknown>(noArgsUnknownFunction())

expectType<string>(aFunction2(anA, aB))
expectError(aFunction2())

interface NeverUnknownFunctionConstrained<F extends NeverUnknownFunction> {
  theFunction: F
}

const neverUnknownFunctionNever: NeverUnknownFunctionConstrained<NeverUnknownF> = {theFunction: neverUnknownFunction}
expectType<NeverUnknownF>(neverUnknownFunctionNever.theFunction)
expectNotAssignable<AnyUnknownF>(neverUnknownFunctionNever.theFunction)
expectNotAssignable<UnknownUnknownF>(neverUnknownFunctionNever.theFunction)
expectNotAssignable<AFunction2>(neverUnknownFunctionNever.theFunction)
expectError(neverUnknownFunctionNever.theFunction(anA, aB)) // cannot call a never function
expectType<unknown>(neverUnknownFunctionNever.theFunction()) // surpise!

const neverUnknownFunctionAny: NeverUnknownFunctionConstrained<AnyUnknownF> = {theFunction: anyUnknownFunction}
expectAssignable<NeverUnknownF>(neverUnknownFunctionAny.theFunction)
expectType<AnyUnknownF>(neverUnknownFunctionAny.theFunction)
expectAssignable<UnknownUnknownF>(neverUnknownFunctionAny.theFunction)
expectNotAssignable<AFunction2>(neverUnknownFunctionAny.theFunction)
expectType<unknown>(neverUnknownFunctionAny.theFunction(anA, aB))
expectType<unknown>(neverUnknownFunctionAny.theFunction())

const neverUnknownFunctionUnknown: NeverUnknownFunctionConstrained<UnknownUnknownF> = {theFunction: unknownUnknownFunction}
expectAssignable<NeverUnknownF>(neverUnknownFunctionUnknown.theFunction)
expectAssignable<AnyUnknownF>(neverUnknownFunctionUnknown.theFunction)
expectType<UnknownUnknownF>(neverUnknownFunctionUnknown.theFunction)
expectNotAssignable<AFunction2>(neverUnknownFunctionUnknown.theFunction)
expectType<unknown>(neverUnknownFunctionUnknown.theFunction(anA, aB))
expectType<unknown>(neverUnknownFunctionUnknown.theFunction())

const neverUnknownFunctionFunction2: NeverUnknownFunctionConstrained<AFunction2> = {theFunction: aFunction2}
// Assignable because we will not call `theFunction`, which we know requires a: string, with a never
expectAssignable<NeverUnknownF>(neverUnknownFunctionFunction2.theFunction)
// Assignable because we can call `theFunction`, which we know requires a: string, with an any
expectAssignable<AnyUnknownF>(neverUnknownFunctionFunction2.theFunction)
// Not assignable because this would mean we could call `theFunction`, which we know requires a: string, with an unknown
expectNotAssignable<UnknownUnknownF>(neverUnknownFunctionFunction2.theFunction)
expectType<AFunction2>(neverUnknownFunctionFunction2.theFunction)
expectType<string>(neverUnknownFunctionFunction2.theFunction(anA, aB))
expectError(neverUnknownFunctionFunction2.theFunction())

interface AnyUnknownFunctionConstrained<F extends AnyUnknownF> {
  theFunction: F
}

/*
 const anyUnknownFunctionNever: AnyUnknownFunctionConstrained<NeverUnknownF> = {theFunction: neverUnknownFunction}

 Type NeverUnknownF does not satisfy the constraint AnyUnknownF.
 Types of parameters args and args are incompatible.
 Type any is not assignable to type never.
 */

// the rest is the same

const anyUnknownFunctionAny: AnyUnknownFunctionConstrained<AnyUnknownF> = {theFunction: anyUnknownFunction}
expectAssignable<NeverUnknownF>(anyUnknownFunctionAny.theFunction)
expectType<AnyUnknownF>(anyUnknownFunctionAny.theFunction)
expectAssignable<UnknownUnknownF>(anyUnknownFunctionAny.theFunction)
expectNotAssignable<AFunction2>(anyUnknownFunctionAny.theFunction)
expectType<unknown>(anyUnknownFunctionAny.theFunction(anA, aB))
expectType<unknown>(anyUnknownFunctionAny.theFunction())

const anyUnknownFunctionUnknown: AnyUnknownFunctionConstrained<UnknownUnknownF> = {theFunction: unknownUnknownFunction}
expectAssignable<NeverUnknownF>(anyUnknownFunctionUnknown.theFunction)
expectAssignable<AnyUnknownF>(anyUnknownFunctionUnknown.theFunction)
expectType<UnknownUnknownF>(anyUnknownFunctionUnknown.theFunction)
expectNotAssignable<AFunction2>(anyUnknownFunctionUnknown.theFunction)
expectType<unknown>(anyUnknownFunctionUnknown.theFunction(anA, aB))
expectType<unknown>(anyUnknownFunctionUnknown.theFunction())

const anyUnknownFunctionFunction2: AnyUnknownFunctionConstrained<AFunction2> = {theFunction: aFunction2}
// Assignable because we will not call `theFunction`, which we know requires a: string, with a never
expectAssignable<NeverUnknownF>(anyUnknownFunctionFunction2.theFunction)
// Assignable because we can call `theFunction`, which we know requires a: string, with an any
expectAssignable<AnyUnknownF>(anyUnknownFunctionFunction2.theFunction)
// Not assignable because this would mean we could call `theFunction`, which we know requires a: string, with an unknown
expectNotAssignable<UnknownUnknownF>(anyUnknownFunctionFunction2.theFunction)
expectType<AFunction2>(anyUnknownFunctionFunction2.theFunction)
expectType<string>(anyUnknownFunctionFunction2.theFunction(anA, aB))
expectError(anyUnknownFunctionFunction2.theFunction())

interface UnknownUnknownFunctionConstrained<F extends UnknownUnknownF> {
  theFunction: F
}

/*
 const unknownUnknownFunctionNever: UnknownUnknownFunctionConstrained<NeverUnknownF> = {theFunction: neverUnknownFunction}

 Type NeverUnknownF does not satisfy the constraint AnyUnknownF.
 Types of parameters args and args are incompatible.
 Type unknown is not assignable to type never.
 */

// the same to start, but …

const unknownUnknownFunctionAny: UnknownUnknownFunctionConstrained<AnyUnknownF> = {theFunction: unknownUnknownFunction}
expectAssignable<NeverUnknownF>(unknownUnknownFunctionAny.theFunction)
expectType<AnyUnknownF>(unknownUnknownFunctionAny.theFunction)
expectAssignable<UnknownUnknownF>(unknownUnknownFunctionAny.theFunction)
expectNotAssignable<AFunction2>(unknownUnknownFunctionAny.theFunction)
expectType<unknown>(unknownUnknownFunctionAny.theFunction(anA, aB))
expectType<unknown>(unknownUnknownFunctionAny.theFunction())

const unknownUnknownFunctionUnknown: UnknownUnknownFunctionConstrained<UnknownUnknownF> = {theFunction: unknownUnknownFunction}
expectAssignable<NeverUnknownF>(unknownUnknownFunctionUnknown.theFunction)
expectAssignable<AnyUnknownF>(unknownUnknownFunctionUnknown.theFunction)
expectType<UnknownUnknownF>(unknownUnknownFunctionUnknown.theFunction)
expectNotAssignable<AFunction2>(unknownUnknownFunctionUnknown.theFunction)
expectType<unknown>(unknownUnknownFunctionUnknown.theFunction(anA, aB))
expectType<unknown>(unknownUnknownFunctionUnknown.theFunction())

/* not the same for a meaningful function!
 const unknownUnknownFunctionFunction2: UnknownUnknownFunctionConstrained<AFunction2> = {theFunction: aFunction2}

 Type AFunction2 does not satisfy the constraint UnknownUnknownFunction.
 Types of parameters a and args are incompatible.
 Type unknown is not assignable to type string.

 Not assignable because this would mean we could call `theFunction`, which we know requires a: string, with an unknown.
 We can call this with an any (because anything goes), and we can call this with a never (because we never will).
 So those _are_ assignable from AFunction2, proven above.

 In other words, the "top type" for functions cannot be `UnknownUnknownFunction`, because then we cannot assign any
 regular function. `unknown` is the top type, and for the arguments contravariance applies. We actually need the bottom
 type for arguments in the top type for functions. That is `never` and `NeverUnknownF`.

 `AnyUnknownF` works too, except that we cannot use `NeverUnknownF` as argument. But `AnyUnknownF`
 is just giving up, because then anything goes (as the examples show).
 */

interface NoArgsUnknownFunctionConstrained<F extends NoArgsUnknownF> {
  theFunction: F
}

const noArgsUnknownFunctionNever: NoArgsUnknownFunctionConstrained<NeverUnknownF> = {theFunction: noArgsUnknownFunction}
expectType<NeverUnknownF>(noArgsUnknownFunctionNever.theFunction)
expectNotAssignable<AnyUnknownF>(noArgsUnknownFunctionNever.theFunction)
expectNotAssignable<UnknownUnknownF>(noArgsUnknownFunctionNever.theFunction)
expectNotAssignable<AFunction2>(noArgsUnknownFunctionNever.theFunction)
expectError(noArgsUnknownFunctionNever.theFunction(anA, aB)) // cannot call a never function
expectType<unknown>(noArgsUnknownFunctionNever.theFunction()) // surpise!

const noArgsUnknownFunctionAny: NoArgsUnknownFunctionConstrained<AnyUnknownF> = {theFunction: anyUnknownFunction}
expectAssignable<NeverUnknownF>(noArgsUnknownFunctionAny.theFunction)
expectType<AnyUnknownF>(noArgsUnknownFunctionAny.theFunction)
expectAssignable<UnknownUnknownF>(noArgsUnknownFunctionAny.theFunction)
expectNotAssignable<AFunction2>(noArgsUnknownFunctionAny.theFunction)
expectType<unknown>(noArgsUnknownFunctionAny.theFunction(anA, aB))
expectType<unknown>(noArgsUnknownFunctionAny.theFunction())

const noArgsUnknownFunctionUnknown: NoArgsUnknownFunctionConstrained<UnknownUnknownF> = {theFunction: unknownUnknownFunction}
expectAssignable<NeverUnknownF>(noArgsUnknownFunctionUnknown.theFunction)
expectAssignable<AnyUnknownF>(noArgsUnknownFunctionUnknown.theFunction)
expectType<UnknownUnknownF>(noArgsUnknownFunctionUnknown.theFunction)
expectNotAssignable<AFunction2>(noArgsUnknownFunctionUnknown.theFunction)
expectType<unknown>(noArgsUnknownFunctionUnknown.theFunction(anA, aB))
expectType<unknown>(noArgsUnknownFunctionUnknown.theFunction())

/*
 const noArgsUnknownFunctionFunction2: NoArgsUnknownFunctionConstrained<AFunction2> = {theFunction: aFunction2}

 Type AFunction2 does not satisfy the constraint NoArgsUnknownF.

 So `NoArgsUnknownF` is no alternative. The reason is that we would be allowed to call `theFunction`, which
 _requires_ 2 parameters, with 0 parameters. Note that we can always call a function with more parameters than required,
 but not with less.
 */


// start of real tests

expectType<AFunction1>(aFunction1)
expectType<string>(aFunction1.call(someObject, anA, aB))
expectAssignable<NeverUnknownCallableFunction>(aFunction1)
expectNotAssignable<NeverUnknownNewableFunction>(aFunction1)
expectAssignable<NeverUnknownFunction>(aFunction1)
expectType<number>(aFunction1.length)
expectType<Function['toString']>(aFunction1.toString)
expectType<CallableFunction['apply']>(aFunction1.apply)
expectType<CallableFunction['call']>(aFunction1.call)
expectType<CallableFunction['bind']>(aFunction1.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aFunction1.prototype)

expectType<AFunction2>(aFunction2)
expectType<string>(aFunction2(anA, aB))
expectAssignable<AFunction1>(aFunction2)
expectAssignable<NeverUnknownCallableFunction>(aFunction2)
expectNotAssignable<NeverUnknownNewableFunction>(aFunction2)
expectAssignable<NeverUnknownFunction>(aFunction2)
expectType<number>(aFunction2.length)
expectType<Function['toString']>(aFunction2.toString)
expectType<CallableFunction['apply']>(aFunction2.apply)
expectType<CallableFunction['call']>(aFunction2.call)
expectType<CallableFunction['bind']>(aFunction1.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aFunction2.prototype)

expectType<AFunction3>(aFunction3)
expectType<'truth' | 'dare'>(aFunction3(anA))
expectAssignable<AFunction2>(aFunction3)
expectAssignable<AFunction1>(aFunction3)
expectAssignable<NeverUnknownCallableFunction>(aFunction3)
expectNotAssignable<NeverUnknownNewableFunction>(aFunction3)
expectAssignable<NeverUnknownFunction>(aFunction3)
expectType<number>(aFunction3.length)
expectType<Function['toString']>(aFunction3.toString)
expectType<CallableFunction['apply']>(aFunction3.apply)
expectType<CallableFunction['call']>(aFunction3.call)
expectType<CallableFunction['bind']>(aFunction1.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(aFunction3.prototype)

let anyCallableFunction: NeverUnknownCallableFunction = aFunction2
/*
anyCallableFunction(anA, aB)

 "The this context of type void is not assignable to method's this of type never."

 Or, in short, cannot call never function, as expected.
 (cannot be detected with tsd??)
*/
expectType<NeverUnknownCallableFunction>(anyCallableFunction)
expectNotAssignable<NeverUnknownNewableFunction>(anyCallableFunction)
expectAssignable<NeverUnknownFunction>(anyCallableFunction)
expectType<number>(anyCallableFunction.length)
expectType<Function['toString']>(anyCallableFunction.toString)
expectType<CallableFunction['apply']>(anyCallableFunction.apply)
expectType<CallableFunction['call']>(anyCallableFunction.call)
expectType<CallableFunction['bind']>(anyCallableFunction.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(anyCallableFunction.prototype)

// without `as AnyFunction`, TS still sees this as AnyCallableFunction
let anyFunction1a: NeverUnknownFunction = aFunction1
expectAssignable<NeverUnknownFunction>(anyFunction1a)
expectNotType<NeverUnknownNewableFunction>(anyFunction1a)
expectType<NeverUnknownCallableFunction>(anyFunction1a)

let anyFunction1b: NeverUnknownFunction = aFunction1 as NeverUnknownFunction
expectType<NeverUnknownFunction>(anyFunction1b)
expectType<number>(anyFunction1b.length)
expectType<Function['toString']>(anyFunction1b.toString)
expectType<CallableFunction['apply'] | NewableFunction['apply']>(anyFunction1b.apply)
expectType<CallableFunction['call'] | NewableFunction['call']>(anyFunction1b.call)
expectType<CallableFunction['bind'] | NewableFunction['bind']>(anyFunction1b.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(anyFunction1b.prototype)

expectType<typeof ANewableFunction>(ANewableFunction)
expectAssignable<new (a: string, b: number) => ANewableFunction>(ANewableFunction)
expectNotAssignable<NeverUnknownCallableFunction>(ANewableFunction)
expectAssignable<NeverUnknownNewableFunction>(ANewableFunction)
expectAssignable<NeverUnknownFunction>(ANewableFunction)
expectType<number>(ANewableFunction.length)
expectType<Function['toString']>(ANewableFunction.toString)
expectType<NewableFunction['apply']>(ANewableFunction.apply)
expectType<NewableFunction['call']>(ANewableFunction.call)
expectType<NewableFunction['bind']>(ANewableFunction.bind)
// (***) … but TS knows that the prototype of a constructor is the type of the class
expectType<ANewableFunction>(ANewableFunction.prototype)

// without `as AnyFunction`, TS still sees this as AnyCallableFunction
let anyFunction2a: NeverUnknownFunction = ANewableFunction
expectNotType<NeverUnknownFunction>(anyFunction2a)
expectAssignable<NeverUnknownFunction>(anyFunction2a)
expectNotType<NeverUnknownCallableFunction>(anyFunction2a)
expectType<NeverUnknownNewableFunction>(anyFunction2a)
// (***) … but TS does not know that the prototype of a constructor is the type of the class
expectNotType<ANewableFunction>(anyFunction2a.prototype)
expectType<any>(anyFunction2a.prototype)

let anyFunction2b: NeverUnknownFunction = ANewableFunction as NeverUnknownFunction
expectType<NeverUnknownFunction>(anyFunction2b)
expectType<number>(anyFunction1b.length)
expectType<Function['toString']>(anyFunction2b.toString)
expectType<CallableFunction['apply'] | NewableFunction['apply']>(anyFunction2b.apply)
expectType<CallableFunction['call'] | NewableFunction['call']>(anyFunction2b.call)
expectType<CallableFunction['bind'] | NewableFunction['bind']>(anyFunction2b.bind)
// `prototype` is defined with type `any` in `lib.es5.d.ts`, and there is nothing we can do about that … (***)
expectType<any>(anyFunction2b.prototype)
