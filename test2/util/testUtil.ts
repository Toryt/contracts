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

import should from 'should'

export function regExpEscape(s: string): string {
  // http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

export function anyCasesGenerators(discriminator: string): (() => unknown)[] {
  // noinspection JSPrimitiveTypeWrapperUsage
  const generators = [
    (): Error => new Error('This is a ' + discriminator + ' case'),
    (): undefined => undefined,
    (): null => null,
    (): number => 1,
    (): number => 0,
    (): string => 'a string that is used as a ' + discriminator,
    (): string => '',
    (): boolean => true,
    (): boolean => false,
    (): Date => new Date(),
    (): RegExp => /foo/,
    (): (() => string) =>
      function (): string {
        return 'this simulates a ' + discriminator
      },
    // eslint-disable-next-line no-new-wrappers
    (): Number => new Number(42),
    // eslint-disable-next-line no-new-wrappers
    (): Boolean => new Boolean(false),
    // eslint-disable-next-line no-new-wrappers
    (): String => new String(discriminator + ' string'),
    (): IArguments => arguments,
    (): {} => ({}),
    (): { a: number; b: string; c: {}; d: { d1: undefined; d2: string; d3: { d31: number } } } => ({
      a: 1,
      b: 'b',
      c: {},
      d: { d1: undefined, d2: 'd2', d3: { d31: 31 } }
    }),
    (): [] => []
  ]
  const result = generators.slice()
  result.push(() => generators.map(g => g()))
  return result
}

function trimLineAndColumnPattern(stackLine: string): string {
  return (
    stackLine
      // node, chrome
      .replace(/:\d*:\d*\)$/, ')')
      // other browsers
      .replace(/:\d*:\d*$/, '')
  )
}

export function mustBeCallerLocation(actual: unknown, expected: unknown): void {
  should(expected).be.a.String()
  trimLineAndColumnPattern(expected as string).should.equal(trimLineAndColumnPattern(actual as string))
}
