/*
  Copyright 2016 - 2018 by Jan Dockx

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

const os = require('os')
const assert = require('assert')
const stackEOL = require('./stack').EOL

const anArgumentsToString = (function () {
  return '' + arguments
})()

const rnEOL = '\r\n'
const nEOL = '\n'

const is = {
  functionArguments: function (a) {
    return a && '' + a === anArgumentsToString
  },

  /**
   * p is a true primitive, i.e., not null, undefined, an object (which implies, not a Date, Math or JSON, nor any
   * Error, and not an array or arguments, and wrapped primitives), not a function. p is a true string, number or
   * boolean.
   */
  primitive: function (p) {
    return p !== null && ['number', 'string', 'boolean'].indexOf(typeof p) >= 0
  },

  /**
   * <code>location</code> is a stack line location.
   *
   * Over Node, cross-platform, and different browsers, we can only say this has to be a none-empty string, that is not
   * multi-line.
   *
   * It does not always end with a line number and column number (native code), it does not always start with 'at'
   * (Firefox), …
   */
  stackLocation: function (location) {
    return !!location && typeof location === 'string' && location.indexOf(rnEOL) < 0 && location.indexOf(nEOL) < 0
  },

  /**
   * <code>stack</code> is a stack.
   *
   * Over Node, cross-platform, and different browsers, we can only say this has to be a none-empty, multi-line string,
   * with at least 1 line, and no empty lines.
   *
   * Lines do not always end with a line number and column number (native code), do not always start with 'at'
   * (Firefox), …
   */
  stack: function (stack) {
    const lines = !!stack && typeof stack === 'string' && stack.split(stackEOL)
    return lines && lines.length > 0 && lines.every(l => is.stackLocation(l))
  },

  frozenOwnProperty: function (obj, propName) {
    assert.notStrictEqual(obj, null)
    assert.notStrictEqual(obj, undefined)

    const descriptor = Object.getOwnPropertyDescriptor(obj, propName)
    return (
      descriptor &&
      descriptor.enumerable === true &&
      descriptor.configurable === false &&
      (descriptor.writable === false || (typeof descriptor.get === 'function' && !descriptor.set))
    )
  }
}

module.exports = is
