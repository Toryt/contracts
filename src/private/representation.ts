/*
  Copyright 2016–2025 Jan Dockx

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

import { strictEqual } from 'assert'
import { inspect } from 'node:util'
import { isFunctionArguments } from './arguments.ts'
import { isTruePrimitive } from '../types/typeof.ts'
import { stackEOL } from './eol.ts'

function surroundForArray(s: unknown, result: string, surroundString: boolean): string {
  return Array.isArray(s) ? `[${result}]` : surroundString && typeof s === 'string' ? `'${result}'` : result
}

/**
 * Returns “a” `string` without crashing for anything. The intention is to return the defined `string` representation of
 * the given `s` when possible. Arrays are surrounded with `[…]`. When `surroundString` is `true` strings are surrounded
 * with `'…'`. This makes it possible to recognize empty arrays and strings.
 */
export function safeToString(s: unknown, surroundString: boolean = false): string {
  try {
    return surroundForArray(s, String(s), surroundString)
  } catch (ignore) {
    /* `s` probably contains a `Symbol` deep down. But, whatever: revert to the most basic string representation: */
    return surroundForArray(s, Object.prototype.toString.call(s), surroundString)
  }
}

export const maxLengthOfConciseRepresentation = 80
export const lengthOfEndConciseRepresentation = 15
export const conciseSeparator = ' … '
// MUDO namePrefix belongs somewhere else
export const namePrefix = '𝕋📜'

/**
 * `x` is an object (something that can have a property), and has a property with the given name, of any type.
 */
export function hasProperty<X extends unknown, PropertyName extends string>(
  x: X,
  propertyName: PropertyName
): x is X & { [P in PropertyName]: unknown } {
  strictEqual(typeof propertyName, 'string')

  return ((typeof x === 'object' && x !== null) || typeof x === 'function') && propertyName in x
}

/**
 * Returns a concise representation of `f` to be used in output with a `prefix`.
 *
 * This is intended to represent a function in a concise way, but since this is used in reporting errors, it must never
 * fail, and deal with any input for `f`.
 *
 * The representation is single-line, and has a {@link maxLengthOfConciseRepresentation maximum length}.
 *
 * @param prefix - a string prefixed to a concise representation of `f`
 * @param f - anything; intended to be a function, with or without a `name`
 * @returns If `f` exists and has a `name`, the representation is based on the `name`. If `f` does not have a `name`,
 *          the representation is based on the string representation of `f` itself.
 */
export function conciseRepresentation(prefix: string, f: unknown): string {
  strictEqual(typeof prefix, 'string')

  const optionalName: string | undefined = hasProperty(f, 'name') ? safeToString(f.name) : undefined
  let result = prefix + ' ' + (optionalName !== undefined && optionalName !== '' ? optionalName : safeToString(f, true))
  result = result.replace(/[\r\n]/g, ' ').replace(/\s\s+/g, ' ')
  if (maxLengthOfConciseRepresentation < result.length) {
    const startLength = maxLengthOfConciseRepresentation - lengthOfEndConciseRepresentation - conciseSeparator.length
    const start = result.slice(0, startLength)
    const end = result.slice(-lengthOfEndConciseRepresentation)
    result = start + conciseSeparator + end
  }
  // when `prefix` is `''`, `trim` will remove the extra space in front
  return result.trim()
}

/**
 * Return a string that is a human-readable description of the type of `v`, as good as possible
 */
export function typeRepresentation(v: unknown): string {
  return typeof v !== 'object'
    ? typeof v
    : v === null
      ? 'null'
      : v === Math
        ? 'Math'
        : v === JSON
          ? 'JSON'
          : v === Reflect
            ? 'Reflect'
            : v === Atomics
              ? 'Atomics'
              : v === Intl
                ? 'Intl'
                : v === WebAssembly
                  ? 'WebAssembly'
                  : isFunctionArguments(v)
                    ? 'arguments'
                    : v.constructor.name
}

export function valueRepresentation(v: unknown): string {
  if (v === global) {
    /* browserified util.inspect has trouble with Safari Window; this works around this by showing a concise
       representation of this complex object */
    return '{global}'
  } else if (typeof v === 'string' || v instanceof String) {
    return `'${v}'`
  } else if (
    isTruePrimitive(v) ||
    v instanceof Date ||
    v instanceof Error ||
    v instanceof Number ||
    v instanceof Boolean
  ) {
    return safeToString(v)
  } else if (typeof v === 'function') {
    return conciseRepresentation('', v)
  } else {
    try {
      // NOTE: inspect cannot deal with a symbol name: https://github.com/nodejs/node/issues/56570
      return inspect(v, { depth: 0, maxArrayLength: 5, breakLength: 120 })
    } catch (err: unknown) /* istanbul ignore next */ {
      /* There are several libraries that we might use that make util.inspect fail on circular data structures,
         notably in unit test frameworks. That sometimes results in false positives.
         Some issues are created:
         - https://github.com/Wizcorp/mocha-reporter/issues/5
         - https://youtrack.jetbrains.com/issue/WEB-39186
         This catch is here to protect ourselves from false positives, whenever this fails.

         This can no longer be tested, because with ES Modules, we cannot stub util.inspect like we could with
         `require`. See, e.g., https://stackoverflow.com/a/68299987.

         Also note that the issues mentioned above have been fixed by now. */
      return `${namePrefix} [[failed to represent the value]] (${(hasProperty(err, 'message') && err.message) || err})`
    }
  }
}

/**
 * Returns a moderately normalized extensive, multi-line representation of a _thrown_.
 *
 * Anything can be thrown, not only `Error` instances.
 *
 * The stack of an {@link Error} is different in different environments. In Node and Chrome, the first line of the stack
 * is the {@link Error.toString()} of the {@link Error}, followed by the true stack, one call per line, that starts with
 * `/^    at/`, followed by the path of the file where the call was made. In Firefox and Safari, the stack only contains
 * the true stack, and the lines are the name of the called function (or the empty string for anonymous functions),
 * followed by `@`, and the path of the file where the call was made.
 *
 * * If the _thrown_ does not have a `stack` property, its standard string representation is returned.
 *
 * * If the _thrown_ does have a `stack` property, its stack is returned. If the stack starts with the string
 *   representation of the _thrown_, that's it. Otherwise, the string representation of the _thrown_ is added in the
 *   front on a separate line.
 */
export function extensiveThrownRepresentation(thrown: unknown): string {
  const thrownString = valueRepresentation(thrown)

  if (!hasProperty(thrown, 'stack')) {
    return thrownString
  }

  const stackString = safeToString(thrown.stack)
  /* In Node and Chrome, the stack starts with `thrown.toString` (name and message). In Safari and FF, it doesn't:
     `thrown.stack` it is the pure stack. We add the `toString` ourselves. */
  return stackString.startsWith(thrownString) ? stackString : thrownString + stackEOL + stackString
}
