/*
 Copyright 2021 - 2021 by Jan Dockx

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

import { StackLocation } from './is'

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
export function location(depth?: number): StackLocation;

// noinspection FunctionNamingConventionJS
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
export function raw(depth?: number): string;

/**
 * Boolean that says whether or not this platform skips forEach stack frames in an Error stack.
 * Firefox does. Node, Chrome, Safari do not.
 */
export const skipsForEach: boolean;
