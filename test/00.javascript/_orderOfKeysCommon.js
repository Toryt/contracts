/*
  Copyright 2015–2024 Jan Dockx

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

'use strict'

const randomString = require('just.randomstring')

function randomName(/* Number */ n) {
  const nString = '$$' + n + '$$'
  return randomString() + nString
}

function nFromRandomName(/* String */ str) {
  return Number.parseInt(/\$\$(\d+)\$\$/.exec(str)[1])
}

function prepareAnObject(/* Number */ startValue, /* Number */ nrOfProperties) {
  const max = startValue + nrOfProperties
  const o = {}
  for (let i = startValue; i < max; i++) {
    o[randomName(i)] = i
  }
  return o
}

function prepareAnObjectWithAProto() {
  // noinspection MagicNumberJS
  const oProto1 = prepareAnObject(200, 10)
  // noinspection MagicNumberJS
  const oProto2 = prepareAnObject(100, 10)
  Object.setPrototypeOf(oProto2, oProto1)
  const o = prepareAnObject(0, 10)
  Object.setPrototypeOf(o, oProto2)
  return o
}

const objectLiteral = {
  realFirst$$0$$: new Date(),
  first$$1$$: null,
  second$$2$$: 4,
  third$$3$$: undefined, // will not be stringified
  fourth$$4$$: function () {} // will not be stringified
}

module.exports = {
  prepareAnObject: prepareAnObject,
  nFromRandomName: nFromRandomName,
  prepareAnObjectWithAProto: prepareAnObjectWithAProto,
  objectLiteral: objectLiteral
}
