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

import { expectError, expectType } from 'tsd'
import {
  conciseCondition,
  conciseSeparator, extensiveThrown,
  lengthOfEndConciseRepresentation,
  maxLengthOfConciseRepresentation,
  namePrefix, type, value
} from '../../lib/_private/report'

class AClass {
  prop: number | object
  constructor(a: number, b: boolean) {
    this.prop = b ? a : {}
  }
}

expectType<number>(maxLengthOfConciseRepresentation)
expectType<number>(lengthOfEndConciseRepresentation)
expectType<string>(conciseSeparator)
expectType<'𝕋⚖️'>(namePrefix)

expectType<string>(conciseCondition('a prefix', function () { return new Date() }))
expectError(conciseCondition({}, function () { return new Date() }))
expectError(conciseCondition('a prefix', {name : 'a name' }))
expectType<string>(conciseCondition('a prefix', function named () {}))
expectType<string>(conciseCondition('a prefix', (a: string, b: number) => b > 5 ? a : false))
expectType<string>(conciseCondition('a prefix', AClass))

const aNumber = 5345
const aString = 'a string'
const args = (function () { return arguments })()

expectType<'undefined'>(type(undefined))
expectType<'null'>(type(null))
expectType<'symbol'>(type(Symbol('a symbol')))
expectType<'number'>(type(aNumber))
expectType<'string'>(type(aString))
expectType<'boolean'>(type(true))
expectType<'boolean'>(type(false))
expectType<'Math'>(type(Math))
expectType<'JSON'>(type(JSON))
expectType<'arguments'>(type(args))
expectType<'Function'>(type((a: string, b: number) => b > 5 ? a : false))
expectType<'Function'>(type(AClass))
expectType<string>(type({}))
expectType<string>(type(new AClass(aNumber, false)))
expectType<string>(type(new Date()))
expectType<string>(type(aNumber as any))
expectType<string>(type(aNumber as unknown))

expectType<string>(value(undefined))
expectType<string>(value(null))
expectType<string>(value(Symbol('a symbol')))
expectType<string>(value(aNumber))
expectType<string>(value(aString))
expectType<string>(value(true))
expectType<string>(value(false))
expectType<string>(value(Math))
expectType<string>(value(JSON))
expectType<string>(value(args))
expectType<string>(value((a: string, b: number) => b > 5 ? a : false))
expectType<string>(value(AClass))
expectType<string>(value({}))
expectType<string>(value(new AClass(aNumber, false)))
expectType<string>(value(new Date()))
expectType<string>(value(aNumber as any))
expectType<string>(value(aNumber as unknown))

expectType<string>(extensiveThrown(new Error()))
expectType<string>(extensiveThrown('not an error'))
