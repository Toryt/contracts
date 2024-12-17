/*
 Copyright 2015 - 2020 by Jan Dockx

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
const eol = require('../../lib/_private/eol')

describe('_private/stack', function () {
  describe('#location', function () {
    it('returns the expected line without arguments', function () {
      function aFirstFunction() {
        function aSecondFunction() {
          return stack.location()
        }

        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.should.be.a.String()
      // must be a single line with any EOL
      result.split(eol.rn).length.should.equal(1)
      result.split(eol.n).length.should.equal(1)
      if (testUtil.environment !== 'safari' && testUtil.environment !== 'safari <= 12') {
        result.should.containEql('aSecondFunction')
      }
      is.stackLocation(result).should.be.true()
    })
    it('returns the expected line 2 deep', function () {
      function aFirstFunction() {
        function aSecondFunction() {
          function aThirdFunction() {
            function aFourthFunction() {
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
      result.should.be.a.String()
      // must be a single line with any EOL
      result.split(eol.rn).length.should.equal(1)
      result.split(eol.n).length.should.equal(1)
      if (testUtil.environment !== 'safari' && testUtil.environment !== 'safari <= 12') {
        result.should.containEql('aSecondFunction')
      }
      is.stackLocation(result).should.be.true()
    })
  })

  describe('#raw', function () {
    it('returns the expected stack without arguments', function () {
      function aFourthFunction() {
        function aFifthFunction() {
          return stack.raw()
        }

        return aFifthFunction()
      }

      function aSecondFunction() {
        function aThirdFunction() {
          return aFourthFunction()
        }

        return aThirdFunction()
      }

      function aFirstFunction() {
        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.should.be.a.String()
      result.should.not.containEql('[[internal]]')
      const lines = result.split(eol.stack)
      lines.length.should.be.greaterThanOrEqual(1)
      if (testUtil.environment !== 'safari' && testUtil.environment !== 'safari <= 12') {
        lines.length.should.be.greaterThanOrEqual(5)
        lines[0].should.containEql('aFifthFunction')
        lines[1].should.containEql('aFourthFunction')
        lines[2].should.containEql('aThirdFunction')
        lines[3].should.containEql('aSecondFunction')
        lines[4].should.containEql('aFirstFunction')
      }
      is.stack(result).should.be.true()
    })
    it('returns the expected stack. 2 deep', function () {
      function skipTwo(skip) {
        function skipOne(skip) {
          return stack.raw(skip + 1)
        }

        return skipOne(skip + 1)
      }

      function skipThree(skip) {
        return skipTwo(skip + 1)
      }

      function aFourthFunction() {
        function aFifthFunction() {
          return skipThree(0)
        }

        return aFifthFunction()
      }

      function aSecondFunction() {
        function aThirdFunction() {
          return aFourthFunction()
        }

        return aThirdFunction()
      }

      function aFirstFunction() {
        return aSecondFunction()
      }

      const result = aFirstFunction()
      testUtil.log(result)
      result.should.be.a.String()
      result.should.not.containEql('skip')
      if (testUtil.environment !== 'safari') {
        result.should.not.containEql('[[internal]]')
      }
      const lines = result.split(eol.stack)
      lines.length.should.be.greaterThanOrEqual(1)
      if (testUtil.environment !== 'safari' && testUtil.environment !== 'safari <= 12') {
        lines.length.should.be.greaterThanOrEqual(5)
        lines[0].should.containEql('aFifthFunction')
        lines[1].should.containEql('aFourthFunction')
        lines[2].should.containEql('aThirdFunction')
        lines[3].should.containEql('aSecondFunction')
        lines[4].should.containEql('aFirstFunction')
      }
      is.stack(result).should.be.true()
    })
  })

  describe('skipsForEach', function () {
    it('return the expected value for this platform', function () {
      testUtil.log('stack.skipsForEach:', stack.skipsForEach)
      stack.skipsForEach.should.equal(testUtil.environment === 'firefox')
    })
  })
})
