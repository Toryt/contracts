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
const common = require('./ContractCommon')
const Contract = require('../../src/IV/Contract')
const abstractContractCommon = require('./AbstractContractCommon')
const AbstractContract = require('../../src/IV/AbstractContract')

describe('IV/Contract', function () {
  describe('Contract', function () {
    it('has the expected properties', function () {
      Contract.must.have.ownProperty('prototype')
      // noinspection JSUnresolvedVariable
      abstractContractCommon.expectInvariants(Contract.prototype)
      // noinspection JSUnresolvedVariable
      Contract.prototype.implementation.must.be.a.function()
      Contract.must.have.ownProperty('root')
      // noinspection JSUnresolvedVariable
      Contract.root.must.equal(AbstractContract.root)
      Contract.must.have.ownProperty('isAContractFunction')
      // noinspection JSUnresolvedVariable
      Contract.isAContractFunction.must.equal(AbstractContract.isAContractFunction)
    })
  })

  describe('#Contract()', function () {
    // noinspection JSUnresolvedVariable
    common.constructorPreCases.forEach(pre => {
      // noinspection JSUnresolvedVariable
      common.constructorPostCases.forEach(post => {
        // noinspection JSUnresolvedVariable
        common.constructorExceptionCases.forEach(exception => {
          describe('works for pre: ' + pre + ', post: ' + post + ', exception: ' + exception, function () {
            const preConditions = pre()
            const postConditions = post()
            const exceptionConditions = exception()
            const result = new Contract({
              pre: preConditions,
              post: postConditions,
              exception: exceptionConditions
            })
            // noinspection JSUnresolvedFunction
            common.expectConstructorPost(preConditions, postConditions, exceptionConditions, result)
          })
        })
      })
    })
  })

  // noinspection JSUnresolvedVariable
  common.generatePrototypeMethodsDescriptions(
    function () { return new Contract({}) },
    testUtil
      .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
      .map(parameters => () => {
        const preConditions = parameters[0]()
        const postConditions = parameters[1]()
        const exceptionConditions = parameters[2]()
        return {
          subject: new Contract({
            pre: preConditions,
            post: postConditions,
            exception: exceptionConditions
          }),
          description: parameters.join(' - ')
        }
      }
      )
  )
})
