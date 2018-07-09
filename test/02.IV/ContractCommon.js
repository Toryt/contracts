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

const testUtil = require('../_util/testUtil')
const util = require('../../lib/_private/util')
const is = require('../../lib/_private/is')
const common = require('./AbstractContractCommon')
const Contract = require('../../lib/IV/Contract')

function expectInvariants (subject) {
  subject.must.be.an.instanceof(Contract)
  common.expectInvariants(subject)
  is.isAStackLocation(subject.location).must.be.true()
  // this strengthening implies the same for the location of subject.abstract, since the locations have to be the same
  // noinspection JSUnresolvedFunction, JSUnresolvedVariable
  Contract.isAContractFunction(subject.abstract)
  subject.implementation.must.be.a.function()
}

// noinspection FunctionNamingConventionJS
function generatePrototypeMethodsDescriptions (oneSubjectGenerator, allSubjectGenerators) {
  common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators)
  const self = this // jshint ignore:line

  describe('#implementation', function () {
    function expectPost (contract, implFunction, location, result) {
      contract.isImplementedBy(result).must.be.true()
      // noinspection JSUnresolvedFunction
      Contract.isAContractFunction(result).must.be.true()
      result.contract.must.equal(contract)
      result.implementation.must.equal(implFunction)
      testUtil.mustBeCallerLocation(result.location, location)
      self.expectInvariants(contract)
    }

    it('returns an Contract function that is configured as expected', function () {
      const subject = oneSubjectGenerator()
      const impl = function () {}
      const result = subject.implementation(impl)
      expectPost(subject, impl, util.callerLocation(), result)
    })

    it('returns a different Contract function when called with the same implementation', function () {
      const subject = oneSubjectGenerator()
      const impl = function () {}
      const result = subject.implementation(impl)
      const result2 = subject.implementation(impl)
      expectPost(subject, impl, util.callerLocation(), result2)
      result2.must.not.equal(result)
    })

    it('returns a different Contract function with a different implementation', function () {
      const subject = oneSubjectGenerator()
      const impl = function () {}
      const impl2 = function () {}
      const result = subject.implementation(impl)
      const result2 = subject.implementation(impl2)
      expectPost(subject, impl2, util.callerLocation(), result2)
      result2.must.not.equal(result)
      result2.implementation.must.not.equal(result.implementation)
    })
  })
}

const test = {
  expectInvariants: expectInvariants,
  generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
}
Object.setPrototypeOf(test, common)

module.exports = test
