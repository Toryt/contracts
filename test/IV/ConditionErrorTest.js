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
const common = require('./ConditionErrorCommon')
const ConditionError = require('../../lib/IV/ConditionError')

describe('IV/ConditionError', function () {
  describe('#ConditionError()', function () {
    common.selfCaseGenerators.forEach(selfCaseGenerator => {
      common.argsCases.forEach(args => {
        const self = selfCaseGenerator()
        it('creates an instance with all toppings for ' + self + ' - ' + args, function () {
          const contractFunction = common.createCandidateContractFunction()
          const result = new ConditionError(contractFunction, common.conditionCase, self, args)
          common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args)
          common.expectInvariants(result)
          result.must.not.have.ownProperty('message')
          result.must.not.have.ownProperty('stack')
          testUtil.log('result.stack:\n%s', result.stack)
        })
      })
    })
  })

  common.generatePrototypeMethodsDescriptions(
    function () {
      return new ConditionError(common.conditionCase, null, common.argsCases[0])
    },
    testUtil
      .x(common.conditionCases, common.selfCaseGenerators, common.argsCases)
      .map(parameters => () => {
        const self = parameters[1]()
        return {
          subject: new ConditionError(
            common.createCandidateContractFunction(),
            parameters[0],
            self,
            parameters[2]
          ),
          description: parameters[0] + ' — ' + self + ' – ' + parameters[2]
        }
      })
  )
})