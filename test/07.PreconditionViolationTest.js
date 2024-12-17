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
const common = require('./PreconditionViolationCommon')
const PreconditionViolation = require('../lib/PreconditionViolation')

describe('PreconditionViolation', function () {
  describe('#prototype', function () {
    it('has a condition', function () {
      PreconditionViolation.prototype.condition.should.be.a.Function()
      PreconditionViolation.prototype.condition.should.not.throw()
    })
  })

  describe('#PreconditionViolation()', function () {
    // noinspection JSUnresolvedVariable
    common.selfCaseGenerators.forEach(selfCaseGenerator => {
      // noinspection JSUnresolvedVariable
      common.argsCases.forEach(args => {
        const self = selfCaseGenerator()
        it('creates an instance with all toppings for ' + self + ' - ' + args, function () {
          //noinspection JSUnresolvedReference
          const contractFunction = common.createCandidateContractFunction()
          // noinspection JSUnresolvedReference
          const result = new PreconditionViolation(contractFunction, common.conditionCase, self, args)
          // noinspection JSUnresolvedReference
          common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args)
          common.expectInvariants(result)
          //noinspection JSUnresolvedReference
          testUtil.log('result.stack:\n%s', result.stack)
        })
      })
    })
  })

  // noinspection JSUnresolvedReference
  common.generatePrototypeMethodsDescriptions(
    () =>
      new PreconditionViolation(
        common.createCandidateContractFunction(),
        common.conditionCase,
        null,
        common.argsCases[0]
      ),
    testUtil.x(common.conditionCases, common.selfCaseGenerators, common.argsCases).map(parameters => {
      const self = parameters[1]()
      // noinspection JSUnresolvedReference
      return {
        subject: () =>
          new PreconditionViolation(common.createCandidateContractFunction(), parameters[0], self, parameters[2]),
        description: parameters[0] + ' — ' + self + ' – ' + parameters[2]
      }
    })
  )
})
