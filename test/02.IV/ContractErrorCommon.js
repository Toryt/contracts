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

const ContractError = require('../../lib/IV/ContractError')
const testUtil = require('../_util/testUtil')
const is = require('../../lib/_private/is')
const os = require('os')

function expectStackInvariants (subject) {
  const stack = subject.stack
  stack.should.be.a.String()
  const startOfStack = subject.name + ': ' + subject.message + os.EOL
  stack.must.match(new RegExp('^' + testUtil.regExpEscape(startOfStack)))
  const restOfStack = stack
    .replace(startOfStack, '')
    .split(os.EOL)
    // remove empty lines that may occur in 'caused by' in Safari when used via Web Driver
    .filter(l => !!l)
    .join(os.EOL)
  is.stack(restOfStack).should.be.true()
  // noinspection JSUnresolvedVariable
  restOfStack.must.contain(subject._rawStack)
}

function expectInvariants (subject) {
  subject.should.be.an.instanceof(ContractError)
  testUtil.expectOwnFrozenProperty(Object.getPrototypeOf(subject), 'name')
  subject.name.should.be.a.String()
  subject.name.should.equal(subject.constructor.name)
  testUtil.expectOwnFrozenProperty(ContractError.prototype, 'message')
  subject.message.should.be.a.String()
  testUtil.expectOwnFrozenProperty(subject, '_rawStack')
  // noinspection JSUnresolvedVariable
  is.stack(subject._rawStack).should.be.true()
  expectStackInvariants(subject)
}

function expectConstructorPost (result, message, rawStack) {
  Object.isExtensible(result).should.be.true()
  result.name.should.equal(result.constructor.name)
  result.message.should.equal(message)
  result._rawStack.should.equal(rawStack)
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
