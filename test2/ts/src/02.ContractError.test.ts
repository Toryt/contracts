/*
  Copyright 2016–2025 Jan Dockx

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

import { ContractError, contractErrorMessage } from '../../../src/ContractError.ts'
import { frozenDerived } from '../../../src/private/property.ts'
import { testName } from '../../util/testName.ts'
import { expectConfigurableDerivedPropertyOnAPrototype, expectOwnFrozenProperty, log } from '../../util/testUtil.ts'
import { rawStack } from '../../../src/private/stack.ts'
import {
  expectContractErrorConstructorPost,
  expectContractErrorInvariants,
  generateContractErrorMethodsDescriptions
} from './ContractErrorCommon.ts'

describe(testName(import.meta), function () {
  describe('prototype', function () {
    it('has the expected properties', function () {
      expectOwnFrozenProperty(ContractError.prototype, 'name')
      ContractError.prototype.name.should.be.a.String()
      ContractError.prototype.name.should.equal(ContractError.name)

      expectOwnFrozenProperty(ContractError.prototype, 'message')
      ContractError.prototype.message.should.be.a.String()
      ContractError.prototype.message.should.equal(contractErrorMessage)

      expectOwnFrozenProperty(ContractError.prototype, 'rawStack')
      ContractError.prototype.rawStack.should.be.a.String()
      ContractError.prototype.rawStack.should.containEql('ContractError')

      expectConfigurableDerivedPropertyOnAPrototype(ContractError.prototype, 'stack')
    })
  })

  describe('constructor', function () {
    it('creates an instance with all toppings', function () {
      const stackHere = rawStack()
      const result = new ContractError(stackHere)
      log('result:\n%s', result)
      log('result.toString():\n%s', result.toString())
      expectContractErrorInvariants(result)
      expectContractErrorConstructorPost(result, contractErrorMessage, stackHere)
      result.should.not.have.ownProperty('name')
      result.should.not.have.ownProperty('message')
      result.should.not.have.ownProperty('stack')
      log('result.stack:\n%s', result.stack)
    })
  })

  describe('instance', function () {
    describe('#message', function () {
      it('can get a message set', function () {
        const result = new ContractError(rawStack())
        const message = 'another message'
        frozenDerived(result, 'message', function () {
          return message
        })
        result.should.have.ownProperty('message')
        result.message.should.equal(message)
        expectContractErrorInvariants(result)
      })
    })

    generateContractErrorMethodsDescriptions(
      (): ContractError => new ContractError(rawStack()),
      [
        {
          subject: (): ContractError => new ContractError(rawStack()),
          description: 'a contract error'
        }
      ]
    )
  })
})
