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

import {notStrictEqual} from "assert";
import {stack as stackEOL, rn, n} from "./eol";

const anArgumentsToString: string = (function (): string {
  return Object.prototype.toString.call(arguments);
})();

export function functionArguments(this:void, a: any): a is IArguments {
  /* NOTE: It is hard to determine whether something is an `arguments`, and it has become harder still since we have
           Symbols. This solution is derived from
           https://stackoverflow.com/questions/7656280/how-do-i-check-whether-an-object-is-an-arguments-object-in-javascript/7656333#7656333 */
  return Object.prototype.toString.call(a) === anArgumentsToString;
}

/**
 * p is a true primitive, i.e., not null, undefined, an object (which implies, not a Date, Math or JSON, nor any
 * Error, and not an array or arguments, and wrapped primitives), not a function. p is a true string, number or
 * boolean.
 */
export function primitive(this:void, p: any): p is number | string | boolean {
  return p !== null && ['number', 'string', 'boolean'].indexOf(typeof p) >= 0;
}

export type StackLocation = string;

/**
 * <code>location</code> is a stack line location.
 *
 * Over Node, cross-platform, and different browsers, we can only say this has to be a none-empty string, that is not
 * multi-line.
 *
 * It does not always end with a line number and column number (native code), it does not always start with 'at'
 * (Firefox), …
 */
export function stackLocation(this:void, location: any): location is StackLocation {
  return !!location && typeof location === 'string' && location.indexOf(rn) < 0 && location.indexOf(n) < 0;
}

export type Stack = string;

/**
 * <code>stack</code> is a stack.
 *
 * Over Node, cross-platform, and different browsers, we can only say this has to be a none-empty, multi-line string,
 * with at least 1 line, and no empty lines.
 *
 * Lines do not always end with a line number and column number (native code), do not always start with 'at'
 * (Firefox), …
 */
export function stack(this:void, stack: any): stack is Stack {
  const lines = !!stack && typeof stack === 'string' && stack.split(stackEOL);
  return lines && lines.length > 0 && lines.every(l => stackLocation(l));
}

export function frozenOwnProperty(this:void, obj: object, propName: PropertyKey): boolean {
  notStrictEqual(obj, null);
  notStrictEqual(obj, undefined);

  const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, propName);

  return (
    !!descriptor &&
    descriptor.enumerable === true &&
    descriptor.configurable === false &&
    (descriptor.writable === false || (typeof descriptor.get === 'function' && !descriptor.set))
  );
}