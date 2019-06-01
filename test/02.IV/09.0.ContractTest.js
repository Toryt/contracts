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
const stack = require('../../lib/_private/stack')
const common = require('./ContractCommon')
const Contract = require('../../lib/IV/Contract')
const abstractContractCommon = require('./AbstractContractCommon')
const AbstractContract = require('../../lib/IV/AbstractContract')
const PromiseContract = require('../../lib/IV/PromiseContract')

describe('IV/Contract', function () {
  describe('Contract', function () {
    it('has the expected properties', function () {
      Contract.should.have.ownProperty('prototype')
      // noinspection JSUnresolvedVariable
      abstractContractCommon.expectInvariants(Contract.prototype)
      // noinspection JSUnresolvedVariable
      Contract.prototype.implementation.should.be.a.Function()
      Contract.should.have.ownProperty('root')
      // noinspection JSUnresolvedVariable
      Contract.root.should.equal(AbstractContract.root)
      Contract.should.have.ownProperty('isAContractFunction')
      // noinspection JSUnresolvedVariable
      Contract.isAContractFunction.should.equal(AbstractContract.isAContractFunction)
      Contract.falseCondition.should.equal(AbstractContract.falseCondition)
      Contract.mustNotHappen.should.equal(AbstractContract.mustNotHappen)
      Contract.outcome.should.equal(AbstractContract.outcome)
      Contract.callee.should.equal(AbstractContract.callee)
      Contract.Promise.should.equal(PromiseContract)
    })
  })

  describe('#Contract()', function () {
    // noinspection JSUnresolvedVariable
    common.constructorPreCases.forEach(pre => {
      // noinspection JSUnresolvedVariable
      common.constructorPostCases.forEach(post => {
        // noinspection JSUnresolvedVariable
        common.constructorExceptionCases.forEach(exception => {
          it('works for pre: ' + pre + ', post: ' + post + ', exception: ' + exception, function () {
            const preConditions = pre()
            const postConditions = post()
            const exceptionConditions = exception()
            const result = new Contract({
              pre: preConditions,
              post: postConditions,
              exception: exceptionConditions
            })
            // noinspection JSUnresolvedFunction
            common.expectConstructorPost(preConditions, postConditions, exceptionConditions, stack.location(), result)
          })
        })
      })
    })
  })

  common.generateConstructorMethodsDescriptions(Contract)

  // noinspection JSUnresolvedVariable
  common.generatePrototypeMethodsDescriptions(
    () => new Contract({}),
    testUtil
      .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
      .map(parameters => ({
        subject: () =>
          new Contract({
            pre: parameters[0](),
            post: parameters[1](),
            exception: parameters[2]()
          }),
        description: parameters.join(' - ')
      }))
  )

  describe('@isAContractFunction specific', function () {
    it('does not accept a PromiseContract', function () {
      const contract = new PromiseContract({})
      const contractFunction = contract.implementation(() => {})
      const result = Contract.isAContractFunction(contractFunction)
      result.must.be.false()
    })
  })
})
