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
const ExceptionConditionViolation = require('../lib/ExceptionConditionViolation')
const should = require('should')

function expectInvariants(subject) {
  subject.should.be.an.instanceof(ExceptionConditionViolation)
  common.expectInvariants(subject)
  testUtil.expectOwnFrozenProperty(subject, 'exception')
  subject.stack.should.containEql(report.extensiveThrown(subject.exception))
}

function expectConstructorPost(executionResult, contractFunction, condition, self, args, exception) {
  common.expectConstructorPost.apply(undefined, arguments)
  should(executionResult.exception).equal(exception)
}

// noinspection ParameterNamingConventionJS
function expectProperties(exception, Type, contractFunction, condition, self, args, thrownException) {
  common.expectProperties.apply(undefined, arguments)
  exception.exception.should.equal(thrownException)
}

function expectDetailsPost(subject, result) {
  // noinspection JSUnresolvedFunction
  common.expectDetailsPost(subject, result)
  result.should.containEql(subject.exception)
}

const exceptionCaseGenerators = testUtil.anyCasesGenerators('exception')

function doctorArgs(args, boundContractFunction, exception) {
  const doctored = Array.prototype.slice.call(args)
  const e = arguments.length >= 3 ? exception : new Error('Dummy exception for ExceptionConditionViolation')
  doctored.push(e) // an exception
  doctored.push(boundContractFunction)
  return doctored
}

const test = {
  exceptionCaseGenerators,
  expectInvariants,
  expectConstructorPost,
  expectProperties,
  expectDetailsPost,
  doctorArgs
}
Object.setPrototypeOf(test, common)

module.exports = test
