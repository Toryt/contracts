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
import { functionArguments, isStackLocation, isStack } from '../../../../src/private/is.ts'
import { nEOL, rnEOL, stackEOL } from '../../../../src/private/eol.ts'
import { notStackEOL } from '../../../util/cases.ts'
import { stuffGenerators } from '../../../util/_stuff.ts'
import { log, showStack } from '../../../util/log.ts'
import { testName } from '../../../util/testName.ts'

describe(testName(import.meta), function () {
  describe('arguments', function () {
    stuffGenerators.forEach(({ generate, description }) => {
      it(`returns the expected result for ${description}`, function () {
        const subject = generate()
        const result = functionArguments(subject)
        if (Object.prototype.toString.call(arguments) === Object.prototype.toString.call(subject)) {
          result.should.be.true()
        } else {
          should(result).not.be.ok()
        }
      })
    })
  })

  describe('isStackLocation', function () {
    stuffGenerators
      .filter(({ description }) => !description.includes('string'))
      .forEach(({ generate, description }) => {
        it(`says no to ${description}`, function () {
          const subject = generate()
          const result = isStackLocation(subject)
          result.should.be.false()
        })
      })
    it("says no to ''", function () {
      const result = isStackLocation('')
      result.should.be.false()
    })
    it("says yes to 'abc'", function () {
      const result = isStackLocation('abc')
      result.should.be.true()
    })
    it('says no to a multi-line string with \\n as EOL', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = isStackLocation('this is a' + nEOL + 'multi-line' + nEOL + 'string')
      result.should.be.false()
    })
    it('says no to a multi-line string with \\r\\n as EOL', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = isStackLocation('this is a' + rnEOL + 'multi-line' + rnEOL + 'string')
      result.should.be.false()
    })
    it('says yes to all lines of a stack trace', function () {
      // sadly, also to the message
      const error = new Error('This is an error to get a platform dependent stack')
      const lines = error.stack!.split(stackEOL)
      lines
        .filter((line, index) => index !== lines.length - 1 || line.length > 0) // FF adds an empty line at the end
        .filter(line => line.length > 0) // Safari has lots of empty lines, but only when used remotely (with WebDriver)
        .forEach(line => {
          const result = isStackLocation(line)
          log(`${result}: ${line}`)
          result.should.be.true()
        })
    })
  })

  describe('isStack', function () {
    stuffGenerators
      .filter(({ description }) => !description.includes('string'))
      .forEach(({ generate, description }) => {
        it(`says no to ${description}`, function () {
          const subject = generate()
          const result = isStack(subject)
          result.should.be.false()
        })
      })
    it("says no to ''", function () {
      const result = isStack('')
      result.should.be.false()
    })
    it("says yes to 'abc'", function () {
      const result = isStack('abc')
      result.should.be.true()
    })
    it('says yes to a multi-line string with `stackEOL`', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const candidate = 'this is a' + stackEOL + 'multi-line' + stackEOL + 'string'
      const result = isStack(candidate)
      result.should.be.true()
    })
    it('says no to a multi-line string with the other EOL', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const candidate = 'this is a' + notStackEOL + 'multi-line' + notStackEOL + 'string'
      const result = isStack(candidate)
      result.should.be.true()
    })
    it('says no to a multi-line string with a blank line with `stackEOL`', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = isStack(
        'this is a' + stackEOL + 'multi-line' + stackEOL + 'string, with a' + stackEOL + stackEOL + 'blank line'
      )
      result.should.be.false()
    })
    it('says yes to a multi-line string with a blank line with other EOL (looks like a single line)', function () {
      // do not use a multi-line template string: the EOLs in the source code (\n) are recorded, and then the test fails
      // on Windows
      const result = isStack(
        'this is a' +
          notStackEOL +
          'multi-line' +
          notStackEOL +
          'string, with a' +
          notStackEOL +
          notStackEOL +
          'blank line'
      )
      // with the other EOL, it looks like a single line, which is a good stack
      result.should.be.true()
    })
    it('says yes to a stack trace', function () {
      const message = 'This is an error to get a platform dependent stack'
      // sadly, also to the message, on some platforms
      const error = new Error(message)
      showStack(error)
      const stackLines = error.stack!.split(stackEOL)
      const rawStack = stackLines
        // remove message line
        .filter(sl => sl && sl.indexOf(message) < 0)
        .join(stackEOL)
      log('rawStack:')
      log(`▷${rawStack}◁`)
      const result = isStack(rawStack)
      result.should.be.true()
    })
  })
})
