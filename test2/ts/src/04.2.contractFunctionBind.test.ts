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
  contractFunctionBind,
  type GeneralContractFunction
} from '../../../src/BaseFunctionContract.ts'
import { conciseRepresentation } from '../../../src/private/representation.ts'
import { testName } from '../../util/testName.ts'
import { createCandidateContractFunction } from './BaseFunctionContractCommon.ts'

describe(testName(import.meta), function () {
  it('behaves as expected', function () {
    const subject =
      createCandidateContractFunction<GeneralContractFunction<() => void, () => void, string>>(BaseFunctionContract)
    const result = contractFunctionBind.apply(subject)
    BaseFunctionContract.isAGeneralContractFunction(result).should.be.true()
    Object.getPrototypeOf(result.contract).should.equal(subject.contract)
    result.implementation.should.not.equal(subject.implementation)
    result.implementation.name.should.equal(conciseRepresentation(boundPrefix, subject.implementation))
    result.location.should.equal(subject.location)
    // MUDO
    // if (BaseFunctionContract.isAContractFunction(subject)) {
    //   BaseFunctionContract.isAContractFunction(result).should.be.true()
    // }
  })

  // MUDO incomplete: test with and without prototype, of a non-object prototype
})
