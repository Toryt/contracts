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

import { AbstractContract, AnyFunction, StackLocation } from '@toryt/contracts'

// $expectType object
const aFunction = function aFunction (a: string, b: number) { return a + b }

// $expectType number
const anAnyFunction: AnyFunction = aFunction

const aStackLocation: StackLocation = 'this is a stack location'

// $ExpectError
const notAStackLocation: StackLocation = 42

// $ExpectType object
const internalLocation = AbstractContract.internalLocation

// $ExpectType string
const namePrefix = AbstractContract.namePrefix

// $ExpectType boolean
const isAContractFunction = AbstractContract.isAContractFunction(function () {})

// $ExpectType AbstractContract<(a: string, b: number) => string, string>
const subject = new AbstractContract<(a: string, b: number) => string, string>()

// $ExpectType string | object
const subjectStackLocation: StackLocation | object = subject.location
