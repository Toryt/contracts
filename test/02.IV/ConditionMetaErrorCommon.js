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

const testUtil = require('../_util/testUtil')
const report = require('../../lib/_private/report')
const common = require('./ConditionErrorCommon')
const ConditionMetaError = require('../../lib/IV/ConditionMetaError')
const should = require('should')

function expectInvariants (subject) {
  subject.should.be.an.instanceof(ConditionMetaError)
  if (subject.error) {
    Object.isFrozen(subject.error).should.be.true()
  }
  common.expectInvariants(subject)
  testUtil.expectOwnFrozenProperty(subject, 'error')
  subject.stack.should.containEql('' + subject.error)
  if (subject.error && subject.error.stack) {
    subject.stack.should.containEql(subject.error.stack)
  }
  subject.message.should.containEql('(' + subject.error + ')')
}

function expectConstructorPost (result, contractFunction, condition, self, args, error, rawStack) {
  common.expectConstructorPost.call(undefined, result, contractFunction, condition, self, args, rawStack)
  should(result.error).equal(error)
}

// noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS,JSHint
const errorCases = [
  new Error('This is an error case'),
  undefined,
  null,
  1,
  0,
  'a string that is used as an error',
  '',
  true,
  false,
  new Date(),
  /foo/,
  function () {},
  // eslint-disable-next-line no-new-wrappers
  new Number(42),
  // eslint-disable-next-line no-new-wrappers
  new Boolean(false),
  // eslint-disable-next-line no-new-wrappers
  new String('lalala'),
  (function () {
    return arguments
  })(),
  {},
  { a: 1, b: 'b', c: {}, d: { d1: undefined, d2: 'd2', d3: { d31: 31 } } }
]

function expectDetailsPost (subject, result) {
  common.expectDetailsPost(subject, result)
  result.should.containEql(report.extensiveThrown(subject.error))
  if (subject.error && subject.error.stack) {
    result.should.containEql(subject.error.stack)
  }
}

const test = {
  errorCases: errorCases,
  expectInvariants: expectInvariants,
  expectConstructorPost: expectConstructorPost,
  expectDetailsPost: expectDetailsPost
}
Object.setPrototypeOf(test, common)

module.exports = test
