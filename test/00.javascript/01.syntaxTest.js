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

// eslint-disable-next-line no-unused-vars
const must = require('must')
const orderOfKeysCommon = require('./_orderOfKeysCommon')

describe('javascript/syntax', function () {
  describe('#for-in', function () {
    //
    /*
     Does for ... iteration respect the order in which properties on an object are defined?
     And in what order are the properties of the prototype handled?

     According to the spec, the order is undefined. However,
     "All modern implementations of ECMAScript iterate through object properties in the order in which they were defined."
     (http://ejohn.org/blog/javascript-in-chrome/, "for loop order".)
     */
    it('should return all properties in the order they were defined', function () {
      // noinspection MagicNumberJS
      const nrOfProperties = 10000
      const o = orderOfKeysCommon.prepareAnObject(0, nrOfProperties)
      let count = 0
      let previous = -1
      for (let key in o) {
        count++
        const current = orderOfKeysCommon.nFromRandomName(key)
        current.must.equal(previous + 1)
        previous = current
      }
      count.must.equal(nrOfProperties)
    })
  })
})
