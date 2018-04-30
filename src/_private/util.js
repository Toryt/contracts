/*
  Copyright 2016 - 2017 by Jan Dockx

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

const stackSample = (new Error('Error used to determine dir separator and EOL')).stack
const thisDirectory = '.'
const parentDirectory = '..'

/**
 * Are we running on nodejs?
 */
export const isNode = (
  // eslint-disable-next-line
  new Function('try {return this === global;}catch(e){return false;}')
)()

/**
 * "\" on windows node, "/" everywhere else
 */
export const dirSeparator = /src(.)_private\1util/.exec(stackSample)[1]

/* EOL of this platform is determined by checking the existing of one of the known EOL-patterns in a string,
 generated by the Javascript engine, that certainly contains at least one EOL: an error stack. */
const windowsEol = '\r\n'
const unixEol = '\n'

/**
 * eol is always <code>\n</code> in modern browsers. On node, it depends on the platform.
 */
export const eol = (() => {
  if (new RegExp(windowsEol).test(stackSample)) {
    return windowsEol
  } else if (new RegExp(unixEol).test(stackSample)) {
    return unixEol
  } else {
    throw new Error('Could not determine EOL for this platform. It is not Windows \\r\\n, nor Unix \\n.')
  }
})()

/**
 * Pattern that matches stack lines on node and Chrome, and not on Safari or Firefox.
 */
export const atStackLocation = /^ {4}at (.*)(:\d+:\d+\)?| \(native\)| \(<anonymous>\))$/
// (<anonymous>) is used in node 8.4

/**
 * Pattern that matches stack lines on Safari or Firefox, and not on node and Chrome.
 */
export const atSignStackLocation = /^(.*@)?https?:\/\/[^/]*\/([^:/]*\/)*[^:/]*.js:\d+:\d+|\[native code]$/

/**
 * Pattern that matches stack lines on the current platform.
 */
export const stackLocation = (() => {
  // not the first line, because on some platforms, that is the toString
  const stackLine = (new Error('Error for setup')).stack.split(eol)[2]
  if (atStackLocation.test(stackLine)) {
    return atStackLocation
  }
  if (atSignStackLocation.test(stackLine)) {
    return atSignStackLocation
  }
  throw new Error('Determined from an Error stack line that the current platform is not supported.')
})()

/**
* <p>Returns the directory name of a path, similar to the Unix dirname command.
* For example:</p>
* <pre>
* util.pathUp('/foo/bar/baz/asdf/quux');
* // Returns: '/foo/bar/baz/asdf'
* </pre>
* <p>A <code>TypeError</code> is thrown if path is not a string.</p>
* <p>This replaces node's <code>path.dirname</code>, which is not available on the browser directly.
*/
export function pathUp (path) {
  if (typeOf(path) !== 'string') {
    throw new TypeError('path is not a string')
  }
  const result = path.split(dirSeparator)
  result.pop()
  return result.join(dirSeparator)
}

/**
 * Return the URL at which the given AMD module is loaded.
 * This function only works in a browser.
 */
export function browserModuleLocation (amdModule) {
  // MUDO since we are no longer supporting AMD, does this still make sense? what to do in a browser?
  // there seems to be no sensible way to test what the result actually is
  const dirSeparator = '/' // always "//" for a browser
  if (amdModule.uri.charAt(0) === dirSeparator) {
    // server relative path
    return window.location.origin + amdModule.uri
  }
  let location = window.location.href
  location = location.split(dirSeparator)
  if (location[location.length - 1].indexOf('.') >= 0) { // last entry is a file
    location.pop()
  }
  location = location.concat(amdModule.uri.split(dirSeparator))
  let dotLocation = location.indexOf(thisDirectory) // remove "this directory" path elements
  while (dotLocation >= 0) {
    location.splice(dotLocation, 1)
    dotLocation = location.indexOf(thisDirectory)
  }
  dotLocation = location.indexOf(parentDirectory) // remove "parent directory" path elements
  while (dotLocation >= 0) {
    if (dotLocation <= 3) {
      throw new Error('AMD module location "' + amdModule.uri + '" is illegal in the context of window location "' +
                   window.location + '". ' +
                   'It would bring us above the root of the server. There are too many ".." elements ' +
                   'at the start of the uri.')
    }
    location.splice(dotLocation - 1, 2)
    dotLocation = location.indexOf(parentDirectory)
  }
  return location.join(dirSeparator)
}

export const contractLibPath = pathUp(pathUp( // 2 directories up
  // MUDO this needs to be changed; it still depends on old module syntax in node and amd
  isNode ? (typeof module !== 'undefined' && module.filename) || module.uri // in node, commonjs or AMD
    : browserModuleLocation(typeof module !== 'undefined' || module) // in browser, AMD, prefixed with location
))

/**
 * A better type then Object.toString() or typeof.
 * - toType(undefined); //"undefined"
 * - toType(new); //"null"
 * - toType({a: 4}); //"object"
 * - toType([1, 2, 3]); //"array"
 * - (function() {console.log(toType(arguments))})(); //arguments
 * - toType(new ReferenceError); //"error"
 * - toType(new Date); //"date"
 * - toType(/a-z/); //"regexp"
 * - toType(Math); //"math"
 * - toType(JSON); //"json"
 * - toType(new Number(4)); //"number"
 * - toType(new String("abc")); //"string"
 * - toType(new Boolean(true)); //"boolean"
 *
 * Based on
 * http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
 */
export function typeOf (obj) {
  // MUDO does this still make sense?
  if (obj === null) { // workaround for some weird implementations
    return 'null'
  }
  let result = Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  // on some browsers, the main window returns as "global" (WebKit) or "window" (FF), but this is an object too
  if (result === 'global' || result === 'window') {
    result = 'object'
  }
  return result // return String
}

/**
 * p is a true primitive, i.e., not null, undefined, an object (which implies, not a Date, Math or JSON, nor any
 * Error, and not an array or arguments, and wrapped primitives), not a function. p is a true string, number or
 * boolean.
 */
export function isPrimitive (p) {
  return (p !== null) && ['number', 'string', 'boolean'].indexOf(typeof p) >= 0
}

export function isInteger (value) {
  return Number.isInteger
    ? Number.isInteger(value)
    : typeof value === 'number' && isFinite(value) && Math.floor(value) === value
}

// noinspection FunctionNamingConventionJS
export function pre (/* Object? */ self, /* Function */ condition) {
  const shiftedCondition = condition || self
  const shiftedSelf = condition ? self : undefined
  if (!shiftedCondition.apply(shiftedSelf)) {
    throw new Error('Precondition violation in Toryt Contracts: ' + shiftedCondition)
  }
}

export function setAndFreezeProperty (obj, propName, value) {
  pre(function () { return !isPrimitive(obj) })
  pre(function () { return typeOf(propName) === 'string' })

  Object.defineProperty(
    obj,
    propName,
    {
      configurable: false,
      enumerable: true,
      writable: false,
      value: value
    }
  )
}

// noinspection FunctionNamingConventionJS
export function defineConfigurableDerivedProperty (prototype, propertyName, derivation) {
  pre(function () { return !!prototype && !isPrimitive(prototype) })
  pre(function () { return typeOf(propertyName) === 'string' })
  pre(function () { return typeOf(derivation) === 'function' })

  Object.defineProperty(
    prototype,
    propertyName,
    {
      configurable: true,
      enumerable: true,
      get: derivation,
      set: undefined
    }
  )
}

export function defineFrozenDerivedProperty (prototype, propertyName, derivation) {
  pre(function () { return !!prototype && !isPrimitive(prototype) })
  pre(function () { return typeOf(propertyName) === 'string' })
  pre(function () { return typeOf(derivation) === 'function' })

  Object.defineProperty(
    prototype,
    propertyName,
    {
      configurable: false,
      enumerable: true,
      get: derivation,
      set: undefined
    }
  )
}

// noinspection FunctionNamingConventionJS
export function defineFrozenReadOnlyArrayProperty (prototype, propName, privatePropName) {
  pre(function () { return !isPrimitive(prototype) })
  pre(function () { return typeOf(propName) === 'string' })
  pre(function () { return typeOf(privatePropName) === 'string' })
  pre(function () { return propName !== privatePropName })

  defineFrozenDerivedProperty(
    prototype,
    propName,
    function () { return this[privatePropName].slice() }
  )
}

export function isFrozenOwnProperty (obj, propName) {
  pre(function () { return obj !== null && obj !== undefined })

  const descriptor = Object.getOwnPropertyDescriptor(obj, propName)
  return descriptor &&
         descriptor.enumerable === true &&
         descriptor.configurable === false &&
         (descriptor.writable === false || (typeOf(descriptor.get) === 'function' && !descriptor.set))
}

export function nrOfLines (str) {
  return ('' + str).split(this.eol).length
}

/**
 * <code>location</code> is a stack line location, that refers to code that is not inside this library,
 * and does not refer to native code. Native code is defined as a location that does not contain a &quot;/&quot;.
 * The latter is only relevant on node. This is not an issue in browsers.
 */
export function isALocationOutsideLibrary (location) {
  if (typeOf(location) !== 'string') {
    return false
  }
  const lines = location.split(eol)
  return lines.length === 1 &&
         stackLocation.test(lines[0]) &&
         lines[0].indexOf(dirSeparator) >= 0 &&
         lines[0].indexOf(this.contractLibPath) < 0
}

/**
 * The first line from a stack trace created here that refers to code that is not inside this library,
 * and does not refer to native code. Returns the empty string if no such line is found.
 *
 * When this result is used as a line on its own, it is clickable to navigate to the referred source code
 * in most consoles.
 */
export function firstLocationOutsideLibrary () {
  const stackSource = new Error()
  const messageLines = stackSource.toString()
  let nrOfMessageLines = 0
  let stack = stackSource.stack

  if (stack.indexOf(messageLines) === 0) {
    nrOfMessageLines = nrOfLines(messageLines) // skip these
  }
  stack = stack.split(this.eol)
  for (let i = nrOfMessageLines; i < stack.length; i++) {
    // skip the message lines, and then look for the first line that refers to code not in this library,
    // that is not native code (i.e., the reference does contain a dirSeparator)
    if (stack[i].indexOf(dirSeparator) >= 0 && stack[i].indexOf(this.contractLibPath) < 0) {
      return stack[i]
    }
  }
  return '' // could not find a line outside this library
}

/**
 * Input an error, and transform its stack so it only contains lines that refer to
 * code outside this library, and not to native code. The initial name and message is removed,
 * taking into account that the message could be multi-line.
 */
export function stackOutsideThisLibrary (error) {
  pre(function () { return error instanceof Error })
  pre(function () { return !!error.stack })

  let nrOfMessageLines = 0
  const stack = error.stack
  const messageLines = error.toString()
  if (stack.indexOf(messageLines) === 0) {
    nrOfMessageLines = nrOfLines(messageLines) // skip these
  }
  let foundALineOutsideTheLibrary = false
  const result = error.stack
    .split(eol)
    .splice(nrOfMessageLines) // everything after the message lines
    .reduce(
      (acc, line) => {
        if (!foundALineOutsideTheLibrary && line.indexOf(contractLibPath) < 0 && line.indexOf(dirSeparator >= 0)) {
          // we found the first line of code not in this library and not native code
          foundALineOutsideTheLibrary = true
        }
        if (line && line.indexOf(contractLibPath) < 0 && (line.indexOf(dirSeparator) >= 0 || foundALineOutsideTheLibrary)) {
          // copy the lines not referring to this library that are not referring to
          // native code, and the lines that are referring to native code once we encountered the first line
          // of non-native code that refers to code outside this library, if the are not empty
          acc.push(line)
        }
        return acc
      },
      []
    )
  return result.join(eol)
}

export const maxLengthOfConciseRepresentation = 80
export const lengthOfEndConciseRepresentation = 15
export const conciseSeparator = ' … '

/**
 * Returns a concise representation of <code>f</code> to be used in output.
 */
export function conciseConditionRepresentation (prefix, f) {
  pre(function () { return typeOf(prefix) === 'string' })

  let result = (f && f.displayName) || (prefix + ' ' + ((f && f.name) || f))
  result = result.replace(/\s\s+/g, ' ')
  if (maxLengthOfConciseRepresentation < result.length) {
    const startLength = maxLengthOfConciseRepresentation - lengthOfEndConciseRepresentation - conciseSeparator.length
    const start = result.slice(0, startLength)
    const end = result.slice(-lengthOfEndConciseRepresentation)
    result = start + conciseSeparator + end
  }
  return result
}

/**
 * <p>Returns a moderately normalized extensive, multi-line representation of a <em>thrown</em>.
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
 *   <em>thrown</em> is added in the front on a separate line.
 */
export function extensiveThrownRepresentation (thrown) {
  const thrownString = '' + thrown
  let stack = thrown && thrown.stack
  if (!stack) {
    return thrownString
  }
  stack = '' + stack // make sure it is a string
  /* On node and chrome, the stack starts with thrown.toString (name and message).
     On safari and FF, it doesn't: thrown.stack it is the pure stack. We add the toString ourselves */
  return (stack.indexOf(thrownString) === 0) ? stack : (thrownString + this.eol + stack)
}
