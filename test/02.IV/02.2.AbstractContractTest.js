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
      ;('' + AbstractContract.internalLocation).must.be.equal('INTERNAL')
      AbstractContract.must.have.ownProperty('falseCondition')
      AbstractContract.falseCondition.must.be.a.function()
      AbstractContract.must.have.ownProperty('mustNotHappen')
      AbstractContract.mustNotHappen.must.be.an.array()
      AbstractContract.mustNotHappen.must.have.length(1)
      AbstractContract.mustNotHappen[0].must.equal(
        AbstractContract.falseCondition
      )
      AbstractContract.must.have.ownProperty('outcome')
      AbstractContract.outcome.must.be.a.function()
      AbstractContract.must.have.ownProperty('callee')
      AbstractContract.callee.must.be.a.function()

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
      const subject = common.createCandidateContractFunction(AbstractContract)
      const result = AbstractContract.bindContractFunction.apply(subject)
      AbstractContract.isAGeneralContractFunction(result).must.be.true()
      Object.getPrototypeOf(result.contract).must.equal(subject.contract)
      result.location.must.equal(subject.location)
      if (AbstractContract.isAContractFunction(subject)) {
        AbstractContract.isAContractFunction(result).must.be.true()
      }
    })
  })

  describe('AbstractContract.isAGeneralizedContractFunction', function () {
    common.generateIAGCFTests(
      AbstractContract,
      AbstractContract.isAGeneralContractFunction
    )
    common.thingsThatAreNotAFunctionNorAContract
      .filter(v => !!v)
      .concat(['    at', 'at /', {}, AbstractContract.internalLocation])
      .forEach(v => {
        it(
          'says yes if there is an implementation Function, an AbstractContract, and a location that is ' +
            v +
            ', and all 3 properties are frozen, and it has the expected name',
          function () {
            const candidate = common.createCandidateContractFunction(
              AbstractContract,
              null,
              'location',
              v
            )
            AbstractContract.isAGeneralContractFunction(
              candidate
            ).must.be.truthy()
          }
        )
      })
  })

  common.generateConstructorMethodsDescriptions(AbstractContract)

  describe('AbstractContract.bless', function () {
    it('behaves as expected', function () {
      const contractFunction = function () {}
      const contract = new AbstractContract({})
      const implFunction = function () {}
      const location = stack.location()
      must(implFunction.prototype).be.an.object() // this is here because Safari on iOS doesn't do this always!; by doing this test, the prototype is forced in Safari on iOS
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
      contractFunction.name.must.equal(
        report.conciseCondition(
          AbstractContract.namePrefix,
          contractFunction.implementation
        )
      )
    })
  })

  describe('AbstractContract.falseCondition', function () {
    it('always returns false', function () {
      const result = AbstractContract.falseCondition()
      result.must.be.false()
    })
  })

  const argsResult = 'a result'
  const argsCallee = function () {}
  const argsCase = ['lala', 'lulu', 4, argsResult, argsCallee]
  function args () {
    return arguments
  }
  const argsCases = [
    { a: argsCase, d: 'array' },
    { a: args.apply(null, argsCase), d: 'arguments' }
  ]

  describe('AbstractContract.outcome', function () {
    argsCases.forEach(c => {
      it(`returns the expected element for an ${c.d} argument`, function () {
        const result = AbstractContract.outcome(c.a)
        result.must.equal(argsResult)
      })
    })
  })

  describe('AbstractContract.callee', function () {
    argsCases.forEach(c => {
      it(`returns the expected element for an ${c.d} argument`, function () {
        const result = AbstractContract.callee(c.a)
        result.must.equal(argsCallee)
      })
    })
  })

  describe('#AbstractContract()', function () {
    common.constructorPreCases.forEach(pre => {
      common.constructorPostCases.forEach(post => {
        common.constructorExceptionCases.forEach(exception => {
          it(
            'works for pre: ' +
              pre +
              ', post: ' +
              post +
              ', exception: ' +
              exception,
            function () {
              const preConditions = pre()
              const postConditions = post()
              const exceptionConditions = exception()
              const result = new AbstractContract({
                pre: preConditions,
                post: postConditions,
                exception: exceptionConditions
              })
              common.expectConstructorPost(
                preConditions,
                postConditions,
                exceptionConditions,
                stack.location(),
                result
              )
            }
          )
        })
      })
    })
  })

  common.generatePrototypeMethodsDescriptions(
    () => new AbstractContract({}),
    testUtil
      .x(
        common.constructorPreCases,
        common.constructorPostCases,
        common.constructorExceptionCases
      )
      .map(parameters => ({
        subject: () =>
          new AbstractContract({
            pre: parameters[0](),
            post: parameters[1](),
            exception: parameters[2]()
          }),
        description: parameters.join(' - ')
      }))
  )
})
