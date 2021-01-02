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
import { configurableDerived, frozenDerived, frozenReadOnlyArray, setAndFreeze } from '../../lib/_private/property'

const aNumber = 3543
const aString = 'a string'
const anotherNumber = 523
let something1 = {}
const newPropName1 = 'a new property 1'
let something2 = {
  aProperty: 'a property value',
  anotherProperty: true
}
const newPropName2 = 'a new property 2'
interface Something3 {
  _privateArray: ReadonlyArray<typeof aNumber | typeof aString>
}
let something3: Something3 = {
  _privateArray: [aNumber, aString]
}

expectType<{}>(something1)
setAndFreeze(something1, newPropName1, aNumber)
expectNotType<{}>(something1)
expectType<{ readonly "a new property 1": number; }>(something1)
expectAssignable<{}>(something1)
expectType<number>(something1[newPropName1])
expectError(something1[newPropName1] = anotherNumber)

expectType< { aProperty: string; anotherProperty: boolean; }>(something2)
configurableDerived(
  something2,
  newPropName1,
  function () { return this.anotherProperty ? this.aProperty : aNumber}
)
expectNotType<{}>(something2)
expectType<{ aProperty: string; anotherProperty: boolean; } & { readonly "a new property 1": string | typeof aNumber; }>(something2)
expectAssignable<{}>(something2)
expectAssignable<string | number>(something2[newPropName1])
expectType<string | typeof aNumber>(something2[newPropName1])
expectError(something2[newPropName1] = anotherNumber)

frozenDerived(
  something2,
  newPropName2,
  function () { return this.anotherProperty ? true : this.aProperty}
)
expectNotType<{ aProperty: string; anotherProperty: boolean; } & { readonly "a new property 1": string | typeof aNumber; }>(something2)
expectType<{ aProperty: string; anotherProperty: boolean; } & { readonly "a new property 1": string | typeof aNumber; } & { readonly "a new property 2": string | true; }>(something2)
expectAssignable<{}>(something2)
expectAssignable<string | boolean>(something2[newPropName2])
expectType<string | true>(something2[newPropName2])
expectError(something2[newPropName2] = false)

expectType<Something3>(something3)
frozenReadOnlyArray(something3, 'publicArray',  '_privateArray')
expectNotType<Something3>(something3)
expectType<Something3 & { readonly publicArray: (typeof aNumber| typeof aString)[]; }>(something3)
expectAssignable<Something3>(something3)
expectAssignable<Array<string | number>>(something3.publicArray)
expectType<Array<typeof aNumber| typeof aString>>(something3.publicArray)
expectError(something3.publicArray = [aString, aString])
