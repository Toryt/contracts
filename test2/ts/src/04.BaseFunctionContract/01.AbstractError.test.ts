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

import { expectTypeOf } from 'expect-type'
import should from 'should'
import {
  AbstractError,
  abstractErrorMessage,
  BaseFunctionContract,
  type FunctionContractKwargs,
  unknownFunctionContract
} from '../../../../src/BaseFunctionContract.ts'
import type { ContractError } from '../../../../src/ContractError.ts'
import type { NeverFunction, UnknownFunction } from '../../../../src/index.ts'
import { type GeneralLocation, location } from '../../../../src/location.ts'
import { rawStack } from '../../../../src/private/stack.ts'
import { expectOwnFrozenProperty } from '../../../util/expectProperty.ts'
import { log } from '../../../util/log.ts'
import { aNeverFunction } from '../../../util/SomeSignatures.ts'
import { testName } from '../../../util/testName.ts'
import {
  expectAbstractErrorConstructorPost,
  expectAbstractErrorInvariants,
  generateAbstractErrorMethodsDescriptions
} from './AbstractErrorCommon.ts'

describe(testName(import.meta), function () {
  describe('module', function () {
    it('offers an abstractErrorMessage', function () {
      abstractErrorMessage.should.be.a.String()
      abstractErrorMessage.should.not.be.empty()
    })
  })

  describe('prototype', function () {
    it('has the expected properties', function () {
      const name = expectOwnFrozenProperty(AbstractError.prototype, 'name')
      should(name).be.a.String()
      should(name).equal(AbstractError.name)

      const message = expectOwnFrozenProperty(AbstractError.prototype, 'message')
      should(message).be.a.String()
      should(message).equal(abstractErrorMessage)

      const contract = expectOwnFrozenProperty(AbstractError.prototype, 'contract')
      should(contract).be.null()

      AbstractError.prototype.should.not.have.ownProperty('stack')
    })
  })

  describe('constructor', function () {
    it('creates an instance with all toppings for `AbstractContract.root`', function () {
      const rStack = rawStack()
      const result = new AbstractError(unknownFunctionContract, rStack)
      expectAbstractErrorInvariants(result)
      expectAbstractErrorConstructorPost(result, abstractErrorMessage, unknownFunctionContract, rStack)
      log('result.stack:\n%s', result.stack)
    })
  })

  describe('instance', function () {
    generateAbstractErrorMethodsDescriptions(
      (): AbstractError<BaseFunctionContract<UnknownFunction, GeneralLocation>> =>
        new AbstractError(unknownFunctionContract, rawStack()),
      [
        {
          subject: (): AbstractError<BaseFunctionContract<UnknownFunction, GeneralLocation>> =>
            new AbstractError(unknownFunctionContract, rawStack()),
          description: 'unknownFunctionContract'
        }
      ]
    )
  })

  describe('types', function () {
    class AFunctionContract<Signature extends (a: number, b: string) => boolean> extends BaseFunctionContract<
      Signature,
      string
    > {
      constructor(kwargs: FunctionContractKwargs<Signature>) {
        super(kwargs, location(1))
      }
    }
    const aFunction = (a: number): boolean => true
    const afc = new AFunctionContract<typeof aFunction>({})
    const abstractError = new AbstractError(afc, rawStack())

    it('has a setup that is as expected', function () {
      expectTypeOf(aFunction).toMatchTypeOf<unknown>()
      expectTypeOf(aFunction).toMatchTypeOf<UnknownFunction>()
      expectTypeOf(aFunction).toMatchTypeOf<(a: number, b: string) => boolean>()
      expectTypeOf(aNeverFunction).toMatchTypeOf<(a: number, b: string) => boolean>()

      // NOTE: unexpected `not`: is this because of `toMatchTypeOf`?
      expectTypeOf<never>().not.toMatchTypeOf<(a: number, b: string) => boolean>()
      expectTypeOf<(a: number, b: string) => boolean>().not.toMatchTypeOf<never>()

      expectTypeOf<NeverFunction>().toMatchTypeOf(aFunction)
      expectTypeOf(aFunction).not.toMatchTypeOf<NeverFunction>()
      expectTypeOf(aFunction).not.toMatchTypeOf<never>()
    })
    it('is of the expected types', function () {
      expectTypeOf(abstractError).toMatchTypeOf<ContractError>()
      expectTypeOf(abstractError).toMatchTypeOf<AbstractError<AFunctionContract<(a: number, b: string) => boolean>>>()
      expectTypeOf(abstractError).toMatchTypeOf<AbstractError<typeof afc>>()
      expectTypeOf(abstractError).toEqualTypeOf<AbstractError<typeof afc>>()
    })
    it('it has a name, message, rawStack, and stack of the expected types', function () {
      expectTypeOf(abstractError.name).toBeString()
      expectTypeOf(abstractError.message).toBeString()
      expectTypeOf(abstractError.rawStack).toBeString()
      expectTypeOf(abstractError.stack).toBeString()
    })
    it('it has a contract of the expected types', function () {
      expectTypeOf(abstractError.contract).toMatchTypeOf<BaseFunctionContract<UnknownFunction, string>>()
      expectTypeOf(abstractError.contract).toMatchTypeOf<
        BaseFunctionContract<(a: number, b: string) => boolean, string>
      >()
      expectTypeOf(abstractError.contract).toMatchTypeOf<BaseFunctionContract<typeof aFunction, string>>()
      expectTypeOf(abstractError.contract).toMatchTypeOf<AFunctionContract<(a: number, b: string) => boolean>>()
      expectTypeOf(abstractError.contract).toMatchTypeOf<AFunctionContract<(a: number, b: string) => boolean>>()
      expectTypeOf(abstractError.contract).toEqualTypeOf(afc)
    })
  })
})
