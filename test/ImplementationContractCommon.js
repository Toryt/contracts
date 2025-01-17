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

const testUtil = require('./_util/testUtil')
const stack = require('../lib/_private/stack')
const is = require('../lib/_private/is')
const common = require('./AbstractContractCommon')
const AbstractContract = require('../lib/AbstractContract')

function expectInvariants(subject) {
  common.expectInvariants(subject)
  is.stackLocation(subject.location).should.be.true()
  // this strengthening implies the same for the location of subject.abstract, since the locations have to be the same
  AbstractContract.isAContractFunction(subject.abstract)
  subject.implementation.should.be.a.Function()
}

// noinspection FunctionNamingConventionJS
function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
  common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators)
  const self = this

  describe('#implementation', function () {
    function expectPost(contract, implFunction, location, result) {
      contract.isImplementedBy(result).should.be.true()
      AbstractContract.isAContractFunction(result).should.be.true()
      Object.getPrototypeOf(result.contract).should.equal(contract)
      result.implementation.should.equal(implFunction)
      testUtil.mustBeCallerLocation(result.location, location)
      self.expectInvariants(contract)
    }

    it('returns a Contract function that is configured as expected', function () {
      const subject = oneSubjectGenerator()
      const impl = function () {}
      const result = subject.implementation(impl)
      expectPost(subject, impl, stack.location(), result)
    })

    it('returns a different Contract function when called with the same implementation', function () {
      const subject = oneSubjectGenerator()
      const impl = function () {}
      const result = subject.implementation(impl)
      const result2 = subject.implementation(impl)
      expectPost(subject, impl, stack.location(), result2)
      result2.should.not.equal(result)
    })

    it('returns a different Contract function with a different implementation', function () {
      const subject = oneSubjectGenerator()
      const impl = function () {}
      const impl2 = function () {}
      const result = subject.implementation(impl)
      const result2 = subject.implementation(impl2)
      expectPost(subject, impl2, stack.location(), result2)
      result2.should.not.equal(result)
      result2.implementation.should.not.equal(result.implementation)
    })
  })
}

const test = {
  expectInvariants,
  generatePrototypeMethodsDescriptions
}
Object.setPrototypeOf(test, common)

module.exports = test
