/*
 Copyright 2015 - 2020 by Jan Dockx

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
      function testF () {
        return this.property
      }

      const boundThisPropertyValue = 'bound this property value'
      const boundThis = {
        property: boundThisPropertyValue
      }
      const boundF = testF.bind(boundThis)
      boundF().should.equal(boundThisPropertyValue)
      const otherThisPropertyValue = 'other this property value'
      const otherThis = {
        property: otherThisPropertyValue
      }
      const otherThisResult = boundF.call(otherThis)
      otherThisResult.should.equal(boundThisPropertyValue)
    })
    it('has no prototype', function () {
      function testF (p) {
        return 'just a function that returns ' + p
      }

      testF.should.have.property('prototype')
      const boundThis = { description: 'An object to bind to' }
      const boundP = 'a string parameter'
      const boundF = testF.bind(boundThis, boundP)
      boundF.should.not.have.property('prototype')
      /* https://www.ecma-international.org/ecma-262/6.0/index.html#sec-function.prototype.bind
         NOTE 1 Function objects created using Function.prototype.bind are exotic objects.
         They also do not have a prototype property.
       */
      boundF().should.endWith(boundP)
    })

    const cases = [{ description: 'An object to bind to' }, undefined, null]
    cases.forEach(function (boundThis) {
      it(
        'can be used out of the box as a constructor, and has weird instanceof behavior, bound to ' +
          JSON.stringify(boundThis),
        function () {
          // noinspection FunctionNamingConventionJS
          function TestC (pA, pB) {
            Object.getPrototypeOf(this).should.equal(TestC.prototype)
            this.pA = pA
            this.pB = pB
          }

          const boundPA = 'a string parameter'
          const boundPB = 'another string parameter'

          TestC.should.have.property('prototype')

          const testCInstance = new TestC(boundPA, boundPB)
          testCInstance.should.be.instanceof(TestC)
          testCInstance.pA.should.equal(boundPA)
          testCInstance.pB.should.equal(boundPB)
          Object.getPrototypeOf(testCInstance).should.equal(TestC.prototype)

          // noinspection LocalVariableNamingConventionJS
          const BoundC = TestC.bind(boundThis, boundPA)
          testCInstance.should.be.instanceof(BoundC)
          // NOTE ^^ THIS IS AMAZING!!! BoundC did not exist yet when testCInstance was created!
          BoundC.should.not.have.property('prototype')
          Object.getPrototypeOf(testCInstance).should.not.equal(BoundC.prototype)

          const boundCInstance = new BoundC(boundPB)
          /* NOTE This directly calls TestC, with a this with the TestC prototype, boundPA and boundPB. It is as if
                BoundC does not exist. The new knows what to do. */
          boundCInstance.should.be.instanceof(TestC)
          boundCInstance.should.be.instanceof(BoundC)
          boundCInstance.pA.should.equal(boundPA)
          boundCInstance.pB.should.equal(boundPB)
          boundCInstance.should.not.have.property('description')
          Object.getPrototypeOf(boundCInstance).should.equal(TestC.prototype)
          Object.getPrototypeOf(boundCInstance).should.not.equal(BoundC.prototype)
        }
      )
    })
  })
  describe('#prototype', function () {
    it('does not exist on the Function.prototype', function () {
      Function.prototype.should.not.have.property('prototype')
    })
    ;[
      function simpleF () {
        return 'This is a very simple function.'
      }
      // TODO support class construct
      // class SimpleClass {}
      /* MUDO getters and setters do not have a prototype!
         https://www.ecma-international.org/ecma-262/6.0/index.html#sec-method-definitions-runtime-semantics-propertydefinitionevaluation */
    ].forEach(function (f) {
      it('exists on function ' + f, function () {
        function otherSimpleF () {
          return 'This is another very simple function.'
        }

        Object.getPrototypeOf(f).should.equal(Function.prototype)
        f.should.have.ownProperty('prototype')
        f.prototype.should.be.an.Object()
        f.prototype.should.be.an.instanceof(Object)
        // noinspection JSPotentiallyInvalidConstructorUsage
        Object.getPrototypeOf(f.prototype).should.equal(Object.prototype)
        f.prototype.should.not.equal(Function.prototype)
        f.prototype.should.not.equal(Function.prototype.prototype)
        // noinspection JSPotentiallyInvalidConstructorUsage
        f.prototype.should.not.equal(otherSimpleF.prototype)
        f.prototype.should.have.ownProperty('constructor')
        f.prototype.constructor.should.equal(f)
        // noinspection JSPotentiallyInvalidConstructorUsage
        testUtil.log(JSON.stringify(f.prototype))
      })
      it('cannot be deleted (not enumerable and not configurable) from function ' + f, function () {
        testUtil.log(JSON.stringify(Object.getOwnPropertyDescriptor(f, 'prototype')))
        try {
          delete f.prototype
          true.should.be.false() // unreachable
        } catch (err) {
          err.should.be.an.Error()
          err.should.be.an.instanceof(TypeError)
        }
        Object.getOwnPropertyDescriptor(f, 'prototype').should.be.an.Object()
        Object.getOwnPropertyDescriptor(f, 'prototype').enumerable.should.be.false()
        Object.getOwnPropertyDescriptor(f, 'prototype').configurable.should.be.false()
        testUtil.log(JSON.stringify(Object.getOwnPropertyDescriptor(f, 'prototype')))
      })
    })
    it('is writable for a simple function', function () {
      function simpleF () {
        return 'This is a very simple function.'
      }

      Object.getOwnPropertyDescriptor(simpleF, 'prototype').should.be.an.Object()
      Object.getOwnPropertyDescriptor(simpleF, 'prototype').writable.should.be.true()
      testUtil.log(JSON.stringify(Object.getOwnPropertyDescriptor(simpleF, 'prototype')))
      const newObject = { name: 'a new object' }
      // noinspection JSPotentiallyInvalidConstructorUsage
      simpleF.prototype = newObject
      // noinspection JSPotentiallyInvalidConstructorUsage
      simpleF.prototype.should.equal(newObject)
    })
    it('does not exist by default on an arrow function', function () {
      const arrow = () => 'This is a very simple arrow function.'

      Object.getPrototypeOf(arrow).should.equal(Function.prototype)
      arrow.should.not.have.property('prototype')
    })
    it('can be created on an arrow function (but that makes no sense)', function () {
      const arrow = () => 'This is a very simple arrow function.'

      const p = {
        constructor: arrow
      }
      arrow.prototype = p
      Object.getPrototypeOf(arrow).should.equal(Function.prototype)
      arrow.prototype.should.equal(p)
      arrow.prototype.constructor.should.equal(arrow)
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
    ;[
      function simpleF () {
        return 'This is a very simple function.'
      }
      // TODO support class construct
      // class SimpleClass {}
    ].forEach(function (C) {
      it('can be used as a constructor ' + C, function () {
        const result = new C()
        result.should.be.an.Object()
        result.should.be.an.instanceof(C)
        Object.getPrototypeOf(result).should.equal(C.prototype)
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
      Object.getPrototypeOf(Arrow).should.equal(Function.prototype)
      Arrow.prototype.should.equal(p)
      Arrow.prototype.constructor.should.equal(Arrow)

      try {
        const obj = new Arrow()
        obj.should.not.be.an.Object() // unreachable
      } catch (err) {
        err.should.be.an.Error()
        err.should.be.instanceof(TypeError)
      }
    })
  })
  describe('name', function () {
    describe('isolated', function () {
      it('the name of a function is explicit', function () {
        function thisIsAFunction () {}

        thisIsAFunction.name.should.equal('thisIsAFunction')
      })
      it('the name of an anonymous function is inferred, except on Edge', function () {
        const thisIsAFunction = function () {}

        thisIsAFunction.name.should.equal(testUtil.environment === 'edge' ? '' : 'thisIsAFunction')
      })
      it('the name of an arrow function is inferred, even on Edge', function () {
        const thisIsAFunction = () => null

        thisIsAFunction.name.should.equal('thisIsAFunction')
      })
      it('the name of a named function is fixed', function () {
        const thisIsAnotherFunction = function thisIsAFunction () {}

        thisIsAnotherFunction.name.should.equal('thisIsAFunction')
      })
    })
    describe('method', function () {
      it('the name of an anonymous function method is inferred', function () {
        const obj = { thisIsAFunction: function () {} }

        obj.thisIsAFunction.name.should.equal('thisIsAFunction')
      })
      it('the name of an arrow function method is inferred', function () {
        const obj = { thisIsAFunction: () => null }

        obj.thisIsAFunction.name.should.equal('thisIsAFunction')
      })
      it('the name of a named function method is fixed', function () {
        const obj = { thisIsAnotherFunction: function thisIsAFunction () {} }

        obj.thisIsAnotherFunction.name.should.equal('thisIsAFunction')
      })
    })
    describe('argument', function () {
      it('the name of an anonymous function argument is the empty string', function () {
        function test (f) {
          f.name.should.be.a.String()
          f.name.should.equal('')
        }

        test(function () {})
      })
      it('the name of an arrow function argument is the empty string', function () {
        function test (f) {
          f.name.should.be.a.String()
          f.name.should.equal('')
        }

        test(() => null)
      })
      it('the name of an named function argument is fixed', function () {
        function test (f) {
          f.name.should.equal('thisIsAFunction')
        }

        test(function thisIsAFunction () {})
      })
    })
    describe('inline', function () {
      it('the name of an anonymous function is the empty string', function () {
        ;(function () {}.name.should.equal(''))
      })
      it('the name of an arrow function is the empty string', function () {
        ;(() => null).name.should.equal('')
      })
      it('the name of an named function is fixed', function () {
        ;(function thisIsAFunction () {}.name.should.equal('thisIsAFunction'))
      })
    })
  })
})
