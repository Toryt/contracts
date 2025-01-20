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

import {
  BaseFunctionContract,
  boundPrefix,
  type ContractFunction,
  contractFunctionBind,
  isAGeneralContractFunction
} from '../../../src/BaseFunctionContract.ts'
import { location } from '../../../src/location.ts'
import { conciseRepresentation } from '../../../src/private/representation.ts'
import { testName } from '../../util/testName.ts'
import { mustBeCallerLocation } from '../../util/testUtil.ts'
import { createCandidateContractFunction } from './GeneralContractFunctionCommon.ts'

describe(testName(import.meta), function () {
  it('behaves as expected', function () {
    const subject = createCandidateContractFunction<
      ContractFunction<() => void, BaseFunctionContract<() => void, string>, () => void>
      // eslint-disable-next-line @stylistic/indent
    >(BaseFunctionContract)
    const expectedLocation = location()
    const result = contractFunctionBind.apply(subject)
    isAGeneralContractFunction(result).should.be.true()
    Object.getPrototypeOf(result.contract).should.equal(subject.contract)
    result.implementation.should.not.equal(subject.implementation)
    result.implementation.name.should.equal(conciseRepresentation(boundPrefix, subject.implementation))
    mustBeCallerLocation(result.location, expectedLocation)
    if (BaseFunctionContract.isAContractFunction(subject)) {
      BaseFunctionContract.isAContractFunction(result).should.be.true()
    }
  })

  // MUDO incomplete: test with and without prototype, of a non-object prototype
})
