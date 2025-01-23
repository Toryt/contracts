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
  type BaseContractFunction,
  BaseFunctionContract,
  bless,
  boundPrefix,
  type ContractFunction,
  contractFunctionBind,
  type FunctionContractKwargs
} from '../../../src/BaseFunctionContract.ts'
import { type UnknownFunction } from '../../../src/types/UnknownFunction.ts'
import { type GeneralLocation, location } from '../../../src/location.ts'
import { conciseRepresentation, namePrefix } from '../../../src/private/representation.ts'
import { expectOwnFrozenProperty } from '../../util/expectProperty.ts'
import { testName } from '../../util/testName.ts'

describe(testName(import.meta), function () {
  it('offers an boundPrefix', function () {
    boundPrefix.should.be.a.String()
    boundPrefix.should.not.be.empty()
  })

  it('behaves as expected', function () {
    const contractFunction = function (): void {}
    const contract = new BaseFunctionContract({})
    const implFunction = function (): void {}
    const here = location()
    should(implFunction.prototype).be.an.Object() // this is here because Safari on iOS doesn't do this always!; by doing this test, the prototype is forced in Safari on iOS

    bless(contractFunction, contract, implFunction, here)

    contractFunction.should.equal(contractFunction)
    BaseFunctionContract.isAContractFunction(contractFunction).should.be.true()
    const contractFromBlessed = expectOwnFrozenProperty(contractFunction, 'contract')
    Object.getPrototypeOf(contractFromBlessed).should.equal(contract)
    const implementationFromBlessed = expectOwnFrozenProperty(contractFunction, 'implementation')
    should(implementationFromBlessed).equal(implFunction)
    const locationFromBlessed = expectOwnFrozenProperty(contractFunction, 'location')
    should(locationFromBlessed).equal(here)
    const bindFromBlessed = expectOwnFrozenProperty(contractFunction, 'bind')
    should(bindFromBlessed).equal(contractFunctionBind)
    contractFunction.should.have.ownProperty('name')
    contractFunction.name.should.equal(conciseRepresentation(namePrefix, contractFunction.implementation))

    const implFunctionNamePropDesc = Object.getOwnPropertyDescriptor(implFunction, 'name')
    should(implFunctionNamePropDesc).not.be.undefined()
    delete implFunctionNamePropDesc!.value

    const contractFunctionNamePropDesc = Object.getOwnPropertyDescriptor(contractFunction, 'name')
    should(contractFunctionNamePropDesc).not.be.undefined()
    contractFunctionNamePropDesc!.value.should.equal(
      conciseRepresentation(BaseFunctionContract.namePrefix, contractFunction.implementation)
    )
    delete contractFunctionNamePropDesc!.value

    contractFunctionNamePropDesc!.should.deepEqual(implFunctionNamePropDesc)
  })

  // MUDO test all paths

  describe('types', function () {
    type AFunctionContractSignature = (a: number, b: string, c: symbol) => boolean
    class AFunctionContract<Signature extends AFunctionContractSignature> extends BaseFunctionContract<
      Signature,
      string
    > {
      constructor(kwargs: FunctionContractKwargs<Signature>) {
        super(kwargs, location(1))
      }
    }
    type AContractSignature = (a: number, b: string) => boolean
    const afc = new AFunctionContract<AContractSignature>({})
    const anImplFunction = (a: number): boolean => a > 0
    const aLocation = location()
    const aContractFunctionToBe = (a: number, b: string): boolean => String(a) === b

    it('is of the expected types', function () {
      bless(aContractFunctionToBe, afc, anImplFunction, aLocation)

      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        BaseContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, GeneralLocation>>
      >()
      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        BaseContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>>
      >()

      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        BaseContractFunction<
          AFunctionContractSignature,
          BaseFunctionContract<AFunctionContractSignature, GeneralLocation>
        >
      >()
      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        BaseContractFunction<AFunctionContractSignature, BaseFunctionContract<AFunctionContractSignature, string>>
      >()
      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        BaseContractFunction<AFunctionContractSignature, AFunctionContract<AFunctionContractSignature>>
      >()
      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        BaseContractFunction<AFunctionContractSignature, AFunctionContract<AContractSignature>>
      >()
      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        BaseContractFunction<AContractSignature, AFunctionContract<AContractSignature>>
      >()

      // cannot use more general than `AFunctionContractSignature` (e.g., `UnknownFunction`) with `AFunctionContract`

      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        ContractFunction<
          AFunctionContractSignature,
          AFunctionContract<AFunctionContractSignature>,
          typeof anImplFunction
        >
      >()

      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        ContractFunction<AContractSignature, AFunctionContract<AContractSignature>, typeof anImplFunction>
      >()

      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        ContractFunction<AFunctionContractSignature, typeof afc, AFunctionContractSignature>
      >()
      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        ContractFunction<AFunctionContractSignature, typeof afc, AContractSignature>
      >()
      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        ContractFunction<AFunctionContractSignature, typeof afc, typeof anImplFunction>
      >()

      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        ContractFunction<AContractSignature, typeof afc, AContractSignature>
      >()
      expectTypeOf(aContractFunctionToBe).toMatchTypeOf<
        ContractFunction<AContractSignature, typeof afc, typeof anImplFunction>
      >()

      expectTypeOf(aContractFunctionToBe).toEqualTypeOf<
        ContractFunction<AContractSignature, typeof afc, typeof anImplFunction>
      >()

      expectTypeOf(aContractFunctionToBe).not.toMatchTypeOf<
        ContractFunction<AContractSignature, typeof afc, (a: number) => never>
      >()
      expectTypeOf(aContractFunctionToBe).not.toMatchTypeOf<
        ContractFunction<AContractSignature, typeof afc, () => boolean>
      >()
    })
    it('has an implementation of the expected types', function () {
      bless(aContractFunctionToBe, afc, anImplFunction, aLocation)

      expectTypeOf(aContractFunctionToBe.implementation).toMatchTypeOf<UnknownFunction>()
      expectTypeOf(aContractFunctionToBe.implementation).toMatchTypeOf<AFunctionContractSignature>()
      expectTypeOf(aContractFunctionToBe.implementation).toMatchTypeOf<AContractSignature>()
      expectTypeOf(aContractFunctionToBe.implementation).toMatchTypeOf<typeof anImplFunction>()
      expectTypeOf(aContractFunctionToBe.implementation).toEqualTypeOf<typeof anImplFunction>()
    })
    it('has a location of the expected type', function () {
      bless(aContractFunctionToBe, afc, anImplFunction, aLocation)

      expectTypeOf(aContractFunctionToBe.location).toBeString()
    })
    // MUDO bind, name, prototype
  })
})
