/*
  Copyright 2015–2024 Jan Dockx

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

const fastException = new Error('this is a fast exception')

describe('javascript/Promise', function () {
  describe('fast exception', function () {
    it('new Promise treats a fast exception like a rejection', function () {
      /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
         > If an error is thrown in the executor function, the promise is rejected. The return value of the executor
         is ignored. */
      const promise = new Promise(() => {
        throw fastException
      })
      promise.catch(err => {
        err.should.equal(fastException)
      })
    })
    it('can be produced with a Promise function', function () {
      function promiseFunction(throws) {
        if (throws) {
          throw fastException
        }
        return Promise.resolve(true)
      }

      promiseFunction.bind(null, true).should.throw(fastException)
    })
  })
})
