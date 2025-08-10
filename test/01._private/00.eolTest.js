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

'use strict'

const { nEOL, osEOL, rnEOL, stackEOL } = require('../../lib/_private/eol')
const os = require('os')
const cases = require('../_cases')

describe('_private/eol', function () {
  it('#n', function () {
    nEOL.should.equal('\n')
  })
  it('#rn', function () {
    rnEOL.should.equal('\r\n')
  })
  describe('#EOL', function () {
    it('is either n or rn', function () {
      const result = stackEOL === nEOL || stackEOL === rnEOL
      result.should.be.true()
    })
    it('a stack contains the expected EOL', function () {
      const err = new Error('just an error')
      err.stack.should.containEql(stackEOL)
      err.stack.should.not.containEql(cases.notStackEOL)
    })
  })
  it('#os', function () {
    osEOL.should.equal(os.EOL)
  })
})
