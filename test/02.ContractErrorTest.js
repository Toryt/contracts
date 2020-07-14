/*
 Copyright 2016 - 2020 by Jan Dockx

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

const ContractError = require('../lib/ContractError')
const testUtil = require('./_util/testUtil')
const property = require('../lib/_private/property')
const stack = require('../lib/_private/stack')
const common = require('./ContractErrorCommon')

describe('ContractError', function () {
  describe('#ContractError()', function () {
    it('creates an instance with all toppings', function () {
      const rawStack = stack.raw()
      const result = new ContractError(rawStack)
      testUtil.log('result:\n%s', result)
      testUtil.log('result.toString():\n%s', result.toString())
      common.expectConstructorPost(result, ContractError.message, rawStack)
      common.expectInvariants(result)
      result.should.not.have.ownProperty('message')
      testUtil.log('result.stack:\n%s', result.stack)
    })
    it('can get a message set', function () {
      const result = new ContractError(stack.raw())
      const message = 'another message'
      property.frozenDerived(result, 'message', function () {
        return message
      })
      result.should.have.ownProperty('message')
      result.message.should.equal(message)
      common.expectInvariants(result)
    })
  })

  common.generatePrototypeMethodsDescriptions(() => new ContractError(stack.raw()), [
    {
      subject: () => new ContractError(stack.raw()),
      description: 'a contract error'
    }
  ])
})
