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

/* eslint-env mocha */

'use strict'

const testUtil = require('./_util/testUtil')
const stack = require('../lib/_private/stack')
const common = require('./PromiseContractCommon')
const PromiseContract = require('../lib/PromiseContract')
const abstractContractCommon = require('./AbstractContractCommon')
const AbstractContract = require('../lib/AbstractContract')
const Contract = require('../lib/Contract')

function expectConstructorPost(pre, post, exception, fastException, location, result) {
  // noinspection JSUnresolvedFunction
  common.expectConstructorPost(pre, post, exception, location, result)
  // noinspection JSUnresolvedFunction
  common.expectArrayPost(result, fastException, 'fastException', '_fastException')
}

describe('PromiseContract', function () {
  describe('PromiseContract', function () {
    it('has the expected properties', function () {
      PromiseContract.should.have.ownProperty('prototype')
      // noinspection JSUnresolvedVariable
      abstractContractCommon.expectInvariants(PromiseContract.prototype)
      // noinspection JSUnresolvedVariable
      PromiseContract.prototype.implementation.should.be.a.Function()
      PromiseContract.should.have.ownProperty('root')
      // noinspection JSUnresolvedVariable
      PromiseContract.root.should.equal(AbstractContract.root)
      PromiseContract.should.have.ownProperty('isAContractFunction')
      // noinspection JSUnresolvedVariable
      PromiseContract.isAContractFunction.should.equal(AbstractContract.isAContractFunction)
      PromiseContract.falseCondition.should.equal(AbstractContract.falseCondition)
      PromiseContract.mustNotHappen.should.equal(AbstractContract.mustNotHappen)
      PromiseContract.outcome.should.equal(AbstractContract.outcome)
      PromiseContract.callee.should.equal(AbstractContract.callee)
    })
  })

  describe('#PromiseContract()', function () {
    // noinspection JSUnresolvedVariable
    common.constructorPreCases.forEach(pre => {
      // noinspection JSUnresolvedVariable
      common.constructorPostCases.forEach(post => {
        // noinspection JSUnresolvedVariable
        common.constructorExceptionCases.forEach(exception => {
          // noinspection JSUnresolvedVariable
          common.constructorExceptionCases.forEach(fastException => {
            it(
              'works for pre: ' +
                pre +
                ', post: ' +
                post +
                ', exception: ' +
                exception +
                ', fastException: ' +
                fastException,
              function () {
                const preConditions = pre()
                const postConditions = post()
                const exceptionConditions = exception()
                const fastExceptionConditions = fastException()
                const result = new PromiseContract({
                  pre: preConditions,
                  post: postConditions,
                  fastException: fastExceptionConditions,
                  exception: exceptionConditions
                })
                // noinspection JSUnresolvedFunction
                expectConstructorPost(
                  preConditions,
                  postConditions,
                  exceptionConditions,
                  fastExceptionConditions,
                  stack.location(),
                  result
                )
              }
            )
          })
        })
      })
    })
  })

  common.generateConstructorMethodsDescriptions(PromiseContract)

  // noinspection JSUnresolvedVariable
  common.generatePrototypeMethodsDescriptions(
    () => new PromiseContract({}),
    testUtil
      .x(
        common.constructorPreCases,
        common.constructorPostCases,
        common.constructorExceptionCases,
        common.constructorExceptionCases
      )
      .map(parameters => ({
        subject: () =>
          new PromiseContract({
            pre: parameters[0](),
            post: parameters[1](),
            fastException: parameters[2](),
            exception: parameters[3]()
          }),
        description: parameters.join(' - ')
      }))
  )

  describe('@isAContractFunction specific', function () {
    it('does not accept a Contract', function () {
      const contract = new Contract({})
      const contractFunction = contract.implementation(() => {})
      const result = PromiseContract.isAContractFunction(contractFunction)
      result.should.be.false()
    })
  })
})
