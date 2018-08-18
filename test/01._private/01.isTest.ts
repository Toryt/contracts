/*
 Copyright 2015 - 2018 by Jan Dockx

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

import * as is from '../../lib/_private/is'
import { x, log, showStack } from '../_util/testUtil'
import * as must from 'must'
import { EOL } from 'os'
import { stuff, Stuff } from './_stuff'
import 'mocha'

describe('_private/is', function(): void {
  describe('#arguments', function(): void {
    stuff.forEach((s: Stuff): void => {
      it(`returns ${s.expected === 'arguments' ? 'true' : 'false'} for ${
        s.subject
      }`, function(): void {
        const result: boolean = is.functionArguments(s.subject)
        if (s.expected === 'arguments') {
          result.must.be.true()
        } else {
          must(result).be.falsy()
        }
      })
    })
  })

  describe('#primitive()', function(): void {
    stuff.forEach((record: Stuff): void => {
      it(
        'correctly decides whether the argument is a primitive for ' +
          record.subject,
        function(): void {
          const result = is.primitive(record.subject)
          result.must.be.a.boolean()
          result.must.equal(record.isPrimitive)
        }
      )
    })
  })

  describe('#stackLocation', function(): void {
    stuff
      .map((s: Stuff): any => s.subject)
      .filter((s: any): boolean => typeof s !== 'string')
      .forEach((s: any): void => {
        it(`says no to ${s}`, function() {
          const result: boolean = is.stackLocation(s)
          result.must.be.false()
        })
      })
    it(`says no to ''`, function(): void {
      const result: boolean = is.stackLocation('')
      result.must.be.false()
    })
    it(`says yes to 'abc'`, function(): void {
      const result: boolean = is.stackLocation('abc')
      result.must.be.true()
    })
    it(`says no to a multi-line string`, function(): void {
      const result: boolean = is.stackLocation(`this is a 
multi-line
string`)
      result.must.be.false()
    })
    it(`says yes to all lines of a stack trace`, function(): void {
      // sadly, also to the message
      const error: Error = new Error(
        'This is an error to get a platform dependent stack'
      )
      const lines: string[] = error.stack!.split(EOL)
      lines
        .filter(
          (line: string, index: number): boolean =>
            index !== lines.length - 1 || line.length > 0
        ) // FF adds an empty line at the end
        .filter((line: string): boolean => line.length > 0) // Safari has lots of empty lines, but only when used remotely (with WebDriver)
        .forEach((line: string): void => {
          const result: boolean = is.stackLocation(line)
          log(`${result}: ${line}`)
          result.must.be.true()
        })
    })
  })

  describe('#stack', function(): void {
    stuff
      .map((s: Stuff): any => s.subject)
      .filter((s: any): boolean => typeof s !== 'string')
      .forEach((s: Stuff): void => {
        it(`says no to ${s}`, function(): void {
          const result: boolean = is.stack(s)
          result.must.be.false()
        })
      })
    it(`says no to ''`, function(): void {
      const result: boolean = is.stack('')
      result.must.be.false()
    })
    it(`says yes to 'abc'`, function(): void {
      const result: boolean = is.stack('abc')
      result.must.be.true()
    })
    it(`says yes to a multi-line string`, function(): void {
      const candidate: string = `this is a 
multi-line
string`
      const result: boolean = is.stack(candidate)
      result.must.be.true()
    })
    it(`says no to a multi-line string with a blank line`, function(): void {
      const result: boolean = is.stack(`this is a 
multi-line
string, with a

blank line`)
      result.must.be.false()
    })
    it(`says yes to a stack trace`, function(): void {
      const message: string =
        'This is an error to get a platform dependent stack'
      // sadly, also to the message, on some platforms
      const error: Error = new Error(message)
      showStack(error)
      const stackLines: string[] = error.stack!.split(EOL)
      const rawStack: string = stackLines
        // remove message line
        .filter((sl: string): boolean => !!sl && sl.indexOf(message) < 0)
        .join(EOL)
      log('rawStack:')
      log(`▷${rawStack}◁`)
      const result: boolean = is.stack(rawStack)
      result.must.be.true()
    })
  })

  describe('#frozenOwnProperty()', function(): void {
    const propName: string = 'test prop name'
    const propValue: string = 'dummy value'
    const truths: boolean[] = [true, false]
    x(truths, truths, truths).forEach(
      (values: [boolean, boolean, boolean]): void => {
        const subject: object = {}
        Object.defineProperty(subject, propName, {
          configurable: values[0],
          enumerable: values[1],
          writable: values[2],
          value: propValue
        })
        if (
          !values[0] &&
          values[1] &&
          !values[2] &&
          subject.hasOwnProperty(propName)
        ) {
          it(
            'reports true if the property is an own property, ' +
              'and it is enumerable, not configurable and not writable',
            function(): void {
              const result: boolean = is.frozenOwnProperty(subject, propName)
              result.must.be.truthy()
            }
          )
        } else {
          it(
            'reports false if the property is an own property, and' +
              ' enumerable === ' +
              values[1] +
              ' configurable === ' +
              values[0] +
              ' writable === ' +
              values[2],
            function(): void {
              const result: boolean = is.frozenOwnProperty(subject, propName)
              must(result).be.falsy()
            }
          )
        }
        it('reports false if the property does not exist', function(): void {
          const result: boolean = is.frozenOwnProperty(
            subject,
            'some other, non-existing property name'
          )
          must(result).be.falsy()
        })
        interface Specialized {
          [index: string]: any
        }
        const specialized: Specialized = {}
        Object.setPrototypeOf(specialized, subject)
        specialized[propName].must.equal(propValue) // check inheritance - test code validity
        it(
          'reports false if the property is not an own property, and' +
            ' enumerable === ' +
            values[1] +
            ' configurable === ' +
            values[0] +
            ' writable === ' +
            values[2],
          function() {
            const specializedResult = is.frozenOwnProperty(
              specialized,
              propName
            )
            must(specializedResult).be.falsy()
          }
        )
      }
    )
    // noinspection JSMismatchedCollectionQueryUpdate
    const notObjects: any[] = [0, false, '', 'lala']
    notObjects.forEach((notAnObject: any): void => {
      // cannot set a property on primitives
      it(
        'reports false if the first parameter is a primitive (' +
          typeof notAnObject +
          ')',
        function(): void {
          const result: boolean = is.frozenOwnProperty(notAnObject, propName)
          must(result).be.falsy()
        }
      )
    })
    type Getter = (() => any) | undefined
    const getterCandidates: Getter[] = [
      undefined,
      function() {
        return 'some getter result'
      }
    ]
    type Setter = (() => void) | undefined
    const setterCandidates: Setter[] = [undefined, function() {}]
    x(truths, truths, getterCandidates, setterCandidates).forEach(
      (values: [boolean, boolean, () => any, () => void]): void => {
        const subject: object = {}
        Object.defineProperty(subject, propName, {
          configurable: values[0],
          enumerable: values[1],
          get: values[2],
          set: values[3]
        })
        if (
          !values[0] &&
          values[1] &&
          typeof values[2] === 'function' &&
          values[3] === undefined &&
          subject.hasOwnProperty(propName)
        ) {
          it(
            'reports true if the property is an own property, ' +
              'and it is enumerable, and not configurable, has a getter, but not a setter',
            function(): void {
              const result: boolean = is.frozenOwnProperty(subject, propName)
              result.must.be.truthy()
            }
          )
        } else {
          it(
            'reports false if the property is an own property,' +
              ' enumerable === ' +
              values[1] +
              ' configurable === ' +
              values[0] +
              ' get === ' +
              values[2] +
              ' set === ' +
              values[3],
            function(): void {
              const result: boolean = is.frozenOwnProperty(subject, propName)
              must(result).be.falsy()
            }
          )
        }
      }
    )
  })
})
