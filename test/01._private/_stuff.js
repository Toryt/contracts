/*
 Copyright 2015 - 2020 by Jan Dockx

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

/* eslint-env mocha */

'use strict'

// eslint-disable-next-line
const getGlobal = new Function('return this;')

function generateMutableStuff () {
  // noinspection JSPrimitiveTypeWrapperUsage
  const result = [
    { subject: { a: 4 }, expected: 'object' },
    { subject: [1, 2, 3], expected: 'array' },
    { subject: function () {}, expected: 'function' },
    { subject: () => 0, expected: 'function' },
    { subject: new ReferenceError(), expected: 'error' },
    { subject: new Date(), expected: 'date' },
    { subject: /a-z/, expected: 'regexp' },
    // eslint-disable-next-line
    { subject: new Number(4), expected: 'number' },
    // eslint-disable-next-line
    { subject: new String('abc'), expected: 'string' },
    // eslint-disable-next-line
    { subject: new String(''), expected: 'string' },
    // eslint-disable-next-line
    { subject: new Boolean(true), expected: 'boolean' },
    { subject: arguments, expected: 'arguments' }
  ]
  result.forEach(r => {
    r.isPrimitive = false
  })
  return result
}

// noinspection JSPrimitiveTypeWrapperUsage
const stuff = [
  { subject: undefined, expected: 'undefined', isPrimitive: false },
  { subject: null, expected: 'null', isPrimitive: false },
  { subject: Math, expected: 'math', isPrimitive: false },
  { subject: JSON, expected: 'json', isPrimitive: false },
  { subject: 'abc', expected: 'string', isPrimitive: true },
  { subject: '', expected: 'string', isPrimitive: true },
  { subject: 4, expected: 'number', isPrimitive: true },
  { subject: false, expected: 'boolean', isPrimitive: true },
  { subject: getGlobal(), expected: 'object', isPrimitive: false }
].concat(generateMutableStuff())

// noinspection JSUndefinedPropertyAssignment
stuff.generateMutableStuff = generateMutableStuff

module.exports = stuff
