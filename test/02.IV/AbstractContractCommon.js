/*
 Copyright 2016 - 2018 by Jan Dockx

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

const AbstractContract = require('../../lib/IV/AbstractContract')
const testUtil = require('../_util/testUtil')
const stack = require('../../lib/_private/stack')
const report = require('../../lib/_private/report')
const is = require('../../lib/_private/is')
const property = require('../../lib/_private/property')
const os = require('os')
const must = require('must')

const someConditions = [
  function () {
    return []
  },
  function () {
    return [
      function () {
        return false
      },
      function () {
        return true
      }
    ]
  }
]
const preCases = [
  function () {
    return null
  }
].concat(someConditions)
const postCases = [
  function () {
    return null
  }
].concat(someConditions)
const exceptionCases = [
  function () {
    return null
  }
].concat(someConditions)

// noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS
const notAFunctionNorAContract = [
  undefined,
  null,
  '',
  'foo',
  0,
  -1,
  true,
  false,
  /lala/,
  {},
  new Date(),
  // eslint-disable-next-line
  new Number(42),
  // eslint-disable-next-line
  new Boolean(true),
  // eslint-disable-next-line
  new String('lalala')
]

const constructorPreCases = [
  function () {
    return undefined
  }
].concat(preCases)
const constructorPostCases = [
  function () {
    return undefined
  }
].concat(postCases)
const constructorExceptionCases = [
  function () {
    return undefined
  }
].concat(exceptionCases)

const location = os.EOL + '    at /'

function expectInvariants (/* AbstractContract */ subject) {
  subject.must.be.an.instanceof(AbstractContract)
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(
    subject,
    'pre',
    '_pre'
  )
  // noinspection JSUnresolvedVariable
  testUtil.expectToBeArrayOfFunctions(subject.pre)
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(
    subject,
    'post',
    '_post'
  )
  // noinspection JSUnresolvedVariable
  testUtil.expectToBeArrayOfFunctions(subject.post)
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(
    subject,
    'exception',
    '_exception'
  )
  // noinspection JSUnresolvedVariable
  testUtil.expectToBeArrayOfFunctions(subject.exception)
  testUtil.expectOwnFrozenProperty(subject, 'location')
  // noinspection JSUnresolvedVariable
  const location = subject.location
  ;(
    location === AbstractContract.internalLocation || is.stackLocation(location)
  ).must.be.true()
  testUtil.expectOwnFrozenProperty(subject, 'abstract')
  // noinspection JSUnresolvedVariable
  const abstract = subject.abstract
  AbstractContract.isAGeneralContractFunction(abstract).must.be.true()
  abstract.location.must.equal(location)
  subject.isImplementedBy(abstract).must.be.true()
  abstract.must.throw(
    AbstractContract.AbstractError,
    AbstractContract.AbstractError.message
  )
  try {
    abstract()
  } catch (err) {
    const stack = err.stack
    stack.must.contain(AbstractContract.AbstractError.message)
    stack.must.contain(AbstractContract.AbstractError.name)
    stack.split(os.EOL)[0].must.contain('abstract')
    testUtil.log(stack)
  }
}

function expectArrayPost (result, array, propName, privatePropName) {
  result[propName].must.be.an.array()
  if (!array) {
    if (propName === 'exception' || propName === 'fastException') {
      result[propName].must.eql(AbstractContract.mustNotHappen)
    } else {
      result[propName].must.be.empty()
    }
  } else {
    result[privatePropName].must.not.equal(array) // it must be copy, don't share the array
    result[privatePropName].must.eql(array)
    Object.isFrozen(result[privatePropName])
    result[propName].must.eql(array)
    result[propName].must.not.equal(result[privatePropName]) // it must be copy, don't share the array
  }
}

function expectConstructorPost (pre, post, exception, location, result) {
  expectArrayPost(result, pre, 'pre', '_pre')
  expectArrayPost(result, post, 'post', '_post')
  expectArrayPost(result, exception, 'exception', '_exception')
  testUtil.mustBeCallerLocation(result.location, location)
  expectInvariants(result)
}

// noinspection OverlyComplexFunctionJS, ParameterNamingConventionJS
function createCandidateContractFunction (
  ContractConstructor,
  doNotFreezeProperty,
  otherPropertyName,
  otherPropertyValue
) {
  function candidate () {}

  function impl () {}

  let contract =
    otherPropertyName === 'contract'
      ? otherPropertyValue
      : new (ContractConstructor || AbstractContract)({})
  if (typeof contract === 'object') {
    contract = Object.create(contract)
  }
  const implementation =
    otherPropertyName === 'implementation' ? otherPropertyValue : impl
  const location =
    otherPropertyName === 'location' ? otherPropertyValue : stack.location()
  const bind =
    otherPropertyName === 'bind'
      ? otherPropertyValue
      : AbstractContract.bindContractFunction

  if (doNotFreezeProperty === 'contract') {
    candidate.contract = contract
  } else {
    property.setAndFreeze(candidate, 'contract', contract)
  }
  if (doNotFreezeProperty === 'implementation') {
    candidate.implementation = implementation
  } else {
    property.setAndFreeze(candidate, 'implementation', implementation)
  }
  if (doNotFreezeProperty === 'location') {
    candidate.location = location
  } else {
    property.setAndFreeze(candidate, 'location', location)
  }
  if (doNotFreezeProperty === 'bind') {
    candidate.bind = bind
  } else {
    property.setAndFreeze(candidate, 'bind', bind)
  }
  property.setAndFreeze(
    candidate,
    'name',
    otherPropertyName === 'name'
      ? otherPropertyValue
      : report.conciseCondition(AbstractContract.namePrefix, implementation)
  )
  // noinspection JSPotentiallyInvalidConstructorUsage
  candidate.prototype = Object.create(impl.prototype, {
    constructor: { value: candidate }
  })
  return candidate
}

// noinspection ParameterNamingConventionJS
function generateIAGCFTests (ContractConstructor, isAXXXContractFunction) {
  it(
    'says yes if there is an implementation Function, an AbstractContract, and a location, and all 3 ' +
      'properties are frozen, and it has the expected name',
    function () {
      const candidate = createCandidateContractFunction(ContractConstructor)
      isAXXXContractFunction
        .call(ContractConstructor, candidate)
        .must.be.truthy()
    }
  )

  notAFunctionNorAContract.forEach(thing => {
    it('says no if the argument is not a function, but ' + thing, function () {
      must(isAXXXContractFunction.call(ContractConstructor, thing)).be.falsy()
    })
  })
  ;['contract', 'implementation', 'location', 'bind'].forEach(
    doNotFreezeProperty => {
      it(
        'says no if the ' + doNotFreezeProperty + ' property is not frozen',
        function () {
          const candidate = createCandidateContractFunction(
            ContractConstructor,
            doNotFreezeProperty
          )
          must(
            isAXXXContractFunction.call(ContractConstructor, candidate)
          ).be.falsy()
        }
      )
    }
  )
  ;[
    {
      propertyName: 'contract',
      expected: 'an AbstractContract',
      extra: [function () {}]
    },
    {
      propertyName: 'implementation',
      expected: 'a Function',
      extra: [new AbstractContract({})]
    },
    {
      propertyName: 'bind',
      expected: 'AbstractContract.bindContractFunction',
      extra: []
    },
    {
      propertyName: 'name',
      expected: 'the contractFunction.name',
      extra: ['candidate', AbstractContract.namePrefix]
    }
  ].forEach(aCase => {
    notAFunctionNorAContract.concat(aCase.extra).forEach(v => {
      it(
        'says no if the ' +
          aCase.propertyName +
          ' is not ' +
          aCase.expected +
          ' but ' +
          v,
        function () {
          const candidate = createCandidateContractFunction(
            ContractConstructor,
            null,
            aCase.propertyName,
            v
          )
          must(
            isAXXXContractFunction.call(ContractConstructor, candidate)
          ).be.falsy()
        }
      )
    })
  })
}

// noinspection FunctionNamingConventionJS, ParameterNamingConventionJS
function generateConstructorMethodsDescriptions (ContractConstructor) {
  describe('@isAContractFunction', function () {
    generateIAGCFTests(
      ContractConstructor,
      ContractConstructor.isAContractFunction
    )
    notAFunctionNorAContract
      .filter(t => !t || typeof t !== 'string' || t.indexOf(os.EOL) >= 0)
      .concat([{}, AbstractContract.internalLocation])
      .forEach(v => {
        it(
          'says no if the location is not a location outside this library but ' +
            v,
          function () {
            const candidate = createCandidateContractFunction(
              null,
              'location',
              v
            )
            must(AbstractContract.isAContractFunction(candidate)).be.falsy()
          }
        )
      })
    notAFunctionNorAContract.filter(v => !v).forEach(v => {
      it('says no if the location is not truthy but ' + v, function () {
        const candidate = createCandidateContractFunction(
          ContractConstructor,
          null,
          'location',
          v
        )
        must(ContractConstructor.isAContractFunction(candidate)).be.falsy()
      })
    })
  })
}

// noinspection FunctionNamingConventionJS,JSUnusedLocalSymbols
function generatePrototypeMethodsDescriptions (
  oneSubjectGenerator,
  allSubjectGenerators
) {
  const self = this

  describe('#isImplementedBy()', function () {
    it('says yes if the argument is a general contract function for the contract', function () {
      const subject = oneSubjectGenerator()
      const f = createCandidateContractFunction(
        subject.constructor,
        null,
        'contract',
        subject
      )
      subject.isImplementedBy(f).must.be.truthy()
      self.expectInvariants(subject)
    })
    notAFunctionNorAContract.concat(['function() {}']).forEach(function (thing) {
      it(
        'says no if the argument is not a general contract function but ' +
          thing,
        function () {
          const subject = oneSubjectGenerator()
          subject.isImplementedBy(thing).must.be.falsy()
          self.expectInvariants(subject)
        }
      )
    })
    it('says no if the argument is a contract function for another contract', function () {
      const subject = oneSubjectGenerator()
      const otherContract = oneSubjectGenerator()
      const f = createCandidateContractFunction(
        null,
        null,
        'contract',
        otherContract
      )
      subject.isImplementedBy(f).must.be.falsy()
      self.expectInvariants(subject)
    })
  })
}

module.exports = {
  preCases: preCases,
  postCases: postCases,
  exceptionCases: exceptionCases,
  thingsThatAreNotAFunctionNorAContract: notAFunctionNorAContract,
  constructorPreCases: constructorPreCases,
  constructorPostCases: constructorPostCases,
  constructorExceptionCases: constructorExceptionCases,
  location: location,
  expectInvariants: expectInvariants,
  expectArrayPost: expectArrayPost,
  expectConstructorPost: expectConstructorPost,
  createCandidateContractFunction: createCandidateContractFunction,
  generateIAGCFTests: generateIAGCFTests,
  generateConstructorMethodsDescriptions: generateConstructorMethodsDescriptions,
  generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
}
