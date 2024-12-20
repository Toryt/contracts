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
const stack = require('../lib/_private/stack')
const common = require('./ConditionMetaErrorCommon')
const ConditionMetaError = require('../lib/ConditionMetaError')

describe('ConditionMetaError', function () {
  describe('#prototype', function () {
    it('has a condition', function () {
      ConditionMetaError.prototype.condition.should.be.a.Function()
      ConditionMetaError.prototype.condition.should.not.throw()
    })
  })

  describe('#ConditionMetaError()', function () {
    common.errorCases.forEach(error => {
      // noinspection JSUnresolvedReference
      it(
        'creates an instance with all toppings for ' + common.oneSelfCase + ' - ' + common.oneArgsCase + ' - ' + error,
        function () {
          // noinspection JSUnresolvedFunction
          const contractFunction = common.createCandidateContractFunction()
          const rawStack = stack.raw()
          // noinspection JSUnresolvedVariable
          const result = new ConditionMetaError(
            contractFunction,
            common.conditionCase,
            common.oneSelfCase,
            common.oneArgsCase,
            error,
            rawStack
          )
          // noinspection JSUnresolvedVariable
          common.expectConstructorPost(
            result,
            contractFunction,
            common.conditionCase,
            common.oneSelfCase,
            common.oneArgsCase,
            error,
            rawStack
          )
          common.expectInvariants(result)
          result.should.not.have.ownProperty('message')
          result.should.not.have.ownProperty('stack')
          testUtil.log('result.stack:\n%s', result.stack)
        }
      )
    })
  })

  // noinspection JSUnresolvedVariable
  common.generatePrototypeMethodsDescriptions(
    () => new ConditionMetaError(common.conditionCase, null, common.oneArgsCase, common.errorCases[0], stack.raw()),
    common.errorCases.map(errorCase => {
      // noinspection JSUnresolvedVariable
      return {
        subject: () =>
          new ConditionMetaError(
            common.createCandidateContractFunction(),
            common.conditionCase,
            common.oneSelfCase,
            common.oneArgsCase,
            errorCase,
            stack.raw()
          ),
        description: common.conditionCase + ' — ' + common.oneSelfCase + ' – ' + common.oneArgsCase + ' – ' + errorCase
      }
    })
  )
})
