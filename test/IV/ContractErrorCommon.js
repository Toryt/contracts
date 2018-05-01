/*
 Copyright 2016 - 2017 by Jan Dockx

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

const ContractError = require('../../src/IV/ContractError')
const testUtil = require('../_util/testUtil')
const util = require('../../src/_private/util')

function expectStackInvariants (subject) {
  subject.stack.must.be.a.string()
  const stack = subject.stack
  const startOfStack = subject.name + ': ' + subject.message + util.eol
  stack.must.match(new RegExp('^' + testUtil.regExpEscape(startOfStack)))
  // noinspection JSUnresolvedVariable
  stack.must.match(new RegExp(
    testUtil.regExpEscape(util.eol + util.stackOutsideThisLibrary(subject._stackSource)) + '$')
  )
}

function expectInvariants (subject) {
  subject.must.be.an.instanceof(ContractError)
  testUtil.expectOwnFrozenProperty(subject, '_stackSource')
  // noinspection JSUnresolvedVariable
  const stackSource = subject._stackSource
  Object.isFrozen(stackSource).must.be.true()
  stackSource.must.be.instanceof(Error)
  stackSource.name.must.equal(ContractError.stackSourceName)
  stackSource.message.must.be.a.string()
  stackSource.message.must.equal(ContractError.stackSourceMessage)
  testUtil.expectOwnFrozenProperty(Object.getPrototypeOf(subject), 'name')
  subject.name.must.be.a.string()
  testUtil.expectOwnFrozenProperty(ContractError.prototype, 'message')
  subject.message.must.be.a.string()
  expectStackInvariants(subject)
}

function expectConstructorPost (result, message) {
  Object.isExtensible(result).must.be.true()
  result.name.must.equal(result.constructor.name)
  result.message.must.equal(message)
}

// noinspection FunctionNamingConventionJS
function generatePrototypeMethodsDescriptions (oneSubjectGenerator, allSubjectGenerators) {
  // NOP: no methods here
}

module.exports = {
  expectConstructorPost: expectConstructorPost,
  expectStackInvariants: expectStackInvariants,
  expectInvariants: expectInvariants,
  generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
}
