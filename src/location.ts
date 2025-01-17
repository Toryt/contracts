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

import assert from 'assert'
import { createStackLines, isStackLine } from './private/stack.ts'

/* Chrome limits the number of frames in a stack trace to 10 by default.
   https://github.com/v8/v8/wiki/Stack-Trace-API
   This changes overrides that limit. Other browsers do not limit. */
Error.stackTraceLimit = Number.POSITIVE_INFINITY

/**
 * The (depth + 1)nd line from a stack trace created here, after the `toString()` (the `toString()` might be prepended
 * to the stack).
 *
 * When this result is used as a line on its own, it is clickable to navigate to the referred source code
 * in most consoles.
 *
 * Note that in Safari, the result cannot be trusted. Safari skips (optimized?) stack frames. In Safari, this
 * will return 'a' stack line, but not necessarily a semantic meaningful one.
 */
export function location(depth?: number): string {
  assert(!depth || Number.isInteger(depth), 'optional depth is an integer')
  assert(!depth || depth >= 0, 'optional depth is positive')

  const stackLines = createStackLines()
  /* Return the line at 2 + (depth || 0) (because the stack is created 1 level deeper in `createStackLines()`, while the
     description explains this in the context of `location()`).

     Since Safari skips stack frames, this might not work in Safari.
     There will however be at least 1 element in stack frames.
     The Math.min protects this call for Safari for array out of bounds problems.
     This returns a technical result (a string), without real semantic meaning.
     Furthermore, when used via Web Driver, that stack is again different in Safari, and contains many empty
     lines. A warning string is returned: there is nothing we can do. */
  return (
    stackLines[Math.min(2 + (depth || 0), stackLines.length - 1)] ||
    /* istanbul ignore next: only in Safari via Web Driver */
    '    ⚠︎ location could not be determined (happens in Safari, when used with remote commands) ⚠'
  )
}

export type InternalLocation = Readonly<{
  toString: () => 'INTERNAL'
}>

/**
 * Object to be used as location for contracts and implementations that are generated inside this library.
 */
export const internalLocation: InternalLocation = Object.freeze({
  toString: function (): 'INTERNAL' {
    return 'INTERNAL'
  }
})

export type GeneralLocation = string | InternalLocation

/**
 * <code>location</code> is a stack line location.
 *
 * Over Node, cross-platform, and different browsers, we can only say this has to be a none-empty string, that is not
 * multi-line.
 *
 * It does not always end with a line number and column number (native code), it does not always start with 'at'
 * (Firefox), …
 */
export function isLocation(location: unknown): location is string {
  return isStackLine(location)
}
