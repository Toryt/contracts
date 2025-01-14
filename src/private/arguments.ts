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

const anArgumentsToString: string = (function (): string {
  return Object.prototype.toString.call(arguments)
})()

export function isFunctionArguments(a: unknown): a is IArguments {
  /* NOTE: It is hard to determine whether something is an `arguments`, and it has become harder still since we have
             Symbols. This solution is derived from
             https://stackoverflow.com/questions/7656280/how-do-i-check-whether-an-object-is-an-arguments-object-in-javascript/7656333#7656333 */
  return Object.prototype.toString.call(a) === anArgumentsToString
}