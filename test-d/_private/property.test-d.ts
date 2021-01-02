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

import { expectAssignable, expectError, expectNotType, expectType } from 'tsd'
import { setAndFreeze } from '../../lib/_private/property'

const aNumber = 3543
const aString = ' a string'
const anotherNumber = 523
let something1 = {}
const newPropName = 'a new property'
let something2 = {
  aProperty: 'a property value',
  anotherProperty: true
}

expectType<{}>(something1)
setAndFreeze(something1, newPropName, aNumber)
expectNotType<{}>(something1)
expectType<{ readonly "a new property": number; }>(something1)
expectAssignable<{}>(something1)
expectType<number>(something1[newPropName])
expectError(something1[newPropName] = anotherNumber)
