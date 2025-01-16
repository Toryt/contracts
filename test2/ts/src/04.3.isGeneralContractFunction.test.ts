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

'use strict'

import { inspect } from 'node:util'
import { isAGeneralContractFunction } from '../../../src/BaseFunctionContract.ts'
import { internalLocation } from '../../../src/location.ts'
import { testName } from '../../util/testName.ts'
import {
  createCandidateContractFunction,
  generateIAGCFTests,
  notAFunctionNorAContract
} from './BaseFunctionContractCommon.ts'

describe(testName(import.meta), function () {
  generateIAGCFTests(isAGeneralContractFunction)
  notAFunctionNorAContract
    .filter(v => !!v)
    .concat(['    at', 'at /', {}, internalLocation])
    .forEach(v => {
      it(`says yes if there is an implementation Function, an AbstractFunctionContract, and a location that is ${inspect(v)}, and all 3 properties are frozen, and it has the expected name`, function () {
        const candidate = createCandidateContractFunction(undefined, undefined, 'location', v)
        isAGeneralContractFunction(candidate).should.be.ok()
      })
    })
})
