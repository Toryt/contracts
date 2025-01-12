/*
  Copyright 2015–2025 Jan Dockx

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

import { inspect } from 'node:util'
import { strictEqual, notStrictEqual } from 'node:assert'

function setAndFreeze(obj, propertyName, value) {
  Object.defineProperty(obj, propertyName, {
    configurable: false,
    enumerable: true,
    writable: false,
    value
  })

  return obj
}

function buildPrimitiveStuff() {
  const base = [
    { subject: undefined, description: 'undefined' },
    { subject: 'abc', description: 'string' },
    { subject: '', description: 'empty string' },
    { subject: 0, description: 'zero (0)' },
    { subject: 1, description: 'one (1)' },
    { subject: -1, description: 'minus one (-1)' },
    { subject: 4, description: 'natural' },
    { subject: -456, description: 'negative integer' },
    { subject: Math.PI, description: 'positive float' },
    { subject: -Math.E, description: 'negative float' },
    { subject: 0.1, description: 'non-binary float' }, // 10 * 0.1 !== 1
    { subject: Number.POSITIVE_INFINITY, description: 'positive infinity' },
    { subject: Number.NEGATIVE_INFINITY, description: 'negative infinity' },
    { subject: Number.MAX_SAFE_INTEGER, description: 'max safe integer' },
    { subject: Number.MIN_SAFE_INTEGER, description: 'min safe integer' },
    { subject: Number.MAX_VALUE, description: 'max number' },
    { subject: Number.MIN_VALUE, description: 'min number' },
    { subject: Number.EPSILON, description: 'epsilon' },
    { subject: Number.NaN, description: 'NaN' },
    { subject: false, description: 'false' },
    { subject: true, description: 'true' },
    { subject: Symbol('isolated symbol as stuff'), description: 'symbol' },
    { subject: 0n, description: 'zero bigint (0n)' },
    { subject: 1n, description: 'one bigint (1n)' },
    { subject: -1n, description: 'minus one bigint (-1n)' },
    { subject: 123456789012345678901234567890n, description: 'large positive bigint' },
    { subject: -123456789012345678901234567890n, description: 'large negative bigint' },
    { subject: BigInt(Number.MAX_SAFE_INTEGER), description: 'bigint equivalent of max safe integer' },
    { subject: BigInt(Number.MIN_SAFE_INTEGER), description: 'bigint equivalent of min safe integer' }
  ]
  return base.map(s => ({ ...s, primitive: true, mutable: false }))
}
export const primitiveStuff = buildPrimitiveStuff()
export const primitiveAndNullStuff = [
  {
    subject: null,
    description: 'null',
    primitive: false,
    mutable: false
  },
  ...primitiveStuff
]
export function buildMutableStuffGenerators() {
  const base = [
    { generate: () => new Error('This is an error case'), description: 'Error' },
    { generate: () => new Date(2025, 0, 11, 14, 11, 48, 857), description: 'Date' },
    { generate: () => /foo/, description: 'RegExp' },
    {
      generate: () =>
        function () {
          return 'an anonymous function'
        },
      description: 'anonymous function'
    },
    {
      generate: () =>
        function namedFunction() {
          return 'a named function'
        },
      description: 'named function'
    },
    { generate: () => () => 'an arrow function', description: 'arrow function' },
    {
      generate: () => {
        const arrowFunction = () => 'an arrow function in a const'
        return arrowFunction
      },
      description: 'arrow function in a const'
    },
    {
      generate: () =>
        async function () {
          return 'an anonymous async function'
        },
      description: 'anonymous async function'
    },
    {
      generate: () =>
        async function asyncNamedFunction() {
          return 'an async named function'
        },
      description: 'async named function'
    },
    {
      generate: () => async () => 'an async arrow function',
      description: 'async arrow function'
    },
    {
      generate: () => {
        const asyncArrowFunction = async () => 'an async arrow function in a const'
        return asyncArrowFunction
      },
      description: 'async arrow function in a const'
    },
    // eslint-disable-next-line no-new-wrappers
    { generate: () => new Number(42), description: 'Number' },
    // eslint-disable-next-line no-new-wrappers
    { generate: () => new Boolean(false), description: 'Boolean' },
    // eslint-disable-next-line no-new-wrappers
    { generate: () => new String('string wrapper object'), description: 'String' },
    // NOTE: IArguments already has a frozen name `null` (at least in Node) ??!??!!?
    { generate: () => arguments, description: 'arguments object' },
    { generate: () => ({}), description: 'empty object' },
    {
      generate: () => ({
        a: 1,
        b: 'b',
        c: {},
        d: { d1: undefined, d2: 'd2', d3: { d31: 31 } },
        e: [5, 'c', true],
        f: Symbol('f')
      }),
      description: 'complex object'
    },
    { generate: () => [], description: 'empty array' },
    { generate: () => [4, 'z', { a: 'a' }, true, ['b', 12]], description: 'simple array' } // no Symbols
    // MUDO add circular stuff
  ]
  const arrayWithAllInIt = {
    generate: () => [...primitiveAndNullStuff.map(({ subject }) => subject), ...base.map(({ generate }) => generate())],
    description: 'complex array',
    primitive: false,
    mutable: true
  }
  return [...base.map(sg => ({ ...sg, primitive: false, mutable: true })), arrayWithAllInIt]
}
export const mutableStuffGenerators = buildMutableStuffGenerators()
export const stuffGenerators = [
  ...primitiveAndNullStuff.map(({ subject, description, primitive, mutable }) => ({
    generate: () => subject,
    description,
    primitive,
    mutable
  })),
  ...buildMutableStuffGenerators()
]
const namedStuff = mutableStuffGenerators.reduce(function addArrayOfNamedSubjectsToAcc(
  acc,
  { generate: generateSubject, description: subjectDescription }
) {
  if (subjectDescription === 'arguments object') {
    return [
      ...acc,
      {
        subject: generateSubject(), // NOTE: IArguments already has a frozen name `null` ??!??!!?
        description: `${subjectDescription} with an already frozen name \`null\``
      }
    ]
  }

  return [
    ...acc,
    ...stuffGenerators.map(function addFrozenNameToSubject({ generate: generateName, description: nameDescription }) {
      return {
        subject: setAndFreeze(generateSubject(), 'name', generateName()),
        description: `${subjectDescription} with ${nameDescription} name`,
        fail:
          ((subjectDescription === 'Error' || subjectDescription.includes('function')) &&
            nameDescription === 'symbol') ||
          ((subjectDescription === 'Error' || subjectDescription.includes('function')) &&
            nameDescription === 'complex array') ||
          (subjectDescription === 'Error' && nameDescription === 'RegExp')
            ? { subject: subjectDescription, name: nameDescription }
            : undefined
      }
    })
  ]
}, [])

function generateMultiLineAnonymousFunction() {
  return function () {
    // NOTE: string in place to make the _source_ multi-line
    // trim: spaces at start
    let x = '  This is a multi-line function'
    x += 'The intention of this test'
    x += 'is to verify'
    // start of white line

    // end of white line
    x += 'whether we get an acceptable'
    x += 'is to shortened version of this'
    x += 'as a concise representation'
    x += 'this function should have no name  ' // trim

    return x
  }
}

const stuff = [
  ...stuffGenerators.map(({ generate, description }) => ({ subject: generate(), description })),
  ...namedStuff,
  { subject: generateMultiLineAnonymousFunction(), description: 'multi-line anonymous function' },
  {
    subject: setAndFreeze(
      generateMultiLineAnonymousFunction(),
      'name',
      `   This is a multi-line name
The intention of this test
is to verify

whether we get an acceptable
is to shortened version of this
as a concise representation
this function should have a name   ` // trim
    ),
    description: 'multi-line anonymous function with frozen name'
  }
]

const triage = stuff.reduce(
  (acc, s) => {
    if (s.fail) {
      if (s.fail.name === 'symbol') {
        acc.symbolName.push(s)
      } else if (s.fail.name === 'complex array') {
        acc.complexArrayName.push(s)
      } else if (s.fail.name === 'RegExp') {
        acc.regExpName.push(s)
      } else {
        acc.failRest.push(s)
      }
    } else {
      acc.working.push(s)
    }
    return acc
  },
  { working: [], symbolName: [], complexArrayName: [], regExpName: [], failRest: [] }
)

describe('node util.inspect', function () {
  describe('working as expected', function () {
    console.info(`working: ${triage.working.length}`)
    triage.working.forEach(({ subject, description }) => {
      it(`works for a ${description}`, function () {
        const result = inspect(subject)
        strictEqual(typeof result, 'string')
        notStrictEqual(result, '')
      })
    })
  })
  describe('failing with a symbol name', function () {
    console.info(`symbolName: ${triage.symbolName.length}`)
    triage.symbolName.forEach(({ subject, description }) => {
      it(`fails for a ${description}`, function () {
        const result = inspect(subject)
        strictEqual(typeof result, 'string')
        notStrictEqual(result, '')
      })
    })
  })
  describe('failing with a complex array name', function () {
    console.info(`complexArrayName: ${triage.complexArrayName.length}`)
    triage.complexArrayName.forEach(({ subject, description }) => {
      it(`fails for a ${description}`, function () {
        const result = inspect(subject)
        strictEqual(typeof result, 'string')
        notStrictEqual(result, '')
      })
    })
  })
  describe('failing with a RegExp name', function () {
    console.info(`regExpName: ${triage.regExpName.length}`)
    triage.regExpName.forEach(({ subject, description }) => {
      it(`fails for a ${description}`, function () {
        const result = inspect(subject)
        strictEqual(typeof result, 'string')
        notStrictEqual(result, '')
      })
    })
  })
  describe('other failing', function () {
    console.info(`failRest: ${triage.failRest.length}`)
    triage.failRest.forEach(({ subject, description }) => {
      it(`fails for a ${description}`, function () {
        const result = inspect(subject)
        strictEqual(typeof result, 'string')
        notStrictEqual(result, '')
      })
    })
  })
})
