/*
  Copyright 2016 - 2020 by Jan Dockx

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

import type {Stack} from "./is";
import * as assert from "assert";
import {stack as stackEOL} from "./eol";

/* Chrome limits the number of frames in a stack trace to 10 by default.
   https://github.com/v8/v8/wiki/Stack-Trace-API
   This changes overrides that limit. Other browsers do not limit. */
Error.stackTraceLimit = Number.POSITIVE_INFINITY;

function determineSkipsForEach (): boolean {
  try {
    const array: Array<number> = [1];
    array.forEach(() => {
      throw new Error('Dummy error to check occurrence of forEach in stack trace');
    });
    return false; // make compiler happy
  } catch (err) {
    return err.stack.indexOf('forEach') < 0;
  }
}

function relevantStackLines(): Array<string> | undefined {
  const stackSource: Error = new Error();
  const stackSourceStack: string | undefined = stackSource.stack;
  if (!stackSourceStack) {
    return undefined;
  }
  const stackLines: Array<string> = stackSourceStack.split(stackEOL);
  // most environments add the stackSource.toString() at the beginning of the stack; Firefox does not
  const stackSourceStr: string = stackSource.toString();
  if (stackLines[0].startsWith(stackSourceStr)) {
    stackLines.shift();
  }
  return stackLines;
}

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
export function location (depth?: number): string {
  assert(!depth || Number.isInteger(depth), 'optional depth is an integer');
  assert(!depth || depth >= 0, 'optional depth is positive');

  const stackLines: Array<string> | undefined = relevantStackLines();
  if (!stackLines) {
    return '    ⚠︎ location could not be determined (no stack) ⚠';
  }
  /* Return the line at 2 + (depth || 0) (2 = this function and relevantStackLines())
     Since Safari skips stack frames, this might not work in Safari.
     There will however be at least 1 element in stack frames.
     The Math.min protects this call for safari for array out of bounds problems.
     This returns a technical result (a string), without real semantic meaning.
     Furthermore, when used via Web Driver, that stack is again quite different in Safari, and contains many empty
     lines. A warning string is returned: there is nothing we can do. */
  return (
    stackLines[Math.min(2 + (depth || 0), stackLines.length - 1)] ||
    /* istanbul ignore next: only in Safari via Web Driver */
    '    ⚠︎ location could not be determined (happens in Safari, when used with remote commands) ⚠'
  );
}

/**
 * The stack lines from the (depth + 1)nd down, from a stack trace created here, after the `toString()`
 * (the `toString()` might prepended to the stack). This is a multi-line string, with at least 1 line.
 *
 * Some platforms (notably, Chrome since version 73.0.3683.75) do not mention the internal Promise code, calling
 * a continuation asynchronously in the stack. In that case, when a stack is created in Promise resolution code,
 * there are no stack lines after `depth` down. We return a string indicating this.
 *
 * Note that in Safari, the result cannot be trusted. Safari skips (optimized?) stack frames. In Safari, this
 * will return 'a' stack, but not necessarily a semantic meaningful one.
 */
export function raw (depth?: number): Stack {
  assert(!depth || Number.isInteger(depth), 'optional depth is an integer');
  assert(!depth || depth >= 0, 'optional depth is positive');

  const stackLines: Array<string> | undefined = relevantStackLines();
  if (!stackLines) {
    return '    ⚠︎ location could not be determined (no stack) ⚠';
  }
  const filteredStackLines: Array<string> = stackLines.filter((sl: string): boolean => !!sl); // Firefox has empty lines (at the end)
  /* Return the lines after 2 + (depth || 0) (2 = this function and relevantStackLines())
     Since Safari skips stack frames, this might not work in Safari.
     There will however be at least 1 element in stack frames.
     The Math.min protects this call for safari for array out of bounds problems.
     This returns a technical result (a string), without real semantic meaning.
     We cannot use splice, because that requires deleteCount to be > 0.
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice */
  const firstToKeep: number = 2 + (depth || 0);
  /*  Since Safari skips stack frames, this might not work in Safari. There will however be at least 1 element in
      stack frames. In Chrome (since v73), the Promise code that calls resolutions does not appear in the stack.
      For violations triggered in Promise resolutions, the stack is only `depth` deep. In those cases, we
      just return the line '[[internal]]'. */
  if (firstToKeep >= filteredStackLines.length) {
    return '[[internal]]';
  }
  const relevant: Array<string> = filteredStackLines.slice(firstToKeep);
  return relevant.join(stackEOL);
}

/**
 * Boolean that says whether or not this platform skips forEach stack frames in an Error stack.
 * Firefox does. Node, Chrome, Safari do not.
 */
export const skipsForEach: boolean = determineSkipsForEach();
