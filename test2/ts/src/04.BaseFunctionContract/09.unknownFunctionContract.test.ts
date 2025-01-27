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

import { BaseFunctionContract, unknownFunctionContract } from '../../../../src/BaseFunctionContract.ts'
import { testName } from '../../../util/testName.ts'
import { expectInvariants } from './BaseFunctionContractCommon.ts'

describe(testName(import.meta), function () {
  it('has the expected properties', function () {
    unknownFunctionContract.should.be.an.instanceof(BaseFunctionContract)
    expectInvariants(unknownFunctionContract)
    // MUDO
    // unknownFunctionContract.pre.should.have.length(1)
    // unknownFunctionContract.pre[0].should.equal(BaseFunctionContract.falseCondition)
    // unknownFunctionContract.post.should.be.empty()
    // unknownFunctionContract.exception.should.be.empty()
    // unknownFunctionContract.location.should.equal(internalLocation)
  })
})
