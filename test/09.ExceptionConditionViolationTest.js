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
const common = require('./ExceptionConditionViolationCommon')
const ExceptionConditionViolation = require('../lib/ExceptionConditionViolation')

// noinspection JSUnresolvedReference
const argsCases = common.argsCases.filter(a => Array.isArray(a))

describe('ExceptionConditionViolation', function () {
  describe('#prototype', function () {
    it('has a condition', function () {
      ExceptionConditionViolation.prototype.condition.should.be.a.Function()
      ExceptionConditionViolation.prototype.condition.should.not.throw()
    })
  })

  describe('#ExceptionConditionViolation()', function () {
    // noinspection JSUnresolvedReference
    common.selfCaseGenerators.forEach(selfCaseGenerator => {
      argsCases.forEach(args => {
        common.exceptionCaseGenerators.forEach(exceptionCaseGenerator => {
          const self = selfCaseGenerator()
          const exception = exceptionCaseGenerator()
          it('creates an instance with all toppings for ' + self + ' - ' + args + ' - ' + exception, function () {
            // noinspection JSUnresolvedReference
            const contractFunction = common.createCandidateContractFunction()
            const doctoredArgs = args.slice()
            doctoredArgs.push(exception)
            doctoredArgs.push(contractFunction.bind(self))
            // noinspection JSUnresolvedReference
            const creationResult = new ExceptionConditionViolation(
              contractFunction,
              common.conditionCase,
              self,
              doctoredArgs
            )
            // noinspection JSUnresolvedReference
            common.expectConstructorPost(creationResult, contractFunction, common.conditionCase, self, args, exception)
            common.expectInvariants(creationResult)
            testUtil.log('result.stack:\n%s', creationResult.stack)
          })
        })
      })
    })
  })

  // noinspection JSUnresolvedReference
  const cases = testUtil
    .x(common.conditionCases, [() => common.oneSelfCase], [() => common.oneArgsCase], common.exceptionCaseGenerators)
    .concat(
      testUtil.x(
        [common.conditionCase],
        common.selfCaseGenerators,
        [() => common.oneArgsCase],
        [() => new Error('test error')]
      )
    )
    .concat(testUtil.x([common.conditionCase], [() => common.oneSelfCase], argsCases, [() => new Error('test error')]))

  // noinspection JSUnresolvedReference
  common.generatePrototypeMethodsDescriptions(
    () => {
      // noinspection JSUnresolvedReference
      const contractFunction = common.createCandidateContractFunction()
      const self = null
      // noinspection JSUnresolvedReference
      const doctoredArgs = common.doctorArgs(common.argsCases[0], contractFunction.bind(self))
      // noinspection JSUnresolvedReference
      return new ExceptionConditionViolation(contractFunction, common.conditionCase, self, doctoredArgs)
    },
    cases.map(parameters => {
      const self = parameters[1]()
      return {
        subject: () => {
          // noinspection JSUnresolvedReference
          const contractFunction = common.createCandidateContractFunction()
          const doctoredArgs = common.doctorArgs(parameters[2], contractFunction.bind(self), parameters[3]())
          return new ExceptionConditionViolation(contractFunction, parameters[0], self, doctoredArgs)
        },
        description: parameters[0] + ' — ' + self + ' – ' + parameters[2] + ' – ' + parameters[3]
      }
    })
  )
})
