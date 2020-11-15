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
  AbstractContract, AbstractContractKwargs,
  AnyFunction, ContractExceptions,
  ContractParameters,
  ContractResult,
  ContractSignature, ContractThis, Precondition,
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

// $expectType StackLocation
const aStackLocation = 'this is a stack location'

// $ExpectError
const notAStackLocation: StackLocation = 42

// $ExpectType object
const internalLocation = AbstractContract.internalLocation

// $ExpectType string
const namePrefix = AbstractContract.namePrefix

// $ExpectType boolean
const isAContractFunction = AbstractContract.isAContractFunction(function () {})

// $ExpectType AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>
const subject = new AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>(
  {
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
  },
  'a stack location'
)

// $ExpectType string | object
const subjectStackLocation: StackLocation | object = subject.location

// $ExpectType GeneralContractFunction<AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>>
const abstractImplementation = subject.abstract

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

const preCondition1: Precondition<typeof subject> = () => true
const preCondition1b: Precondition<typeof subject> = (c: string) => true
const preCondition1c: Precondition<typeof subject> = (a: string | boolean) => true
// $ExpectError
const preCondition1d: Precondition<typeof subject> = (a: number) => true
const preCondition2: Precondition<typeof subject> = (a: string) => false
const preCondition3: Precondition<typeof subject> = (a: string, b: number) => false
// $ExpectError
const preCondition3b: Precondition<typeof subject> = (a: string, b: boolean) => false
const preCondition4: Precondition<typeof subject> = function (this: SomeObject, a: string, b: number) {return false}
const preCondition4b: Precondition<typeof subject> = function (this: object, a: string, b: number) {return false}
// $ExpectError
const preCondition4c: Precondition<typeof subject> = function (this: SomeError, a: string, b: number) {return false}
// TODO this should fail, but it doesn't? TS interfaces are weird
const preCondition4d: Precondition<typeof subject> = function (this: {}, a: string, b: number) {return false}
// $ExpectError
const preCondition5: Precondition<typeof subject> = function (this: SomeObject, a: string, b: number, c: boolean) {return false}
const preCondition6a: Precondition<typeof subject> = function (this: SomeObject, a: string, b: number) {return 'i am truthy'}
const preCondition6b: Precondition<typeof subject> = function (this: SomeObject, a: string, b: number) {return ''}
const preCondition6c: Precondition<typeof subject> = function (this: SomeObject, a: string, b: number) {return null}
const preCondition6d: Precondition<typeof subject> = function (this: SomeObject, a: string, b: number) {}
