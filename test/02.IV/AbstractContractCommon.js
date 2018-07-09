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
const is = require('../../lib/_private/is')
const property = require('../../lib/_private/property')
const os = require('os')

const someConditions = [
  function () { return [] },
  function () { return [function () { return false }, function () { return true }] }
]
const preCases = [function () { return null }].concat(someConditions)
const postCases = [function () { return null }].concat(someConditions)
const exceptionCases = [function () { return null }].concat(someConditions)

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

const constructorPreCases = [function () { return undefined }].concat(preCases)
const constructorPostCases = [function () { return undefined }].concat(postCases)
const constructorExceptionCases = [function () { return undefined }].concat(exceptionCases)

const location = os.EOL + '    at /'

function expectInvariants (/* AbstractContract */ subject) {
  subject.must.be.an.instanceof(AbstractContract)
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'pre', '_pre')
  // noinspection JSUnresolvedVariable
  testUtil.expectToBeArrayOfFunctions(subject.pre)
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'post', '_post')
  // noinspection JSUnresolvedVariable
  testUtil.expectToBeArrayOfFunctions(subject.post)
  testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'exception', '_exception')
  // noinspection JSUnresolvedVariable
  testUtil.expectToBeArrayOfFunctions(subject.exception)
  testUtil.expectOwnFrozenProperty(subject, 'location')
  // noinspection JSUnresolvedVariable
  const location = subject.location
  ; (location === AbstractContract.internalLocation || is.stackLocation(location)).must.be.true()
  testUtil.expectOwnFrozenProperty(subject, 'abstract')
  // noinspection JSUnresolvedVariable
  const abstract = subject.abstract
  AbstractContract.isAGeneralContractFunction(abstract).must.be.true()
  abstract.location.must.equal(location)
  subject.isImplementedBy(abstract).must.be.true()
  abstract.must.throw(AbstractContract.AbstractError, AbstractContract.AbstractError.message)
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

function expectConstructorPost (pre, post, exception, location, result) {
  function expectArrayPost (array, propName, privatePropName) {
    result[propName].must.be.an.array()
    if (!array) {
      result[propName].must.be.empty()
    } else {
      result[privatePropName].must.not.equal(array) // it must be copy, don't share the array
      result[privatePropName].must.eql(array)
      Object.isFrozen(result[privatePropName])
      result[propName].must.eql(array)
      result[propName].must.not.equal(result[privatePropName]) // it must be copy, don't share the array
    }
  }

  it('has the expectedProperties, and adheres to the invariants', function () {
    expectArrayPost(pre, 'pre', '_pre')
    expectArrayPost(post, 'post', '_post')
    expectArrayPost(exception, 'exception', '_exception')
    testUtil.mustBeCallerLocation(result.location, location)
    expectInvariants(result)
  })
}

function createCandidateContractFunction (doNotFreezeProperty, otherPropertyName, otherPropertyValue) {
  function candidate () {}

  function impl () {}

  const contract = otherPropertyName === 'contract' ? otherPropertyValue : new AbstractContract({})
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
  candidate.displayName =
    (otherPropertyName === 'displayName')
      ? otherPropertyValue
      : AbstractContract.contractFunctionDisplayName(candidate)
  // noinspection JSPotentiallyInvalidConstructorUsage
  candidate.prototype = Object.create(impl.prototype, {constructor: {value: candidate}})
  return candidate
}

// noinspection FunctionNamingConventionJS,JSUnusedLocalSymbols
function generatePrototypeMethodsDescriptions (oneSubjectGenerator, allSubjectGenerators) {
  const self = this

  describe('#isImplementedBy()', function () {
    it('says yes if the argument is a general contract function for the contract', function () {
      const subject = oneSubjectGenerator()
      const f = createCandidateContractFunction(null, 'contract', subject)
      subject.isImplementedBy(f).must.be.truthy()
      self.expectInvariants(subject)
    })
    notAFunctionNorAContract
      .concat(['function() {}'])
      .forEach(function (thing) {
        it('says no if the argument is not a general contract function but ' + thing, function () {
          const subject = oneSubjectGenerator()
          subject.isImplementedBy(thing).must.be.falsy()
          self.expectInvariants(subject)
        })
      })
    it('says no if the argument is a contract function for another contract', function () {
      const subject = oneSubjectGenerator()
      const otherContract = oneSubjectGenerator()
      const f = createCandidateContractFunction(null, 'contract', otherContract)
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
  expectConstructorPost: expectConstructorPost,
  createCandidateContractFunction: createCandidateContractFunction,
  generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
}
