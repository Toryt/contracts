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
import { nEOL, rnEOL, stackEOL } from '../../../src/private/eol.ts'
import { isStackLine } from '../../../src/private/stack.ts'
import { stuffGenerators } from '../../util/_stuff.ts'
import { environment } from '../../util/environment.ts'
import { log } from '../../util/log.ts'
import { isLocation, location } from '../../../src/location.ts'
import { testName } from '../../util/testName.ts'

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
      isStackLine(result).should.be.true()
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

  describe('isLocation', function () {
    ;[
      ...stuffGenerators,
      {
        generate: (): string => 'this is a' + nEOL + 'multi-line' + nEOL + 'string',
        description: 'a multi-line string with \\n as EOL',
        primitive: true,
        mutable: false
      },
      {
        generate: (): string => 'this is a' + rnEOL + 'multi-line' + rnEOL + 'string',
        description: 'a multi-line string with \\r\\n as EOL',
        primitive: true,
        mutable: false
      }
    ].forEach(({ generate, description }) => {
      it(`gives the same result as isStackLine for ${description}`, function () {
        const subject = generate()
        const result = isLocation(subject)
        result.should.equal(isStackLine(subject))
      })
    })
    it('says yes to all lines of a stack trace', function () {
      // sadly, also to the message
      const error = new Error('This is an error to get a platform dependent stack')
      const lines = error.stack!.split(stackEOL)
      lines
        .filter((line, index) => index !== lines.length - 1 || line.length > 0) // FF adds an empty line at the end
        .filter(line => line.length > 0) // Safari has lots of empty lines, but only when used remotely (with WebDriver)
        .forEach(line => {
          const result = isLocation(line)
          log(`${result}: ${line}`)
          result.should.be.true()
        })
    })
  })
})
