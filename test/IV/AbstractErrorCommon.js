/*
 Copyright 2016 - 2018 by Jan Dockx

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

/* eslint-env mocha */

'use strict'

const AbstractError = require('../../src/IV/AbstractContract').AbstractError
const testUtil = require('../_util/testUtil')
const common = require('./ContractErrorCommon')

function expectInvariants (subject) {
  subject.must.be.an.instanceof(AbstractError)
  common.expectInvariants(subject)
  testUtil.expectOwnFrozenProperty(subject, 'name')
  subject.name.must.equal(AbstractError.name)
  testUtil.expectOwnFrozenProperty(Object.getPrototypeOf(subject), 'name')
  Object.getPrototypeOf(subject).name.must.equal(AbstractError.name)
  testUtil.expectOwnFrozenProperty(subject, 'message')
  subject.message.must.equal(AbstractError.message)
  testUtil.expectOwnFrozenProperty(AbstractError.prototype, 'message')
  Object.getPrototypeOf(subject).message.must.equal(AbstractError.message)
}

function expectConstructorPost (result, message, contract) {
  common.expectConstructorPost(result, message)
  result.contract.must.equal(contract)
}

// noinspection FunctionNamingConventionJS
function generatePrototypeMethodsDescriptions (oneSubjectGenerator, allSubjectGenerators) {
  common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators)

  // NOP: no methods here
}

const test = {
  expectConstructorPost: expectConstructorPost,
  expectInvariants: expectInvariants,
  generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
}

Object.setPrototypeOf(test, common)

module.exports = test
