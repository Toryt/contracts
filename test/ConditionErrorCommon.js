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
const property = require('../lib/_private/property')
const common = require('./ContractErrorCommon')
const ConditionError = require('../lib/ConditionError')
const AbstractContract = require('../lib/AbstractContract')
const abstractContractCommon = require('./AbstractContractCommon')
const should = require('should')
const stackEOL = require('../lib/_private/eol').stack

const conditionCase = function () {
  return 'This simulates a condition'
}

function generateMultiLineAnonFunction() {
  return function () {
    let x = 'This is a multi-line function'
    x += 'The intention of this test'
    x += 'is to verify'
    x += 'whether we get an acceptable'
    x += 'is to shortened version of this'
    x += 'as a concise representation'
    x += 'this function should have no name'
    return x
  }
}

const conditionCases = [conditionCase, generateMultiLineAnonFunction()]

function functionWithAName() {}
property.setAndFreeze(functionWithAName, 'name', '  This is a name  ') // trim
conditionCases.push(functionWithAName)
const other = generateMultiLineAnonFunction()
property.setAndFreeze(
  other,
  'name',
  `   This is a multi-line name
The intention of this test
is to verify

whether we get an acceptable
is to shortened version of this
as a concise representation
this function should have a name   ` // trim
)
conditionCases.push(other)

const selfCaseGenerators = testUtil.anyCasesGenerators('self')
const oneSelfCase = selfCaseGenerators[selfCaseGenerators.length - 1]()

let argsCases = [[], testUtil.anyCasesGenerators('arguments element').map(g => g())]
argsCases = argsCases.concat(
  argsCases.map(c => {
    function asArgs(args) {
      return arguments
    }

    return asArgs.apply(undefined, c)
  })
)
const oneArgsCase = argsCases[argsCases.length - 1]

function expectInvariants(subject) {
  subject.should.be.an.instanceof(ConditionError)
  common.expectInvariants(subject)
  testUtil.expectOwnFrozenProperty(subject, 'contractFunction')
  //noinspection JSUnresolvedReference
  AbstractContract.isAGeneralContractFunction(subject.contractFunction).should.be.true()
  subject.condition.should.be.a.Function()
  testUtil.expectOwnFrozenProperty(subject, 'condition')
  testUtil.expectOwnFrozenProperty(subject, 'self')
  testUtil.expectOwnFrozenProperty(subject, '_args')
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'args', '_args')
  testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, 'message')
  testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, 'stack')
  //noinspection JSUnresolvedReference
  subject.message.should.containEql(subject.contractFunction.name)
  subject.message.should.containEql(report.conciseCondition('condition', subject.condition))
}

// noinspection ParameterNamingConventionJS
function expectProperties(exception, Type, contractFunction, condition, self, args) {
  exception.should.be.an.Error()
  exception.should.be.instanceof(Type)
  //noinspection JSUnresolvedReference
  exception.contractFunction.should.equal(contractFunction)
  exception.condition.should.equal(condition)
  should(exception.self).equal(self)
  exception.args.should.eql(Array.prototype.slice.call(args))
}

function expectConstructorPost(result, contractFunction, condition, self, args, rawStack) {
  common.expectConstructorPost(result, result.message, rawStack)
  expectProperties(result, ConditionError, contractFunction, condition, self, args)
  Object.isExtensible(result).should.be.true()
}

function expectDetailsPost(subject, result) {
  result.should.be.a.String()
  result.should.containEql(report.conciseCondition('', subject.condition))
  //noinspection JSUnresolvedReference
  result.should.containEql(stackEOL + subject.contractFunction.contract.location)
  result.should.containEql(report.value(subject.self))
  Array.prototype.forEach.call(subject.args, arg => {
    result.should.containEql(report.value(arg))
  })
}

// noinspection FunctionNamingConventionJS
function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
  common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators)

  const self = this

  describe('#getDetails()', function () {
    allSubjectGenerators.forEach(generator => {
      it('returns the details as expected for ' + generator.description, function () {
        const subject = generator.subject()
        //noinspection JSUnresolvedReference
        const result = subject.getDetails()
        testUtil.log(result)
        self.expectDetailsPost(subject, result)
        self.expectInvariants(subject)
      })
    })
  })
}

const test = {
  selfCaseGenerators,
  argsCases,
  conditionCase,
  conditionCases,
  expectProperties,
  expectConstructorPost,
  expectDetailsPost,
  expectInvariants,
  generatePrototypeMethodsDescriptions,
  createCandidateContractFunction: abstractContractCommon.createCandidateContractFunction,
  oneSelfCase,
  oneArgsCase
}
Object.setPrototypeOf(test, common)

module.exports = test
