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
import { nEOL, rnEOL, stackEOL } from './eol.ts'
import { hasProperty } from './property.ts'

/* Chrome limits the number of frames in a stack trace to 10 by default.
   https://github.com/v8/v8/wiki/Stack-Trace-API
   This changes overrides that limit. Other browsers do not limit. */
Error.stackTraceLimit = Number.POSITIVE_INFINITY

function createStackLines(): string[] {
  const stackSource = new Error()
  // most environments add the stackSource.toString() at the beginning of the stack; Firefox does not
  const stackSourceStr = stackSource.toString()

  assert('stack' in stackSource) // not part of the standard, but this is true in all relevant environments
  const stack = stackSource.stack.replace(stackSourceStr + stackEOL, '')

  return stack.split(stackEOL)
}

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
     description explains this in the context of `location()`.

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

/**
 * The stack lines from the (depth + 1)nd down, from a stack trace created here, after the `toString()`
 * (the `toString()` might be prepended to the stack). This is a multi-line string, with at least 1 line.
 *
 * Some platforms (notably, Chrome since version 73.0.3683.75) do not mention the internal Promise code, calling
 * a continuation asynchronously in the stack. In that case, when a stack is created in Promise resolution code,
 * there are no stack lines after `depth` down. We return a string indicating this.
 *
 * Note that in Safari, the result cannot be trusted. Safari skips (optimized?) stack frames. In Safari, this
 * will return 'a' stack, but not necessarily a semantic meaningful one.
 */
export function rawStack(depth?: number): string {
  assert(!depth || Number.isInteger(depth), 'optional depth is an integer')
  assert(!depth || depth >= 0, 'optional depth is positive')

  const stackLines = createStackLines().filter(sl => !!sl) // Firefox has empty lines (at the end)
  /* Return the lines after 2 + (depth || 0)
     Since Safari skips stack frames, this might not work in Safari.
     There will however be at least 1 element in stack frames.
     The Math.min protects this call for safari for array out of bounds problems.
     This returns a technical result (a string), without real semantic meaning.
     We cannot use splice, because that requires deleteCount to be > 0.
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice */
  const firstToKeep = 2 + (depth || 0)
  /*  Since Safari skips stack frames, this might not work in Safari. There will however be at least 1 element in
      stack frames. In Chrome (since v73), the Promise code that calls resolutions does not appear in the stack.
      For violations triggered in Promise resolutions, the stack is only `depth` deep. In those cases, we
      just return the line '[[internal]]'. */
  if (firstToKeep >= stackLines.length) {
    return '[[internal]]'
  }
  const relevant = stackLines.slice(firstToKeep)
  return relevant.join(stackEOL)
}

function determineSkipsForEach(): boolean {
  try {
    const array = [1]
    array.forEach(() => {
      throw new Error('Dummy error to check occurrence of forEach in stack trace')
    })
    return false // unreachable code
  } catch (err: unknown) {
    // not part of the standard, but this is true in all relevant environments
    assert(hasProperty(err, 'stack'))
    const stack = err.stack as string
    return stack.indexOf('forEach') < 0
  }
}

/**
 * Boolean that says whether this platform skips forEach stack frames in an Error stack.
 * Firefox does. Node, Chrome, Safari do not.
 */
export const stackSkipsForEach: boolean = determineSkipsForEach()

/**
 * <code>location</code> is a stack line location.
 *
 * Over Node, cross-platform, and different browsers, we can only say this has to be a none-empty string, that is not
 * multi-line.
 *
 * It does not always end with a line number and column number (native code), it does not always start with 'at'
 * (Firefox), …
 */
export function isStackLocation(location: unknown): location is string {
  return !!location && typeof location === 'string' && location.indexOf(rnEOL) < 0 && location.indexOf(nEOL) < 0
}

/**
 * <code>stack</code> is a stack.
 *
 * Over Node, cross-platform, and different browsers, we can only say this has to be a none-empty, multi-line string,
 * with at least 1 line, and no empty lines.
 *
 * Lines do not always end with a line number and column number (native code), do not always start with 'at'
 * (Firefox), …
 */
export function isStack(stack: unknown): stack is string {
  const lines = !!stack && typeof stack === 'string' && stack.split(stackEOL)
  return lines && lines.length > 0 && lines.every(l => isStackLocation(l))
}
