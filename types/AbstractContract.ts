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
  AnyFunction, ContractExceptions,
  ContractParameters,
  ContractResult,
  ContractSignature, ContractThis,
  StackLocation
} from '@toryt/contracts'

// $expectType object
const aFunction = function aFunction (a: string, b: number) { return a + b }

// $expectType number
const anAnyFunction: AnyFunction = aFunction

// $expectType StackLocation
const aStackLocation: StackLocation = 'this is a stack location'

// $ExpectError
const notAStackLocation: StackLocation = 42

// $ExpectType object
const internalLocation = AbstractContract.internalLocation

// $ExpectType string
const namePrefix = AbstractContract.namePrefix

// $ExpectType boolean
const isAContractFunction = AbstractContract.isAContractFunction(function () {})

interface SomeObject {
  aProperty: number
}

interface SomeError {
  anErrorProperty: object
}

// $ExpectType AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>
const subject = new AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>()

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
