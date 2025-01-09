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

import { AbstractError, abstractErrorMessage, AbstractFunctionContract } from '../../../src/AbstractFunctionContract.ts'
import { raw as rawStack } from '../../../src/private/stack.ts'
import { log } from '../../util/testUtil.ts'
import { expectConstructorPost, expectInvariants, generatePrototypeMethodsDescriptions } from './AbstractErrorCommon.ts'

describe('AbstractError', function () {
  describe('#AbstractError()', function () {
    it('creates an instance with all toppings for `AbstractContract.root`', function () {
      const rStack = rawStack()
      const result = new AbstractError(AbstractFunctionContract.root, rStack)
      expectConstructorPost(result, abstractErrorMessage, AbstractFunctionContract.root, rStack)
      expectInvariants(result)
      log('result.stack:\n%s', result.stack)
    })
  })

  generatePrototypeMethodsDescriptions(
    () => new AbstractError(AbstractFunctionContract.root, rawStack()),
    [
      {
        subject: () => new AbstractError(AbstractFunctionContract.root, rawStack()),
        description: 'AbstractFunctionContract.root'
      }
    ]
  )
})
