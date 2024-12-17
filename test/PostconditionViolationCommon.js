/*
 Copyright 2016 - 2020 by Jan Dockx

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

const testUtil = require('./_util/testUtil')
const report = require('../lib/_private/report')
const common = require('./ConditionViolationCommon')
const PostconditionViolation = require('../lib/PostconditionViolation')
const should = require('should')

function expectInvariants(subject) {
  subject.should.be.an.instanceof(PostconditionViolation)
  common.expectInvariants(subject)
  testUtil.expectOwnFrozenProperty(subject, 'result')
  // noinspection JSUnresolvedVariable
  subject.stack.should.containEql(report.value(subject.result))
}

function expectConstructorPost(executionResult, contractFunction, condition, self, args, result) {
  // noinspection JSUnresolvedVariable
  common.expectConstructorPost.apply(undefined, arguments)
  // noinspection JSUnresolvedVariable
  should(executionResult.result).equal(result)
}

function expectDetailsPost(subject, result) {
  // noinspection JSUnresolvedFunction
  common.expectDetailsPost(subject, result)
  // noinspection JSUnresolvedVariable
  result.should.containEql(subject.result)
}

// noinspection ParameterNamingConventionJS
function expectProperties(exception, Type, contractFunction, condition, self, args, result) {
  common.expectProperties.apply(undefined, arguments)
  // noinspection JSUnresolvedVariable
  exception.result.should.equal(result)
}

const resultCaseGenerators = testUtil.anyCasesGenerators('result')

function doctorArgs(args, boundContractFunction, result) {
  const doctored = Array.prototype.slice.call(args)
  // noinspection MagicNumberJS
  const r = arguments.length >= 3 ? result : 42
  doctored.push(r) // a result
  doctored.push(boundContractFunction)
  return doctored
}

const test = {
  resultCaseGenerators: resultCaseGenerators,
  expectInvariants: expectInvariants,
  expectConstructorPost: expectConstructorPost,
  expectProperties: expectProperties,
  expectDetailsPost: expectDetailsPost,
  doctorArgs: doctorArgs
}
Object.setPrototypeOf(test, common)

module.exports = test
