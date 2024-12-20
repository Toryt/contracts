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
const common = require('./ContractCommon')
const Contract = require('../lib/Contract')
const abstractContractCommon = require('./AbstractContractCommon')
const AbstractContract = require('../lib/AbstractContract')
const PromiseContract = require('../lib/PromiseContract')

describe('Contract', function () {
  describe('Contract', function () {
    it('has the expected properties', function () {
      Contract.should.have.ownProperty('prototype')
      abstractContractCommon.expectInvariants(Contract.prototype)
      Contract.prototype.implementation.should.be.a.Function()
      Contract.should.have.ownProperty('root')
      Contract.root.should.equal(AbstractContract.root)
      Contract.should.have.ownProperty('isAContractFunction')
      Contract.isAContractFunction.should.equal(AbstractContract.isAContractFunction)
      Contract.falseCondition.should.equal(AbstractContract.falseCondition)
      Contract.mustNotHappen.should.equal(AbstractContract.mustNotHappen)
      Contract.outcome.should.equal(AbstractContract.outcome)
      Contract.callee.should.equal(AbstractContract.callee)
      Contract.Promise.should.equal(PromiseContract)
    })
  })

  describe('#Contract()', function () {
    // noinspection JSUnresolvedReference
    common.constructorPreCases.forEach(pre => {
      // noinspection JSUnresolvedReference
      common.constructorPostCases.forEach(post => {
        // noinspection JSUnresolvedReference
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
            // noinspection JSUnresolvedReference
            common.expectConstructorPost(preConditions, postConditions, exceptionConditions, stack.location(), result)
          })
        })
      })
    })
  })

  // noinspection JSUnresolvedReference
  common.generateConstructorMethodsDescriptions(Contract)

  // noinspection JSUnresolvedReference
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
    it('does reject a PromiseContract', function () {
      const contract = new PromiseContract({})
      const contractFunction = contract.implementation(() => {})
      const result = Contract.isAContractFunction(contractFunction)
      result.should.be.false()
    })
  })
})
