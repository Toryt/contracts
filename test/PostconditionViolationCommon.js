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

const testUtil = require('./_util/testUtil')
const report = require('../lib/_private/report')
const common = require('./ConditionViolationCommon')
const PostconditionViolation = require('../lib/PostconditionViolation')
const should = require('should')

function expectInvariants(subject) {
  subject.should.be.an.instanceof(PostconditionViolation)
  common.expectInvariants(subject)
  testUtil.expectOwnFrozenProperty(subject, 'result')
  subject.stack.should.containEql(report.value(subject.result))
}

function expectConstructorPost(executionResult, contractFunction, condition, self, args, result) {
  common.expectConstructorPost.apply(undefined, arguments)
  should(executionResult.result).equal(result)
}

function expectDetailsPost(subject, result) {
  //noinspection JSUnresolvedReference
  common.expectDetailsPost(subject, result)
  result.should.containEql(subject.result)
}

// noinspection ParameterNamingConventionJS
function expectProperties(exception, Type, contractFunction, condition, self, args, result) {
  common.expectProperties.apply(undefined, arguments)
  exception.result.should.equal(result)
}

const resultCaseGenerators = testUtil.anyCasesGenerators('result')

function doctorArgs(args, boundContractFunction, result) {
  const doctored = Array.prototype.slice.call(args)
  const r = arguments.length >= 3 ? result : 42
  doctored.push(r) // a result
  doctored.push(boundContractFunction)
  return doctored
}

const test = {
  resultCaseGenerators,
  expectInvariants,
  expectConstructorPost,
  expectProperties,
  expectDetailsPost,
  doctorArgs
}
Object.setPrototypeOf(test, common)

module.exports = test
