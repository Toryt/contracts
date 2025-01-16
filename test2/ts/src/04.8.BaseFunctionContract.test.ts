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

import should from 'should'
import { BaseFunctionContract } from '../../../src/BaseFunctionContract.ts'
import { location } from '../../../src/location.ts'
import { testName } from '../../util/testName.ts'
import { expectConstructorPost } from './BaseFunctionContractCommon.ts'

// const testUtil = require('./_util/testUtil')
// const stack = require('../lib/_private/stack')
// const report = require('../lib/_private/report')
// const common = require('./AbstractContractCommon')
// const should = require('should')

describe(testName(import.meta), function () {
  describe('BaseFunctionContract', function () {
    it('has the expected properties', function () {
      BaseFunctionContract.should.have.ownProperty('namePrefix')
      BaseFunctionContract.namePrefix.should.be.a.String()
      // BaseFunctionContract.should.have.ownProperty('isAContractFunction')
      // BaseFunctionContract.isAContractFunction.should.be.a.Function()
      BaseFunctionContract.should.have.ownProperty('falseCondition')
      BaseFunctionContract.falseCondition.should.be.a.Function()
      BaseFunctionContract.should.have.ownProperty('mustNotHappen')
      BaseFunctionContract.mustNotHappen.should.be.an.Array()
      BaseFunctionContract.mustNotHappen.should.have.length(1)
      should(BaseFunctionContract.mustNotHappen[0]).equal(BaseFunctionContract.falseCondition)
      // BaseFunctionContract.should.have.ownProperty('outcome')
      // BaseFunctionContract.outcome.should.be.a.Function()
      // BaseFunctionContract.should.have.ownProperty('callee')
      // BaseFunctionContract.callee.should.be.a.Function()
      //
      // MUDO
      // unknownFunctionContract.should.be.an.instanceof(BaseFunctionContract)
      // expectInvariants(unknownFunctionContract)
      // MUDO
      // unknownFunctionContract.pre.should.have.length(1)
      // unknownFunctionContract.pre[0].should.equal(BaseFunctionContract.falseCondition)
      // unknownFunctionContract.post.should.be.empty()
      // unknownFunctionContract.exception.should.be.empty()
      // unknownFunctionContract.location.should.equal(internalLocation)
      // MUDO
      // BaseFunctionContract.AbstractError.should.be.a.Function()
      // BaseFunctionContract.AbstractError.prototype.should.be.an.instanceof(Error)
      // BaseFunctionContract.should.have.ownProperty('prototype')
      BaseFunctionContract.prototype.should.be.an.Object()
      // const prototype = BaseFunctionContract.prototype
      // should(prototype._pre).be.null()
      // should(prototype._post).be.null()
      // should(prototype._exception).be.null()
      // prototype.location.should.equal(internalLocation)
      // should(prototype.abstract).be.null()
      // prototype.isImplementedBy.should.be.a.Function()
    })
  })

  // common.generateConstructorMethodsDescriptions(BaseFunctionContract)
  //

  //
  // describe('BaseFunctionContract.falseCondition', function () {
  //   it('always returns false', function () {
  //     const result = BaseFunctionContract.falseCondition()
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
  // describe('BaseFunctionContract.outcome', function () {
  //   argsCases.forEach(c => {
  //     it(`returns the expected element for an ${c.d} argument`, function () {
  //       const result = BaseFunctionContract.outcome(c.a)
  //       result.should.equal(argsResult)
  //     })
  //   })
  // })
  //
  // describe('BaseFunctionContract.callee', function () {
  //   argsCases.forEach(c => {
  //     it(`returns the expected element for an ${c.d} argument`, function () {
  //       const result = BaseFunctionContract.callee(c.a)
  //       result.should.equal(argsCallee)
  //     })
  //   })
  // })

  describe('BaseFunctionContract()', function () {
    // common.constructorPreCases.forEach(pre => {
    //   common.constructorPostCases.forEach(post => {
    //     common.constructorExceptionCases.forEach(exception => {
    it('works with the BaseFunctionContract location', /* 'works for pre: ' + pre + ', post: ' + post + ', exception: ' + exception */ function testAFCWithoutLocationCorrection() {
      // MUDO
      // const preConditions = pre()
      // const postConditions = post()
      // const exceptionConditions = exception()
      const result = new BaseFunctionContract({
        /*
        // pre: preConditions,
        // post: postConditions,
        // exception: exceptionConditions
        */
      })
      /* location is expected to contain the name of the `AFCWithoutLocationCorrection` constructor, because the
         `BaseFunctionContract`, where the location is determined as “1-up”, is called there. */
      expectConstructorPost(/* preConditions, postConditions, exceptionConditions, */ location(), result)
    })

    it('works with a given location', /* 'works for pre: ' + pre + ', post: ' + post + ', exception: ' + exception */ function testAFConstructor() {
      const theLocation = location(2) // just some random location
      // MUDO
      // const preConditions = pre()
      // const postConditions = post()
      // const exceptionConditions = exception()
      const result = new BaseFunctionContract(
        {
          /*
        // pre: preConditions,
        // post: postConditions,
        // exception: exceptionConditions
        */
        },
        theLocation
      )
      expectConstructorPost(/* preConditions, postConditions, exceptionConditions, */ theLocation, result)
    })
    //     })
    //   })
    // })
  })

  // common.generatePrototypeMethodsDescriptions(
  //   () => new BaseFunctionContract({}),
  //   testUtil
  //     .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
  //     .map(parameters => ({
  //       subject: () =>
  //         new BaseFunctionContract({
  //           pre: parameters[0](),
  //           post: parameters[1](),
  //           exception: parameters[2]()
  //         }),
  //       description: parameters.join(' - ')
  //     }))
  // )
})
