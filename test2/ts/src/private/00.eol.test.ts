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

import { nEOL, rnEOL, stackEOL, osEOL } from '../../../../src/private/eol.ts'
import { notStackEOL } from '../../../util/cases.ts'
import { EOL } from 'os'
import { testName } from '../../../util/testName.ts'

describe(testName(import.meta), function () {
  it('#nEOL', function () {
    nEOL.should.equal('\n')
  })
  it('#rnEOL', function () {
    rnEOL.should.equal('\r\n')
  })
  describe('#EOL', function () {
    /* TODO unnecessary test in TS
    it('is either nEOL or rnEOL', function () {
      const result = stackEOL === nEOL || stackEOL === rnEOL
      result.should.be.true()
    })
    */
    it('a stack contains the expected EOL', function () {
      const err = new Error('just an error')
      err.stack!.should.containEql(stackEOL)
      err.stack!.should.not.containEql(notStackEOL)
    })
  })
  it('#osEOL', function () {
    osEOL.should.equal(EOL)
  })
})
