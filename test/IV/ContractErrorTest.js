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

const ContractError = require('../../src/IV/ContractError')
const testUtil = require('../_util/testUtil')
const util = require('../../src/_private/util')
const common = require('./ContractErrorCommon')

describe('III/ContractError', function () {
  describe('#ContractError()', function () {
    it('creates an instance with all toppings', function () {
      const result = new ContractError()
      common.expectConstructorPost(result, ContractError.message)
      common.expectInvariants(result)
      result.must.not.have.ownProperty('message')
      testUtil.log('result.stack:\n%s', result.stack)
    })
    it('can get a message set', function () {
      const result = new ContractError()
      const message = 'another message'
      util.defineFrozenDerivedProperty(result, 'message', function () { return message })
      result.must.have.ownProperty('message')
      result.message.must.equal(message)
      common.expectInvariants(result)
    })
  })

  common.generatePrototypeMethodsDescriptions(
    function () {
      return new ContractError()
    },
    [{
      subject: new ContractError(),
      description: 'a contract error'
    }]
  )
})
