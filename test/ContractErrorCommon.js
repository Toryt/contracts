/*
  Copyright 2016–2024 Jan Dockx

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

'use strict'

const ContractError = require('../lib/ContractError')
const testUtil = require('./_util/testUtil')
const is = require('../lib/_private/is')
const stackEOL = require('../lib/_private/eol').stack

function expectStackInvariants(subject) {
  const stack = subject.stack
  stack.should.be.a.String()
  const startOfStack = subject.name + ': ' + subject.message + stackEOL
  stack.should.match(new RegExp('^' + testUtil.regExpEscape(startOfStack)))
  const restOfStack = stack
    .replace(startOfStack, '')
    .split(stackEOL)
    // remove empty lines that may occur in 'caused by' in Safari when used via Web Driver
    .filter(l => !!l)
    .join(stackEOL)
  is.stack(restOfStack).should.be.true()
  //noinspection JSUnresolvedReference
  restOfStack.should.containEql(subject._rawStack)
}

function expectInvariants(subject) {
  subject.should.be.an.instanceof(ContractError)
  testUtil.expectOwnFrozenProperty(Object.getPrototypeOf(subject), 'name')
  subject.name.should.be.a.String()
  subject.name.should.equal(subject.constructor.name)
  testUtil.expectOwnFrozenProperty(ContractError.prototype, 'message')
  subject.message.should.be.a.String()
  testUtil.expectOwnFrozenProperty(subject, '_rawStack')
  //noinspection JSUnresolvedReference
  is.stack(subject._rawStack).should.be.true()
  expectStackInvariants(subject)
}

function expectConstructorPost(result, message, rawStack) {
  Object.isExtensible(result).should.be.true()
  result.name.should.equal(result.constructor.name)
  result.message.should.equal(message)
  //noinspection JSUnresolvedReference
  result._rawStack.should.equal(rawStack)
}

// noinspection FunctionNamingConventionJS
function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
  // NOP: no methods here
}

module.exports = {
  expectConstructorPost,
  expectStackInvariants,
  expectInvariants,
  generatePrototypeMethodsDescriptions
}
