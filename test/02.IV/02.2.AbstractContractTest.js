/*
 Copyright 2016 - 2020 by Jan Dockx

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
const should = require('should')

describe('IV/AbstractContract', function () {
  describe('AbstractContract', function () {
    // noinspection FunctionTooLongJS
    it('has the expected properties', function () {
      AbstractContract.should.have.ownProperty('namePrefix')
      AbstractContract.namePrefix.should.be.a.String()
      AbstractContract.should.have.ownProperty('bindContractFunction')
      AbstractContract.bindContractFunction.should.be.a.Function()
      AbstractContract.should.have.ownProperty('isAContractFunction')
      AbstractContract.isAContractFunction.should.be.a.Function()
      AbstractContract.should.have.ownProperty('bless')
      AbstractContract.bless.should.be.a.Function()
      AbstractContract.should.have.ownProperty('internalLocation')
      AbstractContract.internalLocation.should.be.an.Object()
      ;('' + AbstractContract.internalLocation).should.be.equal('INTERNAL')
      AbstractContract.should.have.ownProperty('falseCondition')
      AbstractContract.falseCondition.should.be.a.Function()
      AbstractContract.should.have.ownProperty('mustNotHappen')
      AbstractContract.mustNotHappen.should.be.an.Array()
      AbstractContract.mustNotHappen.should.have.length(1)
      AbstractContract.mustNotHappen[0].should.equal(AbstractContract.falseCondition)
      AbstractContract.should.have.ownProperty('outcome')
      AbstractContract.outcome.should.be.a.Function()
      AbstractContract.should.have.ownProperty('callee')
      AbstractContract.callee.should.be.a.Function()

      AbstractContract.should.have.ownProperty('root')
      AbstractContract.root.should.be.an.instanceof(AbstractContract)
      const root = AbstractContract.root
      common.expectInvariants(root)
      root.pre.should.have.length(1)
      root.pre[0].should.equal(AbstractContract.falseCondition)
      root.post.should.be.empty()
      root.exception.should.be.empty()
      root.location.should.equal(AbstractContract.internalLocation)
      AbstractContract.should.have.ownProperty('AbstractError')
      AbstractContract.AbstractError.should.be.a.Function()
      AbstractContract.AbstractError.prototype.should.be.an.instanceof(Error)
      AbstractContract.should.have.ownProperty('prototype')
      AbstractContract.prototype.should.be.an.Object()
      const prototype = AbstractContract.prototype
      should(prototype._pre).be.null()
      should(prototype._post).be.null()
      should(prototype._exception).be.null()
      // noinspection JSUnresolvedVariable
      prototype.location.should.equal(AbstractContract.internalLocation)
      // noinspection JSUnresolvedVariable
      should(prototype.abstract).be.null()
      prototype.isImplementedBy.should.be.a.Function()
    })
  })

  describe('AbstractContract.bindContractFunction', function () {
    it('behaves as expected', function () {
      const subject = common.createCandidateContractFunction(AbstractContract)
      const result = AbstractContract.bindContractFunction.apply(subject)
      AbstractContract.isAGeneralContractFunction(result).should.be.true()
      Object.getPrototypeOf(result.contract).should.equal(subject.contract)
      result.location.should.equal(subject.location)
      if (AbstractContract.isAContractFunction(subject)) {
        AbstractContract.isAContractFunction(result).should.be.true()
      }
    })
  })

  describe('AbstractContract.isAGeneralizedContractFunction', function () {
    common.generateIAGCFTests(AbstractContract, AbstractContract.isAGeneralContractFunction)
    common.thingsThatAreNotAFunctionNorAContract
      .filter(v => !!v)
      .concat(['    at', 'at /', {}, AbstractContract.internalLocation])
      .forEach(v => {
        it(
          'says yes if there is an implementation Function, an AbstractContract, and a location that is ' +
            v +
            ', and all 3 properties are frozen, and it has the expected name',
          function () {
            const candidate = common.createCandidateContractFunction(AbstractContract, null, 'location', v)
            AbstractContract.isAGeneralContractFunction(candidate).should.be.ok()
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
      should(implFunction.prototype).be.an.Object() // this is here because Safari on iOS doesn't do this always!; by doing this test, the prototype is forced in Safari on iOS
      AbstractContract.bless(contractFunction, contract, implFunction, location)
      AbstractContract.isAContractFunction(contractFunction).should.be.true()
      testUtil.expectOwnFrozenProperty(contractFunction, 'contract')
      Object.getPrototypeOf(contractFunction.contract).should.equal(contract)
      testUtil.expectOwnFrozenProperty(contractFunction, 'implementation')
      contractFunction.implementation.should.equal(implFunction)
      testUtil.expectOwnFrozenProperty(contractFunction, 'location')
      contractFunction.location.should.equal(location)
      testUtil.expectOwnFrozenProperty(contractFunction, 'bind')
      contractFunction.bind.should.equal(AbstractContract.bindContractFunction)
      testUtil.expectFrozenDerivedPropertyOnAPrototype(contractFunction, 'name')
      contractFunction.should.have.ownProperty('name')
      contractFunction.name.should.equal(
        report.conciseCondition(AbstractContract.namePrefix, contractFunction.implementation)
      )
    })
  })

  describe('AbstractContract.falseCondition', function () {
    it('always returns false', function () {
      const result = AbstractContract.falseCondition()
      result.should.be.false()
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
        result.should.equal(argsResult)
      })
    })
  })

  describe('AbstractContract.callee', function () {
    argsCases.forEach(c => {
      it(`returns the expected element for an ${c.d} argument`, function () {
        const result = AbstractContract.callee(c.a)
        result.should.equal(argsCallee)
      })
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
            const result = new AbstractContract({
              pre: preConditions,
              post: postConditions,
              exception: exceptionConditions
            })
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
