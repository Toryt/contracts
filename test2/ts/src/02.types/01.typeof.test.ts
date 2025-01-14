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

import { isTruePrimitive } from '../../../../src/private/is.ts'
import { stuffGenerators } from '../../../util/_stuff.ts'
import { testName } from '../../../util/testName.ts'

describe(testName(import.meta), function () {
  describe('isTruePrimitive()', function () {
    stuffGenerators.forEach(({ generate, description, primitive: isPrimitive }) => {
      it(`correctly decides whether the argument is a primitive for ${description})`, function () {
        const subject = generate()
        const result = isTruePrimitive(subject)
        result.should.be.a.Boolean()
        result.should.equal(isPrimitive && subject !== undefined)
      })
    })
  })
})
