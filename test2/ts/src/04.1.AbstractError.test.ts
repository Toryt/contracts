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

import should from 'should'
import type { UnknownFunction } from '../../../src/index.ts'
import { AbstractError, abstractErrorMessage, BaseFunctionContract } from '../../../src/BaseFunctionContract.ts'
import type { FunctionContractLocation } from '../../../src/location.ts'
import { rawStack } from '../../../src/private/stack.ts'
import { testName } from '../../util/testName.ts'
import { expectOwnFrozenProperty } from '../../util/expectProperty.ts'
import { log } from '../../util/log.ts'
import {
  expectAbstractErrorConstructorPost,
  expectAbstractErrorInvariants,
  generateAbstractErrorMethodsDescriptions
} from './AbstractErrorCommon.ts'

describe(testName(import.meta), function () {
  describe('prototype', function () {
    it('has the expected properties', function () {
      const { value: name } = expectOwnFrozenProperty(AbstractError.prototype, 'name')
      should(name).be.a.String()
      should(name).equal(AbstractError.name)

      const { value: message } = expectOwnFrozenProperty(AbstractError.prototype, 'message')
      should(message).be.a.String()
      should(message).equal(abstractErrorMessage)

      const { value: contract } = expectOwnFrozenProperty(AbstractError.prototype, 'contract')
      should(contract).be.null()

      AbstractError.prototype.should.not.have.ownProperty('stack')
    })
  })

  describe('constructor', function () {
    it('creates an instance with all toppings for `AbstractContract.root`', function () {
      const rStack = rawStack()
      const result = new AbstractError(BaseFunctionContract.root, rStack)
      expectAbstractErrorInvariants(result)
      expectAbstractErrorConstructorPost(result, abstractErrorMessage, BaseFunctionContract.root, rStack)
      log('result.stack:\n%s', result.stack)
    })
  })

  describe('instance', function () {
    generateAbstractErrorMethodsDescriptions(
      (): AbstractError<BaseFunctionContract<UnknownFunction, FunctionContractLocation>> =>
        new AbstractError(BaseFunctionContract.root, rawStack()),
      [
        {
          subject: (): AbstractError<BaseFunctionContract<UnknownFunction, FunctionContractLocation>> =>
            new AbstractError(BaseFunctionContract.root, rawStack()),
          description: 'BaseFunctionContract.root'
        }
      ]
    )
  })
})
