/*
 Copyright 2016 - 2016 by Jan Dockx

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

module.exports = (function() {
  "use strict";

  var expect = require("chai").expect;
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");
  var Contract = require("../../src/I/Contract");

  var someConditions = [
    function() {return [];},
    function() {return ["shallow"];}
  ];
  var preCases = [
    function() {return null;}
  ].concat(someConditions);
  var postCases = [
    function() {return null;}
  ].concat(someConditions);
  var exceptionCases = [
    function() {return null;}
  ].concat(someConditions);

  //noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS
  var thingsThatAreNotAFunctionNorAContract = [
    undefined,
    null,
    "",
    "foo",
    0,
    -1,
    true,
    false,
    /lala/,
    {},
    new Date(),
    new Number(42),
    new Boolean(true),
    new String("lalala")
  ];

  var constructorPreCases = [
    function() {return undefined;}
  ].concat(preCases);
  var constructorPostCases = [
    function() {return undefined;}
  ].concat(postCases);
  var constructorExceptionCases = [
    function() {return undefined;}
  ].concat(exceptionCases);

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(Contract);
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "pre", "_pre");
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "post", "_post");
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "exception", "_exception");
  }

  function expectConstructorPost(pre, post, exception, result) {
    function expectArrayPost(array, propName, privatePropName) {
      if (!array) {
        expect(result[propName]).to.eql([]);
      }
      else {
        expect(result[privatePropName]).to.eql(array);
        expect(result[privatePropName]).to.not.equal(array);  // it must be copy, don't share the array
        expect(result[propName]).to.eql(array);
        expect(result[propName]).to.not.equal(result[privatePropName]);  // it must be copy, don't share the array
      }
    }

    it("has a shallow copy of the given pre-conditions", function() {
      expectArrayPost(pre, "pre", "_pre");
    });
    it("has a shallow copy of the given post-conditions", function() {
      expectArrayPost(post, "post", "_post");
    });
    it("has a shallow copy of the given exception-conditions", function() {
      expectArrayPost(exception, "exception", "_exception");
    });
    it("adheres to the invariants", function() {
      expectInvariants(result);
    });
  }

  // describe("I", function() {
    describe("I/Contract", function() {

      describe("Contract.contractFunctionDisplayName", function() {
        it("returns the expected display name with a named function", function() {
          function namedFunction() {}

          var result = Contract.contractFunctionDisplayName(namedFunction);
          expect(result).to.be.equal(Contract.displayNamePrefix + " namedFunction");
        });

        it("returns the expected display name with a named function with a display name", function() {
          function namedFunction() {}
          var displayName = "display name";
          namedFunction.displayName = displayName;

          var result = Contract.contractFunctionDisplayName(namedFunction);
          expect(result).to.be.equal(Contract.displayNamePrefix + " " + displayName);
        });

        it("returns the expected display name with an anonymous function", function() {
          var anonymousFunction = function() {};

          var result = Contract.contractFunctionDisplayName(anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(Contract.displayNamePrefix + " anonymousFunction");
        });

        it("returns the expected display name with an anonymous function with a display name", function() {
          var f = function() {};
          var displayName = "display name";
          f.displayName = displayName;

          var result = Contract.contractFunctionDisplayName(f);
          expect(result).to.be.equal(Contract.displayNamePrefix + " " + displayName);
        });

        it("returns the expected display name with an anonymous function as a method", function() {
          var obj = {
            anonymousFunction: function() {}
          };

          var result = Contract.contractFunctionDisplayName(obj.anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(Contract.displayNamePrefix + " anonymousFunction");
        });

        it("returns the expected display name with an named function function as a method", function() {
          var obj = {
            f: function namedFunction() {}
          };

          var result = Contract.contractFunctionDisplayName(obj.f);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(Contract.displayNamePrefix + " namedFunction");
        });

      });

      describe("Contract.isAContractFunction", function() {
        function createSubject(contract, implementation) {
          var subject = function() {};
          if (contract) {
            subject.contract = contract;
          }
          if (implementation) {
            subject.implementation = implementation;
          }
          return subject;
        }

        it("says no on any thing that is not a function", function() {
          thingsThatAreNotAFunctionNorAContract.forEach(function(thing) {
            //noinspection BadExpressionStatementJS
            expect(Contract.isAContractFunction(thing)).not.to.be.ok;
          });
        });
        it("says no if there is no Contract property, with or without an implementation", function() {
          thingsThatAreNotAFunctionNorAContract.concat([function() {}]).forEach(function(thing) {
            var subject = createSubject(thing);
            //noinspection BadExpressionStatementJS
            expect(Contract.isAContractFunction(subject)).not.to.be.ok;
            subject = createSubject(thing, function() {});
            //noinspection BadExpressionStatementJS
            expect(Contract.isAContractFunction(subject)).not.to.be.ok;
          });
        });
        it("says no if there is no implementation property, with or without a Contract", function() {
          thingsThatAreNotAFunctionNorAContract.forEach(function(thing) {
            var subject = createSubject(null, thing);
            //noinspection BadExpressionStatementJS
            expect(Contract.isAContractFunction(subject)).not.to.be.ok;
            subject = createSubject(new Contract(), thing);
            //noinspection BadExpressionStatementJS
            expect(Contract.isAContractFunction(subject)).not.to.be.ok;
          });
        });
        it("says no if there is an implementation Function, and a Contract, but the contract property is not frozen", function() {
          var subject = function() {};
          subject.contract = new Contract();
          Object.freeze(subject.contract);
          util.setAndFreezeProperty(subject, "implementation", function() {});
          //noinspection BadExpressionStatementJS
          expect(Contract.isAContractFunction(subject)).not.to.be.ok;
        });
        it("says no if there is an implementation Function, and a Contract, but the implementation is not frozen", function() {
          var subject = function() {};
          util.setAndFreezeProperty(subject, "contract", new Contract());
          Object.freeze(subject.contract);
          subject.implementation = function() {};
          //noinspection BadExpressionStatementJS
          expect(Contract.isAContractFunction(subject)).not.to.be.ok;
        });
        it("says no if the contract is not frozen", function() {
          var subject = function() {};
          util.setAndFreezeProperty(subject, "contract", new Contract());
          util.setAndFreezeProperty(subject, "implementation", function() {});
          //noinspection BadExpressionStatementJS
          expect(Contract.isAContractFunction(subject)).not.to.be.ok;
        });
        it("says yes if there is an implementation Function, and a Contract, and both properties are frozen, " +
           "and the contract is frozen, and the name of the subject is the same as of the implementation, and " +
           "it has the expected display name", function() {
          function subject() {}
          function implementationFunction() {}

          util.setAndFreezeProperty(subject, "contract", new Contract());
          Object.freeze(subject.contract);
          util.setAndFreezeProperty(subject, "implementation", implementationFunction);
          util.setAndFreezeProperty(subject, "name", implementationFunction.name);
          util.setAndFreezeProperty(subject, "displayName", Contract.contractFunctionDisplayName(implementationFunction));
          //noinspection BadExpressionStatementJS
          expect(Contract.isAContractFunction(subject)).to.be.ok;
        });
      });

      describe("Contract.dummyImplementation", function() {
        it("returns a function that is a contract function", function() {
          var result = Contract.dummyImplementation();
          expect(result).to.satisfy(function(cf) {return Contract.isAContractFunction(cf);});
        });
      });

      describe("#Contract()", function() {
        constructorPreCases.forEach(function(pre) {
          constructorPostCases.forEach(function(post) {
            constructorExceptionCases.forEach(function(exception) {
              describe("works for pre: " + pre + ", post: " + post + ", exception: " + exception, function() {
                var preConditions = pre();
                var postConditions = post();
                var exceptionConditions = exception();
                var result = new Contract(preConditions, postConditions, exceptionConditions);
                expectConstructorPost(preConditions, postConditions, exceptionConditions, result);
              });
            });
          });
        });
      });

      describe("#isImplementedBy()", function() {
        it("says no if the argument is not a contract function", function() {
          thingsThatAreNotAFunctionNorAContract
            .concat(["function() {}"])
            .forEach(function(thing) {
              var subject = new Contract();
              //noinspection BadExpressionStatementJS
              expect(subject.isImplementedBy(thing)).not.to.be.ok;
              expectInvariants(subject);
            });
        });
        it("says no if the argument is a contract function for another contract", function() {
          var subject = new Contract();
          var f = function() {};
          f.contract = new Contract();
          f.implementation = function() {};
          //noinspection BadExpressionStatementJS
          expect(subject.isImplementedBy(f)).not.to.be.ok;
          expectInvariants(subject);
        });
        it("says yes if the argument is a contract function for the contract", function() {
          function implementationFunction() {}

          var subject = new Contract();
          Object.freeze(subject);
          var f = function() {};
          util.setAndFreezeProperty(f, "contract", subject);
          util.setAndFreezeProperty(f, "implementation", implementationFunction);
          util.setAndFreezeProperty(f, "name", implementationFunction.name);
          util.setAndFreezeProperty(f, "displayName", Contract.contractFunctionDisplayName(implementationFunction));

          //noinspection BadExpressionStatementJS
          expect(subject.isImplementedBy(f)).to.be.ok;
          expectInvariants(subject);
        });
      });

    });
  // });

  return {
    preCases: preCases,
    postCases: postCases,
    exceptionCases: exceptionCases,
    thingsThatAreNotAFunctionNorAContract: thingsThatAreNotAFunctionNorAContract,
    constructorPreCases: constructorPreCases,
    constructorPostCases: constructorPostCases,
    constructorExceptionCases: constructorExceptionCases,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost
  };

})();
