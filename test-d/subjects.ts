/*
 Copyright 2020 - 2020 by Jan Dockx

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

interface SomeObject {
  aProperty: number
}

export type AFunction1 = (this: SomeObject, a: string, b: number) => string
export function aFunction1 (this: SomeObject, a: string, b: number): string { return this.aProperty + a + b }

export type AFunction2 = (a: string, b: number) => string
export const aFunction2: AFunction2 = function aFunction2 (a, b) { return `${a}${b} more text` }

export type AFunction3 = (a: string) => 'truth' | 'dare'
export const aFunction3: AFunction3 = function aFunction3 (a) { return a > 'm' ? 'truth' : 'dare' }

export class ANewableFunction {
  constructor(a: string, b: number) {}
}
