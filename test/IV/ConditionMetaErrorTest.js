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
const common = require('./ConditionMetaErrorCommon')
const ConditionMetaError = require('../../lib/IV/ConditionMetaError')

describe('IV/ConditionMetaError', function () {
  describe('#prototype', function () {
    it('has a condition', function () {
      // noinspection JSUnresolvedVariable
      ConditionMetaError.prototype.condition.must.be.a.function()
      // noinspection JSUnresolvedVariable
      ConditionMetaError.prototype.condition.must.not.throw()
    })
  })

  describe('#ConditionMetaError()', function () {
    // noinspection JSUnresolvedVariable
    common.selfCaseGenerators.forEach(selfCaseGenerator => {
      // noinspection JSUnresolvedVariable
      common.argsCases.forEach(args => {
        common.errorCases.forEach(error => {
          const self = selfCaseGenerator()
          it('creates an instance with all toppings for ' + self + ' - ' + args + ' - ' + error, function () {
            // noinspection JSUnresolvedFunction
            const contractFunction = common.createCandidateContractFunction()
            // noinspection JSUnresolvedVariable
            const result = new ConditionMetaError(contractFunction, common.conditionCase, self, args, error)
            // noinspection JSUnresolvedVariable
            common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args, error)
            common.expectInvariants(result)
            result.must.not.have.ownProperty('message')
            result.must.not.have.ownProperty('stack')
            // noinspection JSUnresolvedVariable
            testUtil.log('result.stack:\n%s', result.stack)
          })
        })
      })
    })
  })

  // noinspection JSUnresolvedVariable, JSUnresolvedFunction
  common.generatePrototypeMethodsDescriptions(
    function () {
      // noinspection JSUnresolvedVariable
      return new ConditionMetaError(
        common.conditionCase,
        null,
        common.argsCases[0],
        common.errorCases[0]
      )
    },
    testUtil
      .x(common.conditionCases, common.selfCaseGenerators, common.argsCases, common.errorCases)
      .map(function (parameters) {
        return function () {
          const self = parameters[1]()
          // noinspection JSUnresolvedFunction
          return {
            subject: new ConditionMetaError(
              common.createCandidateContractFunction(),
              parameters[0],
              self,
              parameters[2],
              parameters[3]
            ),
            description: parameters[0] + ' — ' + self + ' – ' + parameters[2] + ' – ' + parameters[3]
          }
        }
      })
  )
})
