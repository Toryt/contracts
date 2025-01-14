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
import { isStackLocation, isStack } from '../../../../src/private/is.ts'
import { nEOL, rnEOL, stackEOL } from '../../../../src/private/eol.ts'
import { environment } from '../../../util/environment.ts'
import { log } from '../../../util/log.ts'
import { location, rawStack, stackSkipsForEach } from '../../../../src/private/stack.ts'
import { testName } from '../../../util/testName.ts'

describe(testName(import.meta), function () {
  describe('location', function () {
    function checkStackLocation(result: string): void {
      log(result)
      should(result).be.a.String()
      // must be a single line with any EOL
      result.split(rnEOL).length.should.equal(1)
      result.split(nEOL).length.should.equal(1)
      if (environment !== 'safari' && environment !== 'safari <= 12') {
        result.should.containEql('aSecondFunction')
      }
      isStackLocation(result).should.be.true()
    }

    it('returns the expected line without arguments', function () {
      function aFirstFunction(): string {
        // target location
        function aSecondFunction(): string {
          return location()
        }

        return aSecondFunction()
      }

      const result = aFirstFunction()
      checkStackLocation(result)
    })

    it('returns the expected line 2 deep', function () {
      function aFirstFunction(): string {
        // target location
        function aSecondFunction(): string {
          function aThirdFunction(): string {
            function aFourthFunction(): string {
              return location(2)
            }

            return aFourthFunction()
          }

          return aThirdFunction()
        }

        return aSecondFunction()
      }

      const result = aFirstFunction()
      checkStackLocation(result)
    })
  })

  describe('rawStack', function () {
    function checkRaw(result: string): void {
      const lines = result.split(stackEOL)
      lines.length.should.be.greaterThanOrEqual(1)
      if (environment !== 'safari' && environment !== 'safari <= 12') {
        lines.length.should.be.greaterThanOrEqual(5)
        should(lines[0]).containEql('aFifthFunction')
        should(lines[1]).containEql('aFourthFunction')
        should(lines[2]).containEql('aThirdFunction')
        should(lines[3]).containEql('aSecondFunction')
        should(lines[4]).containEql('aFirstFunction')
      }
      isStack(result).should.be.true()
    }

    it('returns the expected stack without arguments', function () {
      function aFourthFunction(): string {
        function aFifthFunction(): string {
          return rawStack()
        }

        return aFifthFunction()
      }

      function aSecondFunction(): string {
        function aThirdFunction(): string {
          return aFourthFunction()
        }

        return aThirdFunction()
      }

      function aFirstFunction(): string {
        return aSecondFunction()
      }

      const result = aFirstFunction()
      log(result)
      result.should.be.a.String()
      result.should.not.containEql('[[internal]]')
      checkRaw(result)
    })

    it('returns the expected stack, 2 deep', function () {
      function skipTwo(skip: number): string {
        function skipOne(skip: number): string {
          return rawStack(skip + 1)
        }

        return skipOne(skip + 1)
      }

      function skipThree(skip: number): string {
        return skipTwo(skip + 1)
      }

      function aFourthFunction(): string {
        function aFifthFunction(): string {
          return skipThree(0)
        }

        return aFifthFunction()
      }

      function aSecondFunction(): string {
        function aThirdFunction(): string {
          return aFourthFunction()
        }

        return aThirdFunction()
      }

      function aFirstFunction(): string {
        return aSecondFunction()
      }

      const result = aFirstFunction()
      log(result)
      result.should.be.a.String()
      result.should.not.containEql('skip')
      if (environment !== 'safari') {
        result.should.not.containEql('[[internal]]')
      }
      checkRaw(result)
    })
  })

  describe('stackSkipsForEach', function () {
    it('return the expected value for this platform', function () {
      log('stackSkipsForEach:', stackSkipsForEach)
      stackSkipsForEach.should.equal(environment === 'firefox')
    })
  })
})
