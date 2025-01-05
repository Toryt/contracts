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

import { rn as rnEOL, n as nEOL, stack as stackEOL } from './eol.ts'
import { notStrictEqual } from 'assert'

const anArgumentsToString: string = (function (): string {
  return Object.prototype.toString.call(arguments)
})()

// MUDO rename functions to `is…`

export function functionArguments(a: unknown): a is IArguments {
  /* NOTE: It is hard to determine whether something is an `arguments`, and it has become harder still since we have
             Symbols. This solution is derived from
             https://stackoverflow.com/questions/7656280/how-do-i-check-whether-an-object-is-an-arguments-object-in-javascript/7656333#7656333 */
  return Object.prototype.toString.call(a) === anArgumentsToString
}

/**
 * p is a true primitive, i.e., not null, undefined, an object (which implies, not a Date, Math or JSON, nor any
 * Error, and not an array or arguments, and wrapped primitives), not a function. p is a true string, number or
 * boolean.
 */
export function primitive(p: unknown): p is number | string | boolean {
  return p !== null && ['number', 'string', 'boolean'].indexOf(typeof p) >= 0
}

/**
 * <code>location</code> is a stack line location.
 *
 * Over Node, cross-platform, and different browsers, we can only say this has to be a none-empty string, that is not
 * multi-line.
 *
 * It does not always end with a line number and column number (native code), it does not always start with 'at'
 * (Firefox), …
 */
export function stackLocation(location: unknown): location is string {
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
export function stack(stack: unknown): stack is string {
  const lines = !!stack && typeof stack === 'string' && stack.split(stackEOL)
  return lines && lines.length > 0 && lines.every(l => stackLocation(l))
}

export type NotNullAndNotUndefined<T = unknown> = T extends null ? never : T extends undefined ? never : T

export function frozenOwnProperty(obj: NotNullAndNotUndefined, propName: string): boolean | undefined {
  notStrictEqual(obj, null)
  notStrictEqual(obj, undefined)

  const descriptor = Object.getOwnPropertyDescriptor(obj, propName)
  return (
    descriptor &&
    descriptor.enumerable === true &&
    descriptor.configurable === false &&
    (descriptor.writable === false || (typeof descriptor.get === 'function' && !descriptor.set))
  )
}
