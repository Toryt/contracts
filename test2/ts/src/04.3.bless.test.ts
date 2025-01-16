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
import { BaseFunctionContract, bless, contractFunctionBind } from '../../../src/BaseFunctionContract.ts'
import { location } from '../../../src/location.ts'
import { conciseRepresentation, namePrefix } from '../../../src/private/representation.ts'
import { expectOwnFrozenProperty } from '../../util/expectProperty.ts'
import { testName } from '../../util/testName.ts'

describe(testName(import.meta), function () {
  it('behaves as expected', function () {
    const contractFunction = function (): void {}
    const contract = new BaseFunctionContract({})
    const implFunction = function (): void {}
    const here = location()
    should(implFunction.prototype).be.an.Object() // this is here because Safari on iOS doesn't do this always!; by doing this test, the prototype is forced in Safari on iOS

    const blessed = bless(contractFunction, contract, implFunction, here)

    blessed.should.equal(contractFunction)
    // MUDO    BaseFunctionContract.isAContractFunction(blessed).should.be.true()
    const { value: contractFromBlessed } = expectOwnFrozenProperty(blessed, 'contract')
    Object.getPrototypeOf(contractFromBlessed).should.equal(contract)
    const { value: implementationFromBlessed } = expectOwnFrozenProperty(blessed, 'implementation')
    should(implementationFromBlessed).equal(implFunction)
    const { value: locationFromBlessed } = expectOwnFrozenProperty(blessed, 'location')
    should(locationFromBlessed).equal(here)
    const { value: bindFromBlessed } = expectOwnFrozenProperty(blessed, 'bind')
    should(bindFromBlessed).equal(contractFunctionBind)
    blessed.should.have.ownProperty('name')
    blessed.name.should.equal(conciseRepresentation(namePrefix, blessed.implementation))

    const implFunctionNamePropDesc = Object.getOwnPropertyDescriptor(implFunction, 'name')
    should(implFunctionNamePropDesc).not.be.undefined()
    delete implFunctionNamePropDesc!.value

    const contractFunctionNamePropDesc = Object.getOwnPropertyDescriptor(contractFunction, 'name')
    should(contractFunctionNamePropDesc).not.be.undefined()
    contractFunctionNamePropDesc!.value.should.equal(
      conciseRepresentation(BaseFunctionContract.namePrefix, blessed.implementation)
    )
    delete contractFunctionNamePropDesc!.value

    contractFunctionNamePropDesc!.should.deepEqual(implFunctionNamePropDesc)
  })

  // MUDO test all paths
})