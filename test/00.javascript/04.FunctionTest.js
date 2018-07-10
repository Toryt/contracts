/*
 Copyright 2015 - 2017 by Jan Dockx

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

describe('javascript/Function', function () {
  describe('#bind()', function () {
    it('keeps a call of a bound function with another this bound to the bound this', function () {
      function testF () { return this.property }

      const boundThisPropertyValue = 'bound this property value'
      const boundThis = {
        property: boundThisPropertyValue
      }
      const boundF = testF.bind(boundThis)
      boundF().must.equal(boundThisPropertyValue)
      const otherThisPropertyValue = 'other this property value'
      const otherThis = {
        property: otherThisPropertyValue
      }
      const otherThisResult = boundF.call(otherThis)
      otherThisResult.must.equal(boundThisPropertyValue)
    })
    it('has no prototype', function () {
      function testF (p) { return 'just a function that returns ' + p }

      testF.must.have.property('prototype')
      const boundThis = {description: 'An object to bind to'}
      const boundP = 'a string parameter'
      const boundF = testF.bind(boundThis, boundP)
      boundF.must.not.have.property('prototype')
      /* https://www.ecma-international.org/ecma-262/6.0/index.html#sec-function.prototype.bind
         NOTE 1 Function objects created using Function.prototype.bind are exotic objects.
         They also do not have a prototype property.
       */
      boundF().must.endWith(boundP)
    })

    const cases = [
      {description: 'An object to bind to'},
      undefined,
      null
    ]
    cases.forEach(function (boundThis) {
      it('can be used out of the box as a constructor, and has weird instanceof behavior, bound to ' + JSON.stringify(boundThis), function () {
        // noinspection FunctionNamingConventionJS
        function TestC (pA, pB) {
          Object.getPrototypeOf(this).must.equal(TestC.prototype)
          this.pA = pA
          this.pB = pB
        }

        const boundPA = 'a string parameter'
        const boundPB = 'another string parameter'

        TestC.must.have.property('prototype')

        const testCInstance = new TestC(boundPA, boundPB)
        testCInstance.must.be.instanceof(TestC)
        testCInstance.pA.must.equal(boundPA)
        testCInstance.pB.must.equal(boundPB)
        Object.getPrototypeOf(testCInstance).must.equal(TestC.prototype)

        // noinspection LocalVariableNamingConventionJS
        const BoundC = TestC.bind(boundThis, boundPA)
        testCInstance.must.be.instanceof(BoundC)
        // NOTE ^^ THIS IS AMAZING!!! BoundC did not exist yet when testCInstance was created!
        BoundC.must.not.have.property('prototype')
        Object.getPrototypeOf(testCInstance).must.not.equal(BoundC.prototype)

        const boundCInstance = new BoundC(boundPB)
        /* NOTE This directly calls TestC, with a this with the TestC prototype, boundPA and boundPB. It is as if
                BoundC does not exist. The new knows what to do. */
        boundCInstance.must.be.instanceof(TestC)
        boundCInstance.must.be.instanceof(BoundC)
        boundCInstance.pA.must.equal(boundPA)
        boundCInstance.pB.must.equal(boundPB)
        boundCInstance.must.not.have.property('description')
        Object.getPrototypeOf(boundCInstance).must.equal(TestC.prototype)
        Object.getPrototypeOf(boundCInstance).must.not.equal(BoundC.prototype)
      })
    })
  })
  describe('#prototype', function () {
    it('does not exist on the Function.prototype', function () {
      Function.prototype.must.not.have.property('prototype')
    });
    [
      function simpleF () { return 'This is a very simple function.' }
      // TODO support class construct
      // class SimpleClass {}
      /* MUDO getters and setters do not have a prototype!
         https://www.ecma-international.org/ecma-262/6.0/index.html#sec-method-definitions-runtime-semantics-propertydefinitionevaluation */
    ].forEach(function (f) {
      it('exists on function ' + f, function () {
        function otherSimpleF () { return 'This is another very simple function.' }

        Object.getPrototypeOf(f).must.equal(Function.prototype)
        f.must.have.ownProperty('prototype')
        f.prototype.must.be.an.object()
        f.prototype.must.be.an.instanceof(Object)
        // noinspection JSPotentiallyInvalidConstructorUsage
        Object.getPrototypeOf(f.prototype).must.equal(Object.prototype)
        f.prototype.must.not.equal(Function.prototype)
        f.prototype.must.not.equal(Function.prototype.prototype)
        // noinspection JSPotentiallyInvalidConstructorUsage
        f.prototype.must.not.equal(otherSimpleF.prototype)
        f.prototype.must.have.ownProperty('constructor')
        f.prototype.constructor.must.equal(f)
        // noinspection JSPotentiallyInvalidConstructorUsage
        testUtil.log(JSON.stringify(f.prototype))
      })
      it('cannot be deleted (not enumerable and not configurable) from function ' + f, function () {
        testUtil.log(JSON.stringify(Object.getOwnPropertyDescriptor(f, 'prototype')))
        try {
          delete f.prototype
          true.must.false() // unreachable
        } catch (err) {
          err.must.be.an.instanceof(TypeError)
        }
        Object.getOwnPropertyDescriptor(f, 'prototype').must.be.an.object()
        Object.getOwnPropertyDescriptor(f, 'prototype').enumerable.must.be.false()
        Object.getOwnPropertyDescriptor(f, 'prototype').configurable.must.be.false()
        testUtil.log(JSON.stringify(Object.getOwnPropertyDescriptor(f, 'prototype')))
      })
    })
    it('is writable for a simple function', function () {
      function simpleF () { return 'This is a very simple function.' }

      Object.getOwnPropertyDescriptor(simpleF, 'prototype').must.be.an.object()
      Object.getOwnPropertyDescriptor(simpleF, 'prototype').writable.must.be.true()
      testUtil.log(JSON.stringify(Object.getOwnPropertyDescriptor(simpleF, 'prototype')))
      const newObject = {name: 'a new object'}
      // noinspection JSPotentiallyInvalidConstructorUsage
      simpleF.prototype = newObject
      // noinspection JSPotentiallyInvalidConstructorUsage
      simpleF.prototype.must.equal(newObject)
    })
    it('does not exist by default on an arrow function', function () {
      const arrow = () => 'This is a very simple arrow function.'

      Object.getPrototypeOf(arrow).must.equal(Function.prototype)
      arrow.must.not.have.property('prototype')
    })
    it('can be created on an arrow function (but that makes no sense)', function () {
      const arrow = () => 'This is a very simple arrow function.'

      const p = {
        constructor: arrow
      }
      arrow.prototype = p
      Object.getPrototypeOf(arrow).must.equal(Function.prototype)
      arrow.prototype.must.equal(p)
      arrow.prototype.constructor.must.equal(arrow)
    })
    // TODO support class construct
    // it("is not writable for a class", function() {
    //  class SimpleClass {}
    //
    //  expect(SimpleClass).to.have.ownPropertyDescriptor("prototype").that.has.property("writable", false);
    //  testUtil.log(JSON.stringify(Object.getOwnPropertyDescriptor(SimpleClass, "prototype")));
    //  const newObject = {name: "a new object"};
    //  try {
    //    //noinspection JSPotentiallyInvalidConstructorUsage
    //    SimpleClass.prototype = newObject;
    //  }
    //  catch (err) {
    //    expect(err).to.be.instanceOf(TypeError);
    //  }
    // });
  })
  describe('new', function () {
    [
      function simpleF () { return 'This is a very simple function.' }
      // TODO support class construct
      // class SimpleClass {}
    ].forEach(function (C) {
      it('can be used as a constructor ' + C, function () {
        const result = new C()
        result.must.be.an.object()
        result.must.be.an.instanceOf(C)
        Object.getPrototypeOf(result).must.equal(C.prototype)
        testUtil.log(JSON.stringify(result))
      })
    })
    it('cannot be used with an arrow function', function () {
      // noinspection LocalVariableNamingConventionJS
      const Arrow = () => 'This is a very simple arrow function.'

      const p = {
        constructor: Arrow
      }
      Arrow.prototype = p
      Object.getPrototypeOf(Arrow).must.equal(Function.prototype)
      Arrow.prototype.must.equal(p)
      Arrow.prototype.constructor.must.equal(Arrow)

      try {
        const obj = new Arrow()
        obj.must.not.be.an.object() // unreachable
      } catch (err) {
        err.must.be.an.error(TypeError)
      }
    })
  })
})
