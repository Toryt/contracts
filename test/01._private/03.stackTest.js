/*
 Copyright 2015 - 2017 by Jan Dockx

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

/* eslint-env mocha */

'use strict'

const stack = require('../../lib/_private/stack')
const is = require('../../lib/_private/is')
const testUtil = require('../_util/testUtil')
const os = require('os')

describe('_private/util', function () {
  describe('#location', function () {
    it('returns the expected line without arguments', function () {
      function aFirstFunction () {
        function aSecondFunction () {
          return stack.location()
        }

        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.must.be.a.string()
      result.split(os.EOL).length.must.equal(1)
      if (testUtil.environment !== 'safari') {
        result.must.contain('aSecondFunction')
      }
      is.stackLocation(result).must.be.true()
    })
    it('returns the expected line 2 deep', function () {
      function aFirstFunction () {
        function aSecondFunction () {
          function aThirdFunction () {
            function aFourthFunction () {
              return stack.location(2)
            }

            return aFourthFunction()
          }

          return aThirdFunction()
        }

        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.must.be.a.string()
      result.split(os.EOL).length.must.equal(1)
      if (testUtil.environment !== 'safari') {
        result.must.contain('aSecondFunction')
      }
      is.stackLocation(result).must.be.true()
    })
  })

  describe('#raw', function () {
    it('returns the expected stack without arguments', function () {
      function aFourthFunction () {
        function aFifthFunction () {
          return stack.raw()
        }

        return aFifthFunction()
      }

      function aSecondFunction () {
        function aThirdFunction () {
          return aFourthFunction()
        }

        return aThirdFunction()
      }

      function aFirstFunction () {
        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.must.be.a.string()
      const lines = result.split(os.EOL)
      lines.length.must.be.at.least(1)
      if (testUtil.environment !== 'safari') {
        lines.length.must.be.at.least(5)
        lines[0].must.contain('aFifthFunction')
        lines[1].must.contain('aFourthFunction')
        lines[2].must.contain('aThirdFunction')
        lines[3].must.contain('aSecondFunction')
        lines[4].must.contain('aFirstFunction')
      }
      is.stack(result).must.be.true()
    })
    it('returns the expected stack. 2 deep', function () {
      function skipTwo (skip) {
        function skipOne (skip) {
          return stack.raw(skip + 1)
        }

        return skipOne(skip + 1)
      }

      function skipThree (skip) {
        return skipTwo(skip + 1)
      }

      function aFourthFunction () {
        function aFifthFunction () {
          return skipThree(0)
        }

        return aFifthFunction()
      }

      function aSecondFunction () {
        function aThirdFunction () {
          return aFourthFunction()
        }

        return aThirdFunction()
      }

      function aFirstFunction () {
        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.must.be.a.string()
      const lines = result.split(os.EOL)
      lines.length.must.be.at.least(1)
      if (testUtil.environment !== 'safari') {
        lines.length.must.be.at.least(5)
        lines[0].must.contain('aFifthFunction')
        lines[1].must.contain('aFourthFunction')
        lines[2].must.contain('aThirdFunction')
        lines[3].must.contain('aSecondFunction')
        lines[4].must.contain('aFirstFunction')
      }
      is.stack(result).must.be.true()
    })
  })
})
