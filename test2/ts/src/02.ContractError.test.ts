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
import { frozenDerived, setAndFreeze } from '../../../src/private/property.ts'
import { testName } from '../../util/testName.ts'
import { log } from '../../util/testUtil.ts'
import { raw as rawStack } from '../../../src/private/stack.ts'
import {
  expectConstructorPost,
  expectInvariants,
  generatePrototypeMethodsDescriptions
} from '../ContractErrorCommon.ts'

const message = `CE ${contractErrorMessage}`

class CE extends ContractError {
  static {
    setAndFreeze(this.prototype, 'name', CE.name)
    setAndFreeze(this.prototype, 'message', message)
  }

  constructor(rawStack: string) {
    super(rawStack)
  }
}

describe(testName(import.meta), function () {
  describe('#ContractError()', function () {
    it('creates an instance with all toppings', function () {
      const stackHere = rawStack()
      const result = new CE(stackHere)
      log('result:\n%s', result)
      log('result.toString():\n%s', result.toString())
      expectConstructorPost(result, message, stackHere)
      expectInvariants(result)
      result.should.not.have.ownProperty('message')
      log('result.stack:\n%s', result.stack)
    })

    it('can get a message set', function () {
      const result = new CE(rawStack())
      const message = 'another message'
      frozenDerived(result, 'message', function () {
        return message
      })
      result.should.have.ownProperty('message')
      result.message.should.equal(message)
      expectInvariants(result)
    })
  })

  generatePrototypeMethodsDescriptions(
    () => new CE(rawStack()),
    [
      {
        subject: () => new CE(rawStack()),
        description: 'a contract error'
      }
    ]
  )
})
