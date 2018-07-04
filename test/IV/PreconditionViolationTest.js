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
const common = require('./PreconditionViolationCommon')
const PreconditionViolation = require('../../src/IV/PreconditionViolation')
describe('IV/PreconditionViolation', function () {
  describe('#prototype', function () {
    it('has a condition', function () {
      // noinspection JSUnresolvedVariable
      PreconditionViolation.prototype.condition.must.be.a.function()
      // noinspection JSUnresolvedVariable
      PreconditionViolation.prototype.condition.must.not.throw()
    })
  })

  describe('#PreconditionViolation()', function () {
    // noinspection JSUnresolvedVariable
    common.selfCaseGenerators.forEach(selfCaseGenerator => {
      // noinspection JSUnresolvedVariable
      common.argsCases.forEach(args => {
        const self = selfCaseGenerator()
        it('creates an instance with all toppings for ' + self + ' - ' + args, function () {
          // noinspection JSUnresolvedFunction
          const contractFunction = common.createCandidateContractFunction()
          // noinspection JSUnresolvedVariable
          const result = new PreconditionViolation(contractFunction, common.conditionCase, self, args)
          // noinspection JSUnresolvedFunction, JSUnresolvedVariable
          common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args)
          common.expectInvariants(result)
          testUtil.log('result.stack:\n%s', result.stack)
        })
      })
    })
  })

  // noinspection JSUnresolvedVariable, JSUnresolvedFunction
  common.generatePrototypeMethodsDescriptions(
    function () {
      // noinspection JSUnresolvedFunction, JSUnresolvedVariable
      return new PreconditionViolation(
        common.createCandidateContractFunction(),
        common.conditionCase,
        null,
        common.argsCases[0]
      )
    },
    testUtil
      .x(common.conditionCases, common.selfCaseGenerators, common.argsCases)
      .map(function (parameters) {
        return function () {
          const self = parameters[1]()
          // noinspection JSUnresolvedFunction
          return {
            subject: new PreconditionViolation(
              common.createCandidateContractFunction(),
              parameters[0],
              self,
              parameters[2]
            ),
            description: parameters[0] + ' — ' + self + ' – ' + parameters[2]
          }
        }
      })
  )
})