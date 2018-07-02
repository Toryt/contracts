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

const testUtil = require('../_util/testUtil')
const util = require('../../src/_private/util')
const common = require('./ContractErrorCommon')
const ConditionError = require('../../src/IV/ConditionError')
const AbstractContract = require('../../src/IV/AbstractContract')
const abstractContractCommon = require('./AbstractContractCommon')

const conditionCase = function () { return 'This simulates a condition' }

function generateMultiLineAnonFunction () {
  return function () {
    let x = 'This is a multi-line function'
    x += 'The intention of this test'
    x += 'is to verify'
    x += 'whether we get an acceptable'
    x += 'is to shortened version of this'
    x += 'as a concise representation'
    x += 'this function should have no name'
    x += 'and no display name'
    return x
  }
}

const conditionCases = [conditionCase, generateMultiLineAnonFunction()]

function functionWithADisplayName () {}

functionWithADisplayName.displayName = 'This is a display name'
conditionCases.push(functionWithADisplayName)
const other = generateMultiLineAnonFunction()
other.displayName = 'This is a multi-line display name'
other.displayName += 'The intention of this test'
other.displayName += 'is to verify'
other.displayName += 'whether we get an acceptable'
other.displayName += 'is to shortened version of this'
other.displayName += 'as a concise representation'
other.displayName += 'this function should have a display name'
conditionCases.push(other)

const selfCaseGenerators = testUtil.anyCasesGenerators('self')

let argsCases = [
  [],
  testUtil.anyCasesGenerators('arguments element').map(g => g())
]
argsCases = argsCases.concat(argsCases.map(c => {
  function asArgs (args) {
    return arguments
  }

  return asArgs.apply(undefined, c)
}))

function expectInvariants (subject) {
  subject.must.be.an.instanceof(ConditionError)
  common.expectInvariants(subject)
  testUtil.expectOwnFrozenProperty(subject, 'contractFunction')
  subject.must.have.property('contractFunction')
  AbstractContract.isAGeneralContractFunction(subject).must.be.true()
  // noinspection JSUnresolvedVariable
  subject.condition.must.be.a.function()
  testUtil.expectOwnFrozenProperty(subject, 'condition')
  testUtil.expectOwnFrozenProperty(subject, 'self')
  testUtil.expectOwnFrozenProperty(subject, '_args')
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'args', '_args')
  testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, 'message')
  testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, 'stack')
  // noinspection JSUnresolvedVariable
  subject.message.must.match(subject.contractFunction.displayName)
  // noinspection JSUnresolvedVariable
  subject.message.must.match(util.conciseConditionRepresentation('condition', subject.condition))
}

// noinspection ParameterNamingConventionJS
function expectProperties (exception, Type, contractFunction, condition, self, args) {
  exception.must.be.an.error(Type)
  // noinspection JSUnresolvedVariable
  exception.contractFunction.must.equal(contractFunction)
  // noinspection JSUnresolvedVariable
  exception.condition.must.equal(condition)
  exception.self.must.equal(self)
  exception.args.must.eql(Array.prototype.slice.call(args))
}

function expectConstructorPost (result, contractFunction, condition, self, args) {
  common.expectConstructorPost(result, result.message)
  expectProperties(result, ConditionError, contractFunction, condition, self, args)
  Object.isExtensible(result).must.be.true()
}

function expectDetailsPost (subject, result) {
  result.must.be.a.string()
  // noinspection JSUnresolvedVariable
  result.must.match('' + subject.condition)
  // noinspection JSUnresolvedVariable
  result.must.match('' + util.eol + subject.contractFunction.contract.location)
  result.must.match('' + subject.self)
  Array.prototype.forEach.call(
    subject.args,
    arg => { result.must.match('' + arg) }
  )
}

// noinspection FunctionNamingConventionJS
function generatePrototypeMethodsDescriptions (oneSubjectGenerator, allSubjectGenerators) {
  common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators)

  const self = this

  describe('#getDetails()', function () {
    allSubjectGenerators.forEach(generator => {
      const testCase = generator()
      it('returns the details as expected for ' + testCase.description, function () {
        // noinspection JSUnresolvedFunction
        const result = testCase.subject.getDetails()
        self.expectDetailsPost(testCase.subject, result)
        self.expectInvariants(testCase.subject)
      })
    })
  })
}

const test = {
  selfCaseGenerators: selfCaseGenerators,
  argsCases: argsCases,
  conditionCase: conditionCase,
  conditionCases: conditionCases,
  expectProperties: expectProperties,
  expectConstructorPost: expectConstructorPost,
  expectDetailsPost: expectDetailsPost,
  expectInvariants: expectInvariants,
  generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions,
  createCandidateContractFunction: abstractContractCommon.createCandidateContractFunction
}
Object.setPrototypeOf(test, common)

module.exports = test
