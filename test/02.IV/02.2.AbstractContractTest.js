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
const common = require('./AbstractContractCommon')
const must = require('must')
const os = require('os')

describe('IV/AbstractContract', function () {
  describe('AbstractContract', function () {
    // noinspection FunctionTooLongJS
    it('has the expected properties', function () {
      AbstractContract.must.have.ownProperty('namePrefix')
      AbstractContract.namePrefix.must.be.a.string()
      AbstractContract.must.have.ownProperty('bindContractFunction')
      AbstractContract.bindContractFunction.must.be.a.function()
      AbstractContract.must.have.ownProperty('isAContractFunction')
      AbstractContract.isAContractFunction.must.be.a.function()
      AbstractContract.must.have.ownProperty('bless')
      AbstractContract.bless.must.be.a.function()
      AbstractContract.must.have.ownProperty('internalLocation')
      AbstractContract.internalLocation.must.be.an.object()
      ; ('' + AbstractContract.internalLocation).must.be.equal('INTERNAL')
      AbstractContract.must.have.ownProperty('falseCondition')
      AbstractContract.falseCondition.must.be.a.function()
      AbstractContract.must.have.ownProperty('mustNotHappen')
      AbstractContract.mustNotHappen.must.be.an.array()
      AbstractContract.mustNotHappen.must.have.length(1)
      AbstractContract.mustNotHappen[0].must.equal(AbstractContract.falseCondition)

      AbstractContract.must.have.ownProperty('root')
      AbstractContract.root.must.be.an.instanceof(AbstractContract)
      const root = AbstractContract.root
      common.expectInvariants(root)
      root.pre.must.have.length(1)
      root.pre[0].must.equal(AbstractContract.falseCondition)
      root.post.must.be.empty()
      root.exception.must.be.empty()
      root.location.must.equal(AbstractContract.internalLocation)
      AbstractContract.must.have.ownProperty('AbstractError')
      AbstractContract.AbstractError.must.be.a.function()
      AbstractContract.AbstractError.prototype.must.be.an.instanceof(Error)
      AbstractContract.must.have.ownProperty('prototype')
      AbstractContract.prototype.must.be.an.object()
      const prototype = AbstractContract.prototype
      must(prototype._pre).be.null()
      must(prototype._post).be.null()
      must(prototype._exception).be.null()
      // noinspection JSUnresolvedVariable
      prototype.location.must.equal(AbstractContract.internalLocation)
      // noinspection JSUnresolvedVariable
      must(prototype.abstract).be.null()
      prototype.isImplementedBy.must.be.a.function()
    })
  })

  describe('AbstractContract.bindContractFunction', function () {
    it('behaves as expected', function () {
      const subject = common.createCandidateContractFunction()
      const result = AbstractContract.bindContractFunction.apply(subject)
      AbstractContract.isAGeneralContractFunction(result).must.be.true()
      Object.getPrototypeOf(result.contract).must.equal(subject.contract)
      result.location.must.equal(subject.location)
      if (AbstractContract.isAContractFunction(subject)) {
        AbstractContract.isAContractFunction(result).must.be.true()
      }
    })
  })

  function generateIAGCFTests (isAGeneralizedContractFunction) {
    it(
      'says yes if there is an implementation Function, an AbstractContract, and a location, and all 3 ' +
       'properties are frozen, and it has the expected name',
      function () {
        const candidate = common.createCandidateContractFunction()
        isAGeneralizedContractFunction(candidate).must.be.truthy()
      }
    )

    common.thingsThatAreNotAFunctionNorAContract.forEach(thing => {
      it('says no if the argument is not a function, but ' + thing, function () {
        must(isAGeneralizedContractFunction(thing)).be.falsy()
      })
    });

    ['contract', 'implementation', 'location', 'bind'].forEach(doNotFreezeProperty => {
      it('says no if the ' + doNotFreezeProperty + ' property is not frozen', function () {
        const candidate = common.createCandidateContractFunction(doNotFreezeProperty)
        must(isAGeneralizedContractFunction(candidate)).be.falsy()
      })
    });

    [
      {propertyName: 'contract', expected: 'an AbstractContract', extra: [function () {}]},
      {propertyName: 'implementation', expected: 'a Function', extra: [new AbstractContract({})]},
      {propertyName: 'bind', expected: 'AbstractContract.bindContractFunction', extra: []},
      {
        propertyName: 'name',
        expected: 'the contractFunction.name',
        extra: ['candidate', AbstractContract.namePrefix]
      }
    ].forEach(aCase => {
      common.thingsThatAreNotAFunctionNorAContract.concat(aCase.extra).forEach(v => {
        it('says no if the ' + aCase.propertyName + ' is not ' + aCase.expected + ' but ' + v, function () {
          const candidate = common.createCandidateContractFunction(null, aCase.propertyName, v)
          must(isAGeneralizedContractFunction(candidate)).be.falsy()
        })
      })
    })
    common.thingsThatAreNotAFunctionNorAContract.filter(v => !v).forEach(v => {
      it('says no if the location is not truthy but ' + v, function () {
        const candidate = common.createCandidateContractFunction(null, 'location', v)
        must(AbstractContract.isAContractFunction(candidate)).be.falsy()
      })
    })
  }

  describe('AbstractContract.isAGeneralizedContractFunction', function () {
    generateIAGCFTests(AbstractContract.isAGeneralContractFunction)
    common.thingsThatAreNotAFunctionNorAContract
      .filter(v => !!v)
      .concat(['    at', 'at /', {}, AbstractContract.internalLocation])
      .forEach(v => {
        it(
          'says yes if there is an implementation Function, an AbstractContract, and a location that is ' + v +
          ', and all 3 properties are frozen, and it has the expected name',
          function () {
            const candidate = common.createCandidateContractFunction(null, 'location', v)
            AbstractContract.isAGeneralContractFunction(candidate).must.be.truthy()
          }
        )
      })
  })

  describe('AbstractContract.isAContractFunction', function () {
    generateIAGCFTests(AbstractContract.isAContractFunction)
    common
      .thingsThatAreNotAFunctionNorAContract
      .filter(t => !t || typeof t !== 'string' || t.indexOf(os.EOL) >= 0)
      .concat([{}, AbstractContract.internalLocation])
      .forEach(v => {
        it('says no if the location is not a location outside this library but ' + v, function () {
          const candidate = common.createCandidateContractFunction(null, 'location', v)
          must(AbstractContract.isAContractFunction(candidate)).be.falsy()
        })
      })
  })

  describe('AbstractContract.bless', function () {
    it('behaves as expected', function () {
      const contractFunction = function () {}
      const contract = new AbstractContract({})
      const implFunction = function () {}
      const location = stack.location()
      AbstractContract.bless(contractFunction, contract, implFunction, location)
      AbstractContract.isAContractFunction(contractFunction).must.be.true()
      testUtil.expectOwnFrozenProperty(contractFunction, 'contract')
      Object.getPrototypeOf(contractFunction.contract).must.equal(contract)
      testUtil.expectOwnFrozenProperty(contractFunction, 'implementation')
      contractFunction.implementation.must.equal(implFunction)
      testUtil.expectOwnFrozenProperty(contractFunction, 'location')
      contractFunction.location.must.equal(location)
      testUtil.expectOwnFrozenProperty(contractFunction, 'bind')
      contractFunction.bind.must.equal(AbstractContract.bindContractFunction)
      testUtil.expectFrozenDerivedPropertyOnAPrototype(contractFunction, 'name')
      contractFunction.must.have.ownProperty('name')
      contractFunction.name.must.equal(report.conciseCondition(AbstractContract.namePrefix, contractFunction.implementation))
    })
  })

  describe('AbstractContract.falseCondition', function () {
    it('always returns false', function () {
      const result = AbstractContract.falseCondition()
      result.must.be.false()
    })
  })

  describe('#AbstractContract()', function () {
    common.constructorPreCases.forEach(pre => {
      common.constructorPostCases.forEach(post => {
        common.constructorExceptionCases.forEach(exception => {
          it('works for pre: ' + pre + ', post: ' + post + ', exception: ' + exception, function () {
            const preConditions = pre()
            const postConditions = post()
            const exceptionConditions = exception()
            const result = new AbstractContract({pre: preConditions, post: postConditions, exception: exceptionConditions})
            common.expectConstructorPost(preConditions, postConditions, exceptionConditions, stack.location(), result)
          })
        })
      })
    })
  })

  common.generatePrototypeMethodsDescriptions(
    () => new AbstractContract({}),
    testUtil
      .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
      .map(parameters => ({
        subject: () => new AbstractContract({
          pre: parameters[0](),
          post: parameters[1](),
          exception: parameters[2]()
        }),
        description: parameters.join(' - ')
      }))
  )
})
