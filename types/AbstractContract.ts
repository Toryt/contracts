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

// Minimum TypeScript Version: 4.0.5

import {
  AbstractContract,
  AbstractContractKwargs,
  AnyFunction,
  ContractExceptions,
  ContractFunction,
  ContractParameters,
  ContractResult,
  ContractSignature,
  ContractThis,
  ExceptionCondition,
  GeneralContractFunction,
  InternalLocation,
  Postcondition,
  Precondition,
  StackLocation
} from '@toryt/contracts'

interface SomeObject {
  aProperty: number
}

interface SomeError {
  anErrorProperty: object
}

type AFunction = (this: SomeObject, a: string, b: number) => string

// $expectType (this: SomeObject, a: string, b: number) => string
const aFunction: AFunction = function aFunction (a: string, b: number) { return a + b }
// $expectType (this: SomeObject, a: string, b: number) => string
const aFunction2: AFunction = function aFunction (a: string, b: number) { return `${a}${b} more text`}

// $expectType AFunction
const anAnyFunction: AnyFunction = aFunction

// $ExpectError
const abstractContractKwargs1: AbstractContractKwargs<AFunction, string | SomeError> = null

// $ExpectError
const abstractContractKwargs2: AbstractContractKwargs<AFunction, string | SomeError> = undefined

// $ExpectType {}
const abstractContractKwargs3: AbstractContractKwargs<AFunction, string | SomeError> = {}

// $ExpectType { pre: never[]; }
const abstractContractKwargs4: AbstractContractKwargs<AFunction, string | SomeError> = {
  pre: []
}

// $ExpectType { post: never[]; }
const abstractContractKwargs5: AbstractContractKwargs<AFunction, string | SomeError> = {
  post: []
}

// $ExpectType { exception: never[]; }
const abstractContractKwargs6: AbstractContractKwargs<AFunction, string | SomeError> = {
  exception: []
}

// $ExpectType { pre: never[]; post: never[]; exception: never[]; }
const abstractContractKwargs7: AbstractContractKwargs<AFunction, string | SomeError> = {
  pre: [],
  post: [],
  exception: []
}

const abstractContractKwargs8: AbstractContractKwargs<AFunction, string | SomeError> = {
  // $ExpectError
  other: []
}

// tslint:disable-next-line:max-line-length
// $ExpectType { pre: ((a: string, b: number) => boolean)[]; post: ((this: SomeObject, a: string, b: number, result: string) => boolean)[]; exception: ((this: SomeObject, a: string, b: number, exception: string | SomeError) => boolean)[]; }
const abstractContractKwargs: AbstractContractKwargs<AFunction, string | SomeError> = {
  pre: [
    () => true,
    (a: string) => false,
    (a: string, b: number) => false,
    function (this: SomeObject, a: string, b: number) {return false}
  ],
  post: [
    function (this: SomeObject, a: string, b: number, result: string) {return false}
  ],
  exception: [
    function (this: SomeObject, a: string, b: number, exception: string | SomeError) {return false}
  ]
}

// $expectType StackLocation
const aStackLocation = 'this is a stack location'

// $ExpectError
const notAStackLocation: StackLocation = 42

// $ExpectType InternalLocation
const internalLocation = AbstractContract.internalLocation

// $ExpectType string
const namePrefix = AbstractContract.namePrefix

// $ExpectType AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>
const subject = new AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>(
  abstractContractKwargs,
  'a stack location'
)

// $ExpectType AbstractContract<(this: SomeObject, a: string, b: number) => string, never>
const subjectNoExceptions = new AbstractContract<(this: SomeObject, a: string, b: number) => string, never>(
  abstractContractKwargs,
  'a stack location'
)

function anotherFunction (a: boolean): number {return a ? 23 : 25}
const someObject: SomeObject = { aProperty: 101 }

// $ExpectType boolean
const isAGeneralContractFunctionA = AbstractContract.isAGeneralContractFunction(function () {})
// $ExpectType boolean
const isAGeneralContractFunctionB = AbstractContract.isAGeneralContractFunction(45)
// $ExpectType boolean
const isAGeneralContractFunctionC = AbstractContract.isAGeneralContractFunction<AFunction, string | SomeError>('this is a candidate contract function')
// $ExpectType boolean
const isAGeneralContractFunctionD = AbstractContract.isAGeneralContractFunction<AFunction, string | SomeError>(anotherFunction)
// $ExpectType boolean
const isAGeneralContractFunctionE: boolean = AbstractContract.isAGeneralContractFunction(undefined)
// $ExpectType boolean
const isAGeneralContractFunctionF: boolean = AbstractContract.isAGeneralContractFunction(null)

const anotherFunctionAsUnknown: unknown = anotherFunction
if (AbstractContract.isAGeneralContractFunction<typeof aFunction, string | SomeError>(anotherFunctionAsUnknown)) {
  // $ExpectType CallableGeneralContractFunction<AFunction, string | SomeError>
  const typedAnotherFunction = anotherFunctionAsUnknown
  // $ExpectType AbstractContract<AFunction, string | SomeError>
  const typedAnotherFunctionContract = anotherFunctionAsUnknown.contract
  // $ExpectType AFunction
  const typedAnotherFunctionImplementation = anotherFunctionAsUnknown.implementation
  // $ExpectType string | InternalLocation
  const typedAnotherFunctionLocation: StackLocation | InternalLocation = anotherFunctionAsUnknown.location
  // $ExpectType string
  const typedAnotherFunctionName = anotherFunctionAsUnknown.name

  // $ExpectError
  const typedBoundAnotherFunctionA = anotherFunctionAsUnknown.bind()
  // TODO should be: $ExpectError
  const typedBoundAnotherFunctionB = anotherFunctionAsUnknown.bind(undefined)
  // TODO should be: $ExpectType (this: never, b: number) => string
  const typedBoundAnotherFunctionC = anotherFunctionAsUnknown.bind(someObject, 'this is a string')
  // TODO should be: $ExpectType string
  const typedResult = typedBoundAnotherFunctionC(5)

  // TODO should be: SubPrototype<GeneralContractFunction<AFunction>, AFunction>
  const typedPrototype = anotherFunctionAsUnknown.prototype

  // $ExpectType number
  const typedLength = anotherFunctionAsUnknown.length
  // TODO should be: $ExpectError
  const r1 = anotherFunctionAsUnknown.apply(undefined, [true, new Date()])
  // TODO should be: $ExpectError
  const r2 = anotherFunctionAsUnknown.call(undefined, true, new Date())
}

// MUDO repeat with a subtype to test constructor methods

// $ExpectType boolean
const isAContractFunctionA = AbstractContract.isAContractFunction(function () {})
// $ExpectType boolean
const isAContractFunctionB = AbstractContract.isAContractFunction(45)
// $ExpectType boolean
const isAContractFunctionC = AbstractContract.isAContractFunction<AbstractContract<AFunction, unknown>>('this is a candidate contract function')
// $ExpectType boolean
const isAContractFunctionD = AbstractContract.isAContractFunction<AbstractContract<AFunction, unknown>>(anotherFunction)
// $ExpectType boolean
const isAContractFunctionD2 = AbstractContract.isAContractFunction(anotherFunction)
// $ExpectType boolean
const isAContractFunctionE: boolean = AbstractContract.isAContractFunction(undefined)
// $ExpectType boolean
const isAContractFunctionF: boolean = AbstractContract.isAContractFunction(null)

// isAContractFunction gives never ?!??!?
// const candidateContractFunction = 'this is a candidate contract function'
// if (AbstractContract.isAContractFunction(candidateContractFunction)) {
// tslint:disable-next-line:max-line-length
//   // $ExpectType "this is a candidate contract function" & CallableGeneralContractFunctionProperties<(this: SomeObject, a: string, b: number) => string> & { readonly contract: AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>; }
//   const typedCandidateContractFunction: ContractFunction<typeof subject> = candidateContractFunction
//   // tslint:disable-next-line:max-line-length
//   // $ExpectType AbstractContract<(this: SomeObject, a: string, b: number) => string, unknown> & AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>
//   const typedAnotherFunctionContract = candidateContractFunction.contract
//   // $ExpectType (this: SomeObject, a: string, b: number) => string
//   const typedAnotherFunctionImplementation = candidateContractFunction.implementation
//   // $ExpectType string | InternalLocation
//   const typedAnotherFunctionLocation: StackLocation | InternalLocation = candidateContractFunction.location
//   // $ExpectType string
//   const typedAnotherFunctionName = candidateContractFunction.name
//
//   // $ExpectError
//   const boundContractFunction2G: ContractFunction<typeof subject> = candidateContractFunction.bind()
//   // TODO should be: $ExpectType ContractFunction<AbstractContract<(never, a: string, b: number) => string, string | SomeError>>: REASON: general bind signature?
//   // $ExpectError
//   const boundContractFunction2B: ContractFunction<typeof subject> = typedCandidateContractFunction.bind(someObject)
//   // TODO should be: $ExpectType ContractFunction<AbstractContract<(never, b: number) => string, string | SomeError>>: REASON: general bind signature?
//   // $ExpectError
//   const boundContractFunction2A: ContractFunction<typeof subject> = candidateContractFunction.bind(someObject, 'a string')
//   // TODO should be: $ExpectType ContractFunction<AbstractContract<(this: never) => string, string | SomeError>>
//   // $ExpectError
//   const boundContractFunction2C = candidateContractFunction.bind(someObject, 'a string', 5345)
//   // TODO should be: $ExpectError
//   // $ExpectError
//   const boundContractFunction2D: ContractFunction<typeof subject> = candidateContractFunction.bind(someObject, 'a string', true)
//   // TODO should be: $ExpectError
//   // $ExpectError
//   const boundContractFunction2E: ContractFunction<typeof subject> = candidateContractFunction.bind(someObject, true)
//   // TODO should be: $ExpectError
//   // $ExpectError
//   const boundContractFunction2F: ContractFunction<typeof subject> = candidateContractFunction.bind({someOtherProperty: false}, new Date())
//   // $ExpectType any
//   const typedResult = boundContractFunction2C()
//
//   // TODO should be: $ExpectType SubPrototype<GeneralContractFunction<AFunction, string | SomeError>, AFunction>
//   const typedPrototype = candidateContractFunction.prototype
//
//   // $ExpectType number
//   const typedLength = candidateContractFunction.length
//   // TODO should be: $ExpectError
//   // $ExpectError
//   const r1 = candidateContractFunction.apply(undefined, [true, new Date()])
//   // TODO should be: $ExpectError
//   // $ExpectError
//   const r2 = candidateContractFunction.call(undefined, true, new Date())
//
//   // TODO $ExpectType ContractFunction<AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>>
//   // $ExpectError
//   const blessedA: ContractFunction<typeof subject> = AbstractContract.bless(candidateContractFunction, subject, aFunction, 'this is the location')
//   // $ExpectType ContractFunction<AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>>
//   const blessedB: ContractFunction<typeof subject> = AbstractContract.bless(aFunction, subject, aFunction2, 'this is the location')
//   // $ExpectError
//   const blessedC: ContractFunction<typeof subject> = AbstractContract.bless(anotherFunction, subject, aFunction2, 'this is the location')
//   // $ExpectError
//   const blessedD: ContractFunction<typeof subject> = AbstractContract.bless(aFunction, {}, aFunction2, 'this is the location')
//   // $ExpectError
//   const blessedE: ContractFunction<typeof subject> = AbstractContract.bless(aFunction, subject, anotherFunction, 'this is the location')
//   // MUDO THIS SHOULD FAIL BECAUSE true IS NOT A STACKLOCATION $ExpectError
//   const blessedF: ContractFunction<typeof subject> = AbstractContract.bless(aFunction, subject, aFunction2, true)
//   // $ExpectError
//   const blessedG: ContractFunction<typeof subject> = AbstractContract.bless(aFunction, subject, undefined)
// }

// $ExpectType false
const itsFalse1A: boolean = AbstractContract.falseCondition()
// $ExpectType false
const itsFalse1B: boolean = AbstractContract.falseCondition('lalala')
// TODO should be: $ExpectType false
const itsFalse1C: boolean = AbstractContract.falseCondition.call(someObject, 'lalala')

// $ExpectType false
const itsFalse2A: boolean = AbstractContract.mustNotHappen[0]()
// $ExpectType false
const itsFalse2B: boolean = AbstractContract.mustNotHappen[0]('lalala')

// $ExpectError
const itsFalse3: boolean = AbstractContract.mustNotHappen[1]()

// $ExpectType string | InternalLocation
const subjectStackLocation: StackLocation | InternalLocation = subject.location

// // $ExpectType ContractFunction<AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>>
// const abstractImplementation = subject.abstract

// $ExpectType boolean
const verify = subject.verify

subject.verify = true
subject.verify = false

// $ExpectError
subject.verify = 42

// cannot do: $ExpectType boolean: test says "any"
const protoVerify: boolean = subject.constructor.prototype.verify

Object.getPrototypeOf(subject).verify = true
Object.getPrototypeOf(subject).verify = false

// cannot do: $ExpectError: test says "any"
Object.getPrototypeOf(subject).verify = 'not a boolean'

// cannot do: $ExpectError: test says "any"
subject.constructor.prototype.verify = {}

// $ExpectType boolean
const verifyPostconditions = subject.verify

subject.verifyPostconditions = true
subject.verifyPostconditions = false

// $ExpectError
subject.verifyPostconditions = 42

// cannot do: $ExpectType boolean: test says "any"
const protoVerifyPostConditions: boolean = subject.constructor.prototype.verifyPostconditions

Object.getPrototypeOf(subject).verifyPostconditions = true
Object.getPrototypeOf(subject).verifyPostconditions = false

// cannot do: $ExpectError: test says "any"
Object.getPrototypeOf(subject).verifyPostconditions = 'not a boolean'

// cannot do: $ExpectError: test says "any"
subject.constructor.prototype.verifyPostconditions = {}

// $ExpectType boolean
const implementedBy = subject.isImplementedBy(() => 42)
// $ExpectType boolean
const implementedByb = subject.isImplementedBy([])

const candidate = {}
if (subject.isImplementedBy(candidate)) {
  // $ExpectType CallableGeneralContractFunction<(this: SomeObject, a: string, b: number) => string, string | SomeError>
  const typedCandidate: ContractFunction<typeof subject> = candidate;
}

// $ExpectType CallablePrecondition<(this: SomeObject, a: string, b: number) => string>[]
const pre: Array<Precondition<ContractSignature<typeof subject>>> = subject.pre
// $ExpectError
subject.pre = []

// $ExpectType CallablePostcondition<(this: SomeObject, a: string, b: number) => string>[]
const post: Array<Postcondition<ContractSignature<typeof subject>>> = subject.post
// $ExpectError
subject.post = []

// $ExpectType CallableExceptionCondition<(this: SomeObject, a: string, b: number) => string, string | SomeError>[]
const exception: Array<ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>>> = subject.exception
// $ExpectError
subject.exception = []

// $ExpectType (this: SomeObject, a: string, b: number) => string
type contractSignature = ContractSignature<typeof subject>

// $ExpectType SomeObject
type contractThis = ContractThis<typeof subject>

// $ExpectType [a: string, b: number]
type contractParameters = ContractParameters<typeof subject>

// $ExpectType string
type contractResult = ContractResult<typeof subject>

// $ExpectType string | SomeError
type contractExceptions = ContractExceptions<typeof subject>

const preCondition1: Precondition<ContractSignature<typeof subject>> = () => true
const preCondition1b: Precondition<ContractSignature<typeof subject>> = (c: string) => true
const preCondition1c: Precondition<ContractSignature<typeof subject>> = (a: string | boolean) => true
// $ExpectError
const preCondition1d: Precondition<ContractSignature<typeof subject>> = (a: number) => true
const preCondition2: Precondition<ContractSignature<typeof subject>> = (a: string) => false
const preCondition3: Precondition<ContractSignature<typeof subject>> = (a: string, b: number) => false
// $ExpectError
const preCondition3b: Precondition<ContractSignature<typeof subject>> = (a: string, b: boolean) => false
const preCondition4: Precondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {return false}
const preCondition4b: Precondition<ContractSignature<typeof subject>> = function (this: object, a: string, b: number) {return false}
// $ExpectError
const preCondition4c: Precondition<ContractSignature<typeof subject>> = function (this: SomeError, a: string, b: number) {return false}
// TODO this should fail, but it doesn't? TS interfaces are weird
const preCondition4d: Precondition<ContractSignature<typeof subject>> = function (this: {}, a: string, b: number) {return false}
// $ExpectError
const preCondition5: Precondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number, c: boolean) {return false}
const preCondition6a: Precondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {return 'i am truthy'}
const preCondition6b: Precondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {return ''}
const preCondition6c: Precondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {return null}
const preCondition6d: Precondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {}

const postCondition1: Postcondition<ContractSignature<typeof subject>> = () => true
const postCondition1b: Postcondition<ContractSignature<typeof subject>> = (c: string) => true
const postCondition1c: Postcondition<ContractSignature<typeof subject>> = (a: string | boolean) => true
// $ExpectError
const postCondition1d: Postcondition<ContractSignature<typeof subject>> = (a: number) => true
const postCondition2: Postcondition<ContractSignature<typeof subject>> = (a: string) => false
const postCondition3: Postcondition<ContractSignature<typeof subject>> = (a: string, b: number) => false
// $ExpectError
const postCondition3b: Postcondition<ContractSignature<typeof subject>> = (a: string, b: boolean) => false
const postCondition4: Postcondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {return false}
const postCondition4b: Postcondition<ContractSignature<typeof subject>> = function (this: object, a: string, b: number) {return false}
// $ExpectError
const postCondition4c: Postcondition<ContractSignature<typeof subject>> = function (this: SomeError, a: string, b: number) {return false}
// TODO this should fail, but it doesn't? TS interfaces are weird
const postCondition4d: Postcondition<ContractSignature<typeof subject>> = function (this: {}, a: string, b: number) {return false}
// $ExpectError
const postCondition5: Postcondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number, c: boolean) {return false}
const postCondition6a: Postcondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {return 'i am truthy'}
const postCondition6b: Postcondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {return ''}
const postCondition6c: Postcondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {return null}
const postCondition6d: Postcondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number) {}

const postCondition7: Postcondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number, result: string) {return true}
// $ExpectError
const postCondition7b: Postcondition<ContractSignature<typeof subject>> = function (this: SomeObject, a: string, b: number, result: Date) {return true}

const postCondition8: Postcondition<ContractSignature<typeof subject>> =
  function (this: SomeObject, a: string, b: number, result: string, thisFunction: ContractFunction<typeof subject>) {return true}
// $ExpectError
const postCondition8b: Postcondition<ContractSignature<typeof subject>> =
  function (this: SomeObject, a: string, b: number, result: string, thisFunction: ContractFunction<AbstractContract<(a: object) => Date, never>>) {return true}

const exceptionCondition1: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = () => true
const exceptionCondition1b: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = (c: string) => true
const exceptionCondition1c: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = (a: string | boolean) => true
// $ExpectError
const exceptionCondition1d: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = (a: number) => true
const exceptionCondition2: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = (a: string) => false
const exceptionCondition3: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = (a: string, b: number) => false
// $ExpectError
const exceptionCondition3b: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = (a: string, b: boolean) => false
const exceptionCondition4: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number) {return false}
const exceptionCondition4b: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: object, a: string, b: number) {return false}
// $ExpectError
const exceptionCondition4c: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeError, a: string, b: number) {return false}
// TODO this should fail, but it doesn't? TS interfaces are weird
const exceptionCondition4d: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: {}, a: string, b: number) {return false}
// $ExpectError
const exceptionCondition5: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number, c: boolean) {return false}
const exceptionCondition6a: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number) {return 'i am truthy'}
const exceptionCondition6b: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number) {return ''}
const exceptionCondition6c: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number) {return null}
const exceptionCondition6d: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number) {}

const exceptionCondition7: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number, exc: string | SomeError) {return true}
// $ExpectError
const exceptionCondition7b: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number, exc: string) {return true}
// $ExpectError
const exceptionCondition7c: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number, exc: SomeError) {return true}
// $ExpectError
const exceptionCondition7d: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number, exc: never) {return true}
const exceptionCondition7e: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number, exc: unknown) {return true}
// tslint:disable-next-line:no-any
const exceptionCondition7f: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> = function (this: SomeObject, a: string, b: number, exc: any) {return true}

const exceptionCondition8: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> =
  function (this: SomeObject, a: string, b: number, exc: string | SomeError, thisFunction: ContractFunction<typeof subject>) {return true}
// $ExpectError
const exceptionCondition8b: ExceptionCondition<ContractSignature<typeof subject>, ContractExceptions<typeof subject>> =
  function (this: SomeObject, a: string, b: number, exc: string | SomeError, thisFunction: ContractFunction<AbstractContract<(a: object) => Date, never>>) {return true}

// MUDO if exception type is never, exception conditions should always be false
const exceptionCondition9: ExceptionCondition<ContractSignature<typeof subjectNoExceptions>, ContractExceptions<typeof subjectNoExceptions>> = function (this: SomeObject, a: string, b: number, exc: never) {return true}
const exceptionCondition9b: ExceptionCondition<ContractSignature<typeof subjectNoExceptions>, ContractExceptions<typeof subjectNoExceptions>> = function (this: SomeObject, a: string, b: number, exc: string) {return true}
const exceptionCondition9c: ExceptionCondition<ContractSignature<typeof subjectNoExceptions>, ContractExceptions<typeof subjectNoExceptions>> = function (this: SomeObject, a: string, b: number, exc: SomeError) {return true}
const exceptionCondition9e: ExceptionCondition<ContractSignature<typeof subjectNoExceptions>, ContractExceptions<typeof subjectNoExceptions>> = function (this: SomeObject, a: string, b: number, exc: unknown) {return true}
// tslint:disable-next-line:no-any
const exceptionCondition9f: ExceptionCondition<ContractSignature<typeof subjectNoExceptions>, ContractExceptions<typeof subjectNoExceptions>> = function (this: SomeObject, a: string, b: number, exc: any) {return true}
