/*
  Copyright 2016–2024 Jan Dockx

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

const AbstractContract = require('../lib/AbstractContract')
const testUtil = require('./_util/testUtil')
const stack = require('../lib/_private/stack')
const report = require('../lib/_private/report')
const is = require('../lib/_private/is')
const property = require('../lib/_private/property')
const eol = require('../lib/_private/eol')
const should = require('should')

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

// noinspection JSCheckFunctionSignatures
const preCases = [
  function () {
    return null
  }
].concat(someConditions)
// noinspection JSCheckFunctionSignatures
const postCases = [
  function () {
    return null
  }
].concat(someConditions)
// noinspection JSCheckFunctionSignatures
const exceptionCases = [
  function () {
    return null
  }
].concat(someConditions)

// noinspection JSPrimitiveTypeWrapperUsage
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
  // eslint-disable-next-line no-new-wrappers
  new Number(42),
  // eslint-disable-next-line no-new-wrappers
  new Boolean(true),
  // eslint-disable-next-line no-new-wrappers
  new String('lalala')
]

// noinspection JSCheckFunctionSignatures
const constructorPreCases = [
  function () {
    return undefined
  }
].concat(preCases)
// noinspection JSCheckFunctionSignatures
const constructorPostCases = [
  function () {
    return undefined
  }
].concat(postCases)
// noinspection JSCheckFunctionSignatures
const constructorExceptionCases = [
  function () {
    return undefined
  }
].concat(exceptionCases)

const location = eol.stack + '    at /'

function expectInvariants(/* AbstractContract */ subject) {
  subject.should.be.an.instanceof(AbstractContract)
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'pre', '_pre')
  /* MUDO given a contract c, and contract function cf = c.implementation(…), cf.contract !== c, but
          Object.getPrototypeOf(cf.contract) === c
          -
          c.implementation(…) creates a new object with c as prototype in bless: Object.create(contract)
          -
          therefore, it is not true that for all contracts _pre, _post, _exceptions must be _own_ properties
          -
          we are missing a test for the invariants of cf.contract
          -
          either we relax the invariants, and move the "own" aspect to the postconditions of the constructor,
          or we slice the arrays in bless - the latter seems like not a good idea, since in this case we intend
          this to be semantically "the same contract" - what will happen here with extend? */
  testUtil.expectToBeArrayOfFunctions(subject.pre)
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'post', '_post')
  testUtil.expectToBeArrayOfFunctions(subject.post)
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'exception', '_exception')
  testUtil.expectToBeArrayOfFunctions(subject.exception)
  testUtil.expectOwnFrozenProperty(subject, 'location')
  const location = subject.location
  ;(location === AbstractContract.internalLocation || is.stackLocation(location)).should.be.true()
  testUtil.expectOwnFrozenProperty(subject, 'abstract')
  const abstract = subject.abstract
  AbstractContract.isAGeneralContractFunction(abstract).should.be.true()
  abstract.location.should.equal(location)
  subject.isImplementedBy(abstract).should.be.true()
  abstract.should.throw(AbstractContract.AbstractError, { message: AbstractContract.AbstractError.message })
  try {
    abstract()
  } catch (err) {
    const stack = err.stack
    stack.should.containEql(AbstractContract.AbstractError.message)
    stack.should.containEql(AbstractContract.AbstractError.name)
    stack.split(eol.stack)[0].should.containEql('abstract')
    testUtil.log(stack)
  }
}

function expectArrayPost(result, array, propName, privatePropName) {
  result[propName].should.be.an.Array()
  if (!array) {
    if (propName === 'exception' || propName === 'fastException') {
      result[propName].should.eql(AbstractContract.mustNotHappen)
    } else {
      result[propName].should.be.empty()
    }
  } else {
    result[privatePropName].should.not.equal(array) // it must be a copy, don't share the array
    result[privatePropName].should.eql(array)
    Object.isFrozen(result[privatePropName])
    result[propName].should.eql(array)
    result[propName].should.not.equal(result[privatePropName]) // it must be a copy, don't share the array
  }
}

function expectConstructorPost(pre, post, exception, location, result) {
  expectArrayPost(result, pre, 'pre', '_pre')
  expectArrayPost(result, post, 'post', '_post')
  expectArrayPost(result, exception, 'exception', '_exception')
  testUtil.mustBeCallerLocation(result.location, location)
  expectInvariants(result)
}

// noinspection OverlyComplexFunctionJS, ParameterNamingConventionJS
function createCandidateContractFunction(
  ContractConstructor,
  doNotFreezeProperty,
  otherPropertyName,
  otherPropertyValue
) {
  function candidate() {}

  function impl() {}

  let contract =
    otherPropertyName === 'contract' ? otherPropertyValue : new (ContractConstructor || AbstractContract)({})
  if (typeof contract === 'object') {
    contract = Object.create(contract)
  }
  const implementation = otherPropertyName === 'implementation' ? otherPropertyValue : impl
  const location = otherPropertyName === 'location' ? otherPropertyValue : stack.location()
  const bind = otherPropertyName === 'bind' ? otherPropertyValue : AbstractContract.bindContractFunction

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
function generateIAGCFTests(ContractConstructor, isAXXXContractFunction) {
  it(
    'says yes if there is an implementation Function, an AbstractContract, and a location, and all 3 ' +
      'properties are frozen, and it has the expected name',
    function () {
      const candidate = createCandidateContractFunction(ContractConstructor)
      isAXXXContractFunction.call(ContractConstructor, candidate).should.be.ok()
    }
  )

  notAFunctionNorAContract.forEach(thing => {
    it('says no if the argument is not a function, but ' + thing, function () {
      should(isAXXXContractFunction.call(ContractConstructor, thing)).not.be.ok()
    })
  })
  ;['contract', 'implementation', 'location', 'bind'].forEach(doNotFreezeProperty => {
    it(`says no if the ${doNotFreezeProperty} property is not frozen`, function () {
      const candidate = createCandidateContractFunction(ContractConstructor, doNotFreezeProperty)
      should(isAXXXContractFunction.call(ContractConstructor, candidate)).not.be.ok()
    })
  })
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
      it('says no if the ' + aCase.propertyName + ' is not ' + aCase.expected + ' but ' + v, function () {
        const candidate = createCandidateContractFunction(ContractConstructor, null, aCase.propertyName, v)
        should(isAXXXContractFunction.call(ContractConstructor, candidate)).not.be.ok()
      })
    })
  })
}

// noinspection FunctionNamingConventionJS, ParameterNamingConventionJS
function generateConstructorMethodsDescriptions(ContractConstructor) {
  describe('@isAContractFunction', function () {
    generateIAGCFTests(ContractConstructor, ContractConstructor.isAContractFunction)
    notAFunctionNorAContract
      .filter(t => !t || typeof t !== 'string' || t.indexOf(eol.n) >= 0 || t.indexOf(eol.rn) >= 0)
      .concat([{}, AbstractContract.internalLocation])
      .forEach(v => {
        it(`says no if the location is not a location outside this library but ${v}`, function () {
          const candidate = createCandidateContractFunction(null, 'location', v)
          should(AbstractContract.isAContractFunction(candidate)).not.be.ok()
        })
      })
    notAFunctionNorAContract
      .filter(v => !v)
      .forEach(v => {
        it(`says no if the location is not truthy but ${v}`, function () {
          const candidate = createCandidateContractFunction(ContractConstructor, null, 'location', v)
          should(ContractConstructor.isAContractFunction(candidate)).not.be.ok()
        })
      })
  })
}

// noinspection FunctionNamingConventionJS,JSUnusedLocalSymbols
function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
  const self = this

  describe('#isImplementedBy()', function () {
    it('says yes if the argument is a general contract function for the contract', function () {
      const subject = oneSubjectGenerator()
      const f = createCandidateContractFunction(subject.constructor, null, 'contract', subject)
      subject.isImplementedBy(f).should.be.ok()
      self.expectInvariants(subject)
    })
    it('says yes to abstract', function () {
      const subject = oneSubjectGenerator()
      subject.isImplementedBy(subject.abstract).should.be.ok()
      self.expectInvariants(subject)
    })
    it('says yes to abstract with its own contract', function () {
      const subject = oneSubjectGenerator()
      subject.abstract.contract.isImplementedBy(subject.abstract).should.be.ok()
      // MUDO shows a bug elsewhere; see expectInvariants
      // self.expectInvariants(subject.abstract.contract)
    })
    notAFunctionNorAContract.concat(['function() {}']).forEach(function (thing) {
      it(`says no if the argument is not a general contract function but ${thing}`, function () {
        const subject = oneSubjectGenerator()
        subject.isImplementedBy(thing).should.not.be.ok()
        self.expectInvariants(subject)
      })
    })
    it('says no if the argument is a contract function for another contract', function () {
      const subject = oneSubjectGenerator()
      const otherContract = oneSubjectGenerator()
      const f = createCandidateContractFunction(null, null, 'contract', otherContract)
      subject.isImplementedBy(f).should.not.be.ok()
      self.expectInvariants(subject)
    })
  })
}

module.exports = {
  preCases,
  postCases,
  exceptionCases,
  thingsThatAreNotAFunctionNorAContract: notAFunctionNorAContract,
  constructorPreCases,
  constructorPostCases,
  constructorExceptionCases,
  location,
  expectInvariants,
  expectArrayPost,
  expectConstructorPost,
  createCandidateContractFunction,
  generateIAGCFTests,
  generateConstructorMethodsDescriptions,
  generatePrototypeMethodsDescriptions
}
