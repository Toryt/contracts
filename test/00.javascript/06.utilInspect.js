/*
  Copyright 2019–2024 Jan Dockx

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

const util = require('util')
const cases = require('../_cases')

function test(thing, circular) {
  const result = util.inspect(thing)
  console.log(result)
  result.should.be.a.String()
  if (circular) {
    result.should.match(/\[Circular]/)
  }
  console.log()
}

describe('util.inspect', function () {
  describe('simple', function () {
    cases.any.forEach(c => {
      it(`works for ${c}`, function () {
        test(c)
      })
    })
  })
  describe('nested', function () {
    it('works for a nested object', function () {
      // noinspection SpellCheckingInspection
      const arg = {
        a: {
          aa: {
            aaa: {
              aaaa: {
                aaaaa: 'string aaaaa'
              }
            },
            aab: {
              aaba: 'string aaaba'
            }
          },
          ab: {
            aba: 'string aba'
          },
          ac: 'string ac'
        },
        b: 'string b',
        c: {
          ca: {
            caa: {
              caaa: {
                caaaa: 'string caaaa'
              }
            },
            cab: {
              caba: 'string caaba'
            }
          },
          cb: {
            cba: 'string cba'
          },
          cc: 'string cc'
        }
      }
      test(arg)
    })
    it('works for a nested array', function () {
      // noinspection MagicNumberJS
      const arg = [3, 5, [6, [7, 8, 9], 10, [11], [12, [13, [14], 15], 16], 17], 18]
      test(arg)
    })
  })
  describe('circular', function () {
    it('works for a circular object', function () {
      // noinspection SpellCheckingInspection
      const arg = {
        a: {
          aa: {
            aaa: {
              aaaa: {
                aaaaa: 'string aaaaa'
              }
            },
            aab: {
              aaba: 'string aaaba'
            }
          },
          ab: {
            aba: 'string aba'
          },
          ac: 'string ac'
        }
      }
      arg.b = arg
      test(arg, true)
    })
    it('works for a nested array', function () {
      // noinspection MagicNumberJS
      const arg = [3, 5, [6, [7, 8, 9], 10, [11], [12, [13, [14], 15], 16], 17], 18]
      arg.splice(2, 0, arg)
      test(arg, true)
    })
  })
})
