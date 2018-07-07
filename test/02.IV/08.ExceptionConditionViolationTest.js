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
const util = require('../../lib/_private/util')
const common = require('./ExceptionConditionViolationCommon')
const ExceptionConditionViolation = require('../../lib/IV/ExceptionConditionViolation')

// noinspection JSUnresolvedVariable
const argsCases = common.argsCases.filter(a => util.typeOf(a) === 'array')

describe('IV/ExceptionConditionViolation', function () {
  describe('#prototype', function () {
    it('has a condition', function () {
      // noinspection JSUnresolvedVariable
      ExceptionConditionViolation.prototype.condition.must.be.a.function()
      // noinspection JSUnresolvedVariable
      ExceptionConditionViolation.prototype.condition.must.not.throw()
    })
  })

  describe('#ExceptionConditionViolation()', function () {
    // noinspection JSUnresolvedVariable
    common.selfCaseGenerators.forEach(selfCaseGenerator => {
      argsCases.forEach(args => {
        common.exceptionCaseGenerators.forEach(exceptionCaseGenerator => {
          const self = selfCaseGenerator()
          const exception = exceptionCaseGenerator()
          it('creates an instance with all toppings for ' + self + ' - ' + args + ' - ' + exception, function () {
            // noinspection JSUnresolvedFunction
            const contractFunction = common.createCandidateContractFunction()
            const doctoredArgs = args.slice()
            doctoredArgs.push(exception)
            doctoredArgs.push(contractFunction.bind(self))
            // noinspection JSUnresolvedVariable
            const creationResult = new ExceptionConditionViolation(
              contractFunction,
              common.conditionCase,
              self,
              doctoredArgs
            )
            // noinspection JSUnresolvedVariable
            common.expectConstructorPost(
              creationResult,
              contractFunction,
              common.conditionCase,
              self,
              args,
              exception
            )
            common.expectInvariants(creationResult)
            testUtil.log('result.stack:\n%s', creationResult.stack)
          })
        })
      })
    })
  })

  // noinspection JSUnresolvedFunction, JSUnresolvedVariable
  common.generatePrototypeMethodsDescriptions(
    function () {
      // noinspection JSUnresolvedFunction
      const contractFunction = common.createCandidateContractFunction()
      const self = null
      // noinspection JSUnresolvedVariable
      const doctoredArgs = common.doctorArgs(common.argsCases[0], contractFunction.bind(self))
      // noinspection JSUnresolvedVariable
      return new ExceptionConditionViolation(contractFunction, common.conditionCase, self, doctoredArgs)
    },
    testUtil
      .x(common.conditionCases, common.selfCaseGenerators, argsCases, common.exceptionCaseGenerators)
      .map(parameters => () => {
        // noinspection JSUnresolvedFunction
        const contractFunction = common.createCandidateContractFunction()
        const self = parameters[1]()
        const doctoredArgs = common.doctorArgs(parameters[2], contractFunction.bind(self), parameters[3]())
        return {
          subject: new ExceptionConditionViolation(contractFunction, parameters[0], self, doctoredArgs),
          description: parameters[0] + ' — ' + self + ' – ' + parameters[2] + ' – ' + parameters[3]
        }
      }
      )
  )
})