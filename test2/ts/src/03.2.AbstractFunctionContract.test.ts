/*
  Copyright 2016–2025 Jan Dockx

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

import should from 'should'
import { AbstractFunctionContract } from '../../../src/AbstractFunctionContract.ts'
import { testName } from '../../util/testName.ts'

// const testUtil = require('./_util/testUtil')
// const stack = require('../lib/_private/stack')
// const report = require('../lib/_private/report')
// const common = require('./AbstractContractCommon')
// const should = require('should')

describe(testName(import.meta), function () {
  describe('AbstractFunctionContract', function () {
    it('has the expected properties', function () {
      AbstractFunctionContract.should.have.ownProperty('namePrefix')
      AbstractFunctionContract.namePrefix.should.be.a.String()
      // AbstractFunctionContract.should.have.ownProperty('bindContractFunction')
      // AbstractFunctionContract.bindContractFunction.should.be.a.Function()
      // AbstractFunctionContract.should.have.ownProperty('isAContractFunction')
      // AbstractFunctionContract.isAContractFunction.should.be.a.Function()
      // AbstractFunctionContract.should.have.ownProperty('bless')
      // AbstractFunctionContract.bless.should.be.a.Function()
      AbstractFunctionContract.should.have.ownProperty('internalLocation')
      AbstractFunctionContract.internalLocation.should.be.an.Object()
      ;('' + AbstractFunctionContract.internalLocation).should.be.equal('INTERNAL')
      AbstractFunctionContract.should.have.ownProperty('falseCondition')
      AbstractFunctionContract.falseCondition.should.be.a.Function()
      AbstractFunctionContract.should.have.ownProperty('mustNotHappen')
      AbstractFunctionContract.mustNotHappen.should.be.an.Array()
      AbstractFunctionContract.mustNotHappen.should.have.length(1)
      should(AbstractFunctionContract.mustNotHappen[0]).equal(AbstractFunctionContract.falseCondition)
      // AbstractFunctionContract.should.have.ownProperty('outcome')
      // AbstractFunctionContract.outcome.should.be.a.Function()
      // AbstractFunctionContract.should.have.ownProperty('callee')
      // AbstractFunctionContract.callee.should.be.a.Function()
      //
      // AbstractFunctionContract.should.have.ownProperty('root')
      // AbstractFunctionContract.root.should.be.an.instanceof(AbstractFunctionContract)
      // const root = AbstractFunctionContract.root
      // common.expectInvariants(root)
      // root.pre.should.have.length(1)
      // root.pre[0].should.equal(AbstractFunctionContract.falseCondition)
      // root.post.should.be.empty()
      // root.exception.should.be.empty()
      // root.location.should.equal(AbstractFunctionContract.internalLocation)
      // AbstractFunctionContract.should.have.ownProperty('AbstractError')
      // AbstractFunctionContract.AbstractError.should.be.a.Function()
      // AbstractFunctionContract.AbstractError.prototype.should.be.an.instanceof(Error)
      // AbstractFunctionContract.should.have.ownProperty('prototype')
      // AbstractFunctionContract.prototype.should.be.an.Object()
      // const prototype = AbstractFunctionContract.prototype
      // should(prototype._pre).be.null()
      // should(prototype._post).be.null()
      // should(prototype._exception).be.null()
      // prototype.location.should.equal(AbstractFunctionContract.internalLocation)
      // should(prototype.abstract).be.null()
      // prototype.isImplementedBy.should.be.a.Function()
    })
  })

  // describe('AbstractFunctionContract.bindContractFunction', function () {
  //   it('behaves as expected', function () {
  //     const subject = common.createCandidateContractFunction(AbstractFunctionContract)
  //     const result = AbstractFunctionContract.bindContractFunction.apply(subject)
  //     AbstractFunctionContract.isAGeneralContractFunction(result).should.be.true()
  //     Object.getPrototypeOf(result.contract).should.equal(subject.contract)
  //     result.location.should.equal(subject.location)
  //     if (AbstractFunctionContract.isAContractFunction(subject)) {
  //       AbstractFunctionContract.isAContractFunction(result).should.be.true()
  //     }
  //   })
  // })
  //
  // describe('AbstractFunctionContract.isAGeneralizedContractFunction', function () {
  //   common.generateIAGCFTests(AbstractFunctionContract, AbstractFunctionContract.isAGeneralContractFunction)
  //   common.thingsThatAreNotAFunctionNorAContract
  //     .filter(v => !!v)
  //     .concat(['    at', 'at /', {}, AbstractFunctionContract.internalLocation])
  //     .forEach(v => {
  //       it(
  //         'says yes if there is an implementation Function, an AbstractFunctionContract, and a location that is ' +
  //           v +
  //           ', and all 3 properties are frozen, and it has the expected name',
  //         function () {
  //           const candidate = common.createCandidateContractFunction(AbstractFunctionContract, null, 'location', v)
  //           AbstractFunctionContract.isAGeneralContractFunction(candidate).should.be.ok()
  //         }
  //       )
  //     })
  // })
  //
  // common.generateConstructorMethodsDescriptions(AbstractFunctionContract)
  //
  // describe('AbstractFunctionContract.bless', function () {
  //   it('behaves as expected', function () {
  //     const contractFunction = function () {}
  //     const contract = new AbstractFunctionContract({})
  //     const implFunction = function () {}
  //     const location = stack.location()
  //     should(implFunction.prototype).be.an.Object() // this is here because Safari on iOS doesn't do this always!; by doing this test, the prototype is forced in Safari on iOS
  //     AbstractFunctionContract.bless(contractFunction, contract, implFunction, location)
  //     AbstractFunctionContract.isAContractFunction(contractFunction).should.be.true()
  //     testUtil.expectOwnFrozenProperty(contractFunction, 'contract')
  //     Object.getPrototypeOf(contractFunction.contract).should.equal(contract)
  //     testUtil.expectOwnFrozenProperty(contractFunction, 'implementation')
  //     contractFunction.implementation.should.equal(implFunction)
  //     testUtil.expectOwnFrozenProperty(contractFunction, 'location')
  //     contractFunction.location.should.equal(location)
  //     testUtil.expectOwnFrozenProperty(contractFunction, 'bind')
  //     contractFunction.bind.should.equal(AbstractFunctionContract.bindContractFunction)
  //     contractFunction.should.have.ownProperty('name')
  //     contractFunction.name.should.equal(
  //       report.conciseCondition(AbstractFunctionContract.namePrefix, contractFunction.implementation)
  //     )
  //     const implFunctionNamePropDesc = Object.getOwnPropertyDescriptor(implFunction, 'name')
  //     delete implFunctionNamePropDesc.value
  //     const contractFunctionNamePropDesc = Object.getOwnPropertyDescriptor(contractFunction, 'name')
  //     contractFunctionNamePropDesc.value.should.equal(
  //       report.conciseCondition(AbstractFunctionContract.namePrefix, contractFunction.implementation)
  //     )
  //     delete contractFunctionNamePropDesc.value
  //     contractFunctionNamePropDesc.should.deepEqual(implFunctionNamePropDesc)
  //   })
  // })
  //
  // describe('AbstractFunctionContract.falseCondition', function () {
  //   it('always returns false', function () {
  //     const result = AbstractFunctionContract.falseCondition()
  //     result.should.be.false()
  //   })
  // })
  //
  // const argsResult = 'a result'
  // const argsCallee = function () {}
  // const argsCase = ['lala', 'lulu', 4, argsResult, argsCallee]
  // function args() {
  //   return arguments
  // }
  // const argsCases = [
  //   { a: argsCase, d: 'array' },
  //   { a: args.apply(null, argsCase), d: 'arguments' }
  // ]
  //
  // describe('AbstractFunctionContract.outcome', function () {
  //   argsCases.forEach(c => {
  //     it(`returns the expected element for an ${c.d} argument`, function () {
  //       const result = AbstractFunctionContract.outcome(c.a)
  //       result.should.equal(argsResult)
  //     })
  //   })
  // })
  //
  // describe('AbstractFunctionContract.callee', function () {
  //   argsCases.forEach(c => {
  //     it(`returns the expected element for an ${c.d} argument`, function () {
  //       const result = AbstractFunctionContract.callee(c.a)
  //       result.should.equal(argsCallee)
  //     })
  //   })
  // })
  //
  // describe('#AbstractFunctionContract()', function () {
  //   common.constructorPreCases.forEach(pre => {
  //     common.constructorPostCases.forEach(post => {
  //       common.constructorExceptionCases.forEach(exception => {
  //         it('works for pre: ' + pre + ', post: ' + post + ', exception: ' + exception, function () {
  //           const preConditions = pre()
  //           const postConditions = post()
  //           const exceptionConditions = exception()
  //           const result = new AbstractFunctionContract({
  //             pre: preConditions,
  //             post: postConditions,
  //             exception: exceptionConditions
  //           })
  //           common.expectConstructorPost(preConditions, postConditions, exceptionConditions, stack.location(), result)
  //         })
  //       })
  //     })
  //   })
  // })
  //
  // common.generatePrototypeMethodsDescriptions(
  //   () => new AbstractFunctionContract({}),
  //   testUtil
  //     .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
  //     .map(parameters => ({
  //       subject: () =>
  //         new AbstractFunctionContract({
  //           pre: parameters[0](),
  //           post: parameters[1](),
  //           exception: parameters[2]()
  //         }),
  //       description: parameters.join(' - ')
  //     }))
  // )
})
