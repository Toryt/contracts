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
const common = require('./PromiseContractCommon')
const PromiseContract = require('../../lib/IV/PromiseContract')
const abstractContractCommon = require('./AbstractContractCommon')
const AbstractContract = require('../../lib/IV/AbstractContract')

function expectConstructorPost (pre, post, exception, fastException, location, result) {
  // noinspection JSUnresolvedFunction
  common.expectConstructorPost(pre, post, exception, location, result)
  // noinspection JSUnresolvedFunction
  common.expectArrayPost(result, fastException, 'fastException', '_fastException')
}

describe('IV/PromiseContract', function () {
  describe('PromiseContract', function () {
    it('has the expected properties', function () {
      PromiseContract.must.have.ownProperty('prototype')
      // noinspection JSUnresolvedVariable
      abstractContractCommon.expectInvariants(PromiseContract.prototype)
      // noinspection JSUnresolvedVariable
      PromiseContract.prototype.implementation.must.be.a.function()
      PromiseContract.must.have.ownProperty('root')
      // noinspection JSUnresolvedVariable
      PromiseContract.root.must.equal(AbstractContract.root)
      PromiseContract.must.have.ownProperty('isAContractFunction')
      // noinspection JSUnresolvedVariable
      PromiseContract.isAContractFunction.must.equal(AbstractContract.isAContractFunction)
      PromiseContract.falseCondition.must.equal(AbstractContract.falseCondition)
      PromiseContract.mustNotHappen.must.equal(AbstractContract.mustNotHappen)
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
            it('works for pre: ' + pre + ', post: ' + post + ', exception: ' + exception + ', fastException: ' + fastException, function () {
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
              expectConstructorPost(preConditions, postConditions, exceptionConditions, fastExceptionConditions, stack.location(), result)
            })
          })
        })
      })
    })
  })

  // noinspection JSUnresolvedVariable
  common.generatePrototypeMethodsDescriptions(
    () => new PromiseContract({}),
    testUtil
      .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases, common.constructorExceptionCases)
      .map(parameters => ({
        subject: () => new PromiseContract({
          pre: parameters[0](),
          post: parameters[1](),
          fastException: parameters[2](),
          exception: parameters[3]()
        }),
        description: parameters.join(' - ')
      }))
  )
})