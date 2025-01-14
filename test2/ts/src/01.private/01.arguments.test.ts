/*
  Copyright 2015–2025 Jan Dockx

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
import { isFunctionArguments } from '../../../../src/private/arguments.ts'
import { stuffGenerators } from '../../../util/_stuff.ts'
import { testName } from '../../../util/testName.ts'

describe(testName(import.meta), function () {
  describe('isFunctionArguments', function () {
    stuffGenerators.forEach(({ generate, description }) => {
      it(`returns the expected result for ${description}`, function () {
        const subject = generate()
        const result = isFunctionArguments(subject)
        if (Object.prototype.toString.call(arguments) === Object.prototype.toString.call(subject)) {
          result.should.be.true()
        } else {
          should(result).not.be.ok()
        }
      })
    })
  })
})