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
const nodeUtil = require('util')
const is = require('./is')

const util = {
  /**
   * Checks condition, and reports if it fails.
   *
   * Checking is done with a function, and not with a boolean, so that the report can show the condition.
   * The condition cannot be an arrow function when there is a self.
   */
  pre: function (/* Object? */ self, /* Function */ condition) {
    const shiftedCondition = condition || self
    const shiftedSelf = condition ? self : undefined
    if (!shiftedCondition.apply(shiftedSelf)) {
      throw new Error('Precondition violation in Toryt Contracts: ' + shiftedCondition)
    }
  },

  maxLengthOfConciseRepresentation: 80,
  lengthOfEndConciseRepresentation: 15,
  conciseSeparator: ' … ',

  /**
   * Returns a concise representation of <code>f</code> to be used in output.
   */
  conciseConditionRepresentation: function (prefix, f) {
    util.pre(() => typeof prefix === 'string')

    let result = (f && f.displayName) || (prefix + ' ' + ((f && f.name) || f))
    result = result.replace(/\s\s+/g, ' ')
    if (util.maxLengthOfConciseRepresentation < result.length) {
      const startLength = util.maxLengthOfConciseRepresentation -
                        util.lengthOfEndConciseRepresentation -
                        util.conciseSeparator.length
      const start = result.slice(0, startLength)
      const end = result.slice(-util.lengthOfEndConciseRepresentation)
      result = start + util.conciseSeparator + end
    }
    return result.trim()
  },

  /**
   * Return a string that is a human readable description of the type of `v`, as good as possible
   */
  type: function (v) {
    return typeof v !== 'object'
      ? typeof v
      : v === null
        ? 'null'
        : v === Math
          ? 'Math'
          : v === JSON
            ? 'JSON'
            : v.toString() === '[object Arguments]'
              ? 'arguments'
              : v.constructor.displayName || v.constructor.name
  },

  inspect: function (v) {
    // noinspection IfStatementWithTooManyBranchesJS
    if (typeof v === 'string' || v instanceof String) {
      return `'${v}'`
    } else if (is.primitive(v) ||
               v instanceof Date ||
               v instanceof Error ||
               v instanceof Number ||
               v instanceof Boolean) {
      return '' + v
    } else if (typeof v === 'function') {
      return util.conciseConditionRepresentation('', v)
    } else {
      return nodeUtil.inspect(v, {depth: 0, maxArrayLength: 5, breakLength: 120})
    }
  },

  /**
   * <p>Returns a moderately normalized extensive, multi-line representation of a <em>thrown</em>.</p>
   * <p>Anything can be thrown, not only Error instances.</p>
   * <p>The stack of an Error is different in different environments. In node and Chrome, the first line of the
   *   stack is actually the toString of the Error, followed by the true stack, one call per line, that starts
   *   with <code>/^    at/</code>, followed by the path of the file where the call was made.
   *   In Firefox and Safari, the stack only contains the true stack, and the lines
   *   are the name of the called function (or the empty string for anonymous functions), followed by <code>@</code>,
   *   followed by the path of the file where the call was made.</p>
   * <p>If the <em>thrown</em> does not have a stack property, its standard string representation is returned.</p>
   * <p>If the <em>thrown</em> does have a stack property, its stack is returned. If the stack starts with
   *   the string representation of the <em>thrown</em>, that's it. Otherwise, the string representation of the
   *   <em>thrown</em> is added in the front on a separate line.</p>
   */
  extensiveThrownRepresentation: function (thrown) {
    const thrownString = util.inspect(thrown)
    let stack = thrown && thrown.stack
    if (!stack) {
      return thrownString
    }
    stack = '' + stack // make sure it is a string
    /* On node and chrome, the stack starts with thrown.toString (name and message).
       On safari and FF, it doesn't: thrown.stack it is the pure stack. We add the toString ourselves */
    return (stack.indexOf(thrownString) === 0)
      ? stack
      : `${thrownString}
${stack}`
  }
}

module.exports = util
