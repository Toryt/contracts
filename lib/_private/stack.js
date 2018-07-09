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
const is = require('./is')

const stack = {
  /**
   * The (depth + 1)nd line from a stack trace created here, after the `toString()` (the `toString()` might prepended
   * to the stack).
   *
   * When this result is used as a line on its own, it is clickable to navigate to the referred source code
   * in most consoles.
   *
   * Note that in Safari, the result cannot be trusted. Safari skips (optimized?) stack frames. In Safari, this
   * will return 'a' stack line, but not necessarily a semantic meaningful one.
   */
  location: function (depth) {
    assert(!depth || is.integer(depth), 'optional depth is an integer')
    assert(!depth || depth >= 0, 'optional depth is positive')

    const stackSource = new Error()
    // most environments add the stackSource.toString() at the beginning of the stack; Firefox does not
    const stackSourceStr = stackSource.toString()
    const stack = stackSource.stack.replace(stackSourceStr + os.EOL, '')
    const stackLines = stack.split(os.EOL)
    /* Return the line at 1 + (depth || 0)
       Since Safari skips stack frames, this might not work in Safari.
       There will however be at least 1 element in stack frames.
       The Math.min protects this call for safari for array out of bounds problems.
       This returns a technical result (a string), without real semantic meaning. */
    return stackLines[Math.min(1 + (depth || 0), stackLines.length - 1)]
  },

  /**
   * The stack lines from the (depth + 1)nd down, from a stack trace created here, after the `toString()`
   * (the `toString()` might prepended to the stack). This is a multi-line string, with at least 1 line.
   *
   * Note that in Safari, the result cannot be trusted. Safari skips (optimized?) stack frames. In Safari, this
   * will return 'a' stack, but not necessarily a semantic meaningful one.
   */
  raw: function (depth) {
    assert(!depth || is.integer(depth), 'optional depth is an integer')
    assert(!depth || depth >= 0, 'optional depth is positive')

    const stackSource = new Error()
    // most environments add the stackSource.toString() at the beginning of the stack; Firefox does not
    const stackSourceStr = stackSource.toString()
    const stack = stackSource.stack.replace(stackSourceStr + os.EOL, '')
    const stackLines = stack.split(os.EOL).filter(sl => !!sl) // Firefox has empty lines (at the end)
    /* Return the lines after 1 + (depth || 0)
       Since Safari skips stack frames, this might not work in Safari.
       There will however be at least 1 element in stack frames.
       The Math.min protects this call for safari for array out of bounds problems.
       This returns a technical result (a string), without real semantic meaning.
       We cannot use splice, because that requires deleteCount to be > 0.
       https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice */
    const relevant = stackLines.slice(Math.min(1 + (depth || 0), stackLines.length - 1))
    return relevant.join(os.EOL)
  }
}

module.exports = stack
