/*
 Copyright 2016 - 2017 by Jan Dockx

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

(function(factory) {
  "use strict";

  var dependencies = ["../_util/describe", "../_util/it", "../_util/expect", "../_util/testUtil",
                      "𝕋合同/_private/util", "𝕋合同/I/AbstractContract"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, util, AbstractContract) {
  "use strict";

  var someConditions = [
    function() {return [];},
    function() {return [function() {return false;}, function() {return true;}];}
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

  //noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS,JSHint
  var notAFunctionNorAContract = [
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

  var location = util.eol + "    at /";

  function expectInvariants(/*AbstractContract*/ subject) {
    expect(subject).to.be.an.instanceOf(AbstractContract);
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "pre", "_pre");
    testUtil.expectToBeArrayOfFunctions(subject.pre);
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "post", "_post");
    testUtil.expectToBeArrayOfFunctions(subject.post);
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "exception", "_exception");
    testUtil.expectToBeArrayOfFunctions(subject.exception);
    testUtil.expectOwnFrozenProperty(subject, "location");
    expect(subject.location).to.satisfy(function(location) {
      return location === AbstractContract.internalLocation || util.isALocationOutsideLibrary(location);
    });
    testUtil.expectOwnFrozenProperty(subject, "abstract");
    var abstract = subject.abstract;
    expect(abstract).to.satisfy(function(cf) {return AbstractContract.isAGeneralContractFunction(cf);});
    expect(abstract).to.have.property("location").that.equals(subject.location);
    expect(abstract).to.satisfy(function(cf) {return subject.isImplementedBy(cf);});
    expect(abstract).to.throw(AbstractContract.AbstractError, AbstractContract.AbstractError.message);
    try {
      abstract();
    }
    catch (err) {
      testUtil.log(err.stack);
    }
  }

  function expectConstructorPost(pre, post, exception, result) {
    function expectArrayPost(array, propName, privatePropName) {
      if (!array) {
        expect(result[propName]).to.eql([]);
      }
      else {
        expect(result[privatePropName]).to.eql(array);
        expect(result[privatePropName]).to.not.equal(array);  // it must be copy, don't share the array
        //noinspection BadExpressionStatementJS,JSHint
        expect(result[privatePropName]).to.be.frozen;
        expect(result[propName]).to.eql(array);
        expect(result[propName]).to.not.equal(result[privatePropName]);  // it must be copy, don't share the array
      }
    }

    it("has a shallow copy of the given pre-conditions, and the private array is frozen", function() {
      expectArrayPost(pre, "pre", "_pre");
    });
    it("has a shallow copy of the given post-conditions, and the private array is frozen", function() {
      expectArrayPost(post, "post", "_post");
    });
    it("has a shallow copy of the given exception-conditions, and the private array is frozen", function() {
      expectArrayPost(exception, "exception", "_exception");
    });
    it("adheres to the invariants", function() {
      expectInvariants(result);
    });
  }

  function createCandidateContractFunction(doNotFreezeProperty, // jshint ignore:line
                                           otherPropertyName,
                                           otherPropertyValue) {
    function candidate() {}

    function impl() {}

    var contract = otherPropertyName === "contract"
      ? otherPropertyValue
      : new AbstractContract({});
    var implementation = otherPropertyName === "implementation" ? otherPropertyValue : impl;
    var location = otherPropertyName === "location" ? otherPropertyValue : util.firstLocationOutsideLibrary();
    var bind = otherPropertyName === "bind" ? otherPropertyValue : AbstractContract.bindContractFunction;

    if (doNotFreezeProperty === "contract") {
      candidate.contract = contract;
    }
    else {
      util.setAndFreezeProperty(candidate, "contract", contract);
    }
    if (doNotFreezeProperty === "implementation") {
      candidate.implementation = implementation;
    }
    else {
      util.setAndFreezeProperty(candidate, "implementation", implementation);
    }
    if (doNotFreezeProperty === "location") {
      candidate.location = location;
    }
    else {
      util.setAndFreezeProperty(candidate, "location", location);
    }
    if (doNotFreezeProperty === "bind") {
      candidate.bind = bind;
    }
    else {
      util.setAndFreezeProperty(candidate, "bind", bind);
    }
    candidate.displayName =
      (otherPropertyName === "displayName")
        ? otherPropertyValue
        : AbstractContract.contractFunctionDisplayName(candidate);
    return candidate;
  }

  //noinspection JSUnusedLocalSymbols,FunctionNamingConventionJS
  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
    var self = this; // jshint ignore:line

    describe("#isImplementedBy()", function() {
      it("says yes if the argument is a contract function for the contract", function() {
        var subject = oneSubjectGenerator();
        var f = createCandidateContractFunction(null, "contract", subject);
        //noinspection BadExpressionStatementJS,JSHint
        expect(subject.isImplementedBy(f)).to.be.ok;
        self.expectInvariants(subject);
      });
      notAFunctionNorAContract
        .concat(["function() {}"])
        .forEach(function(thing) {
          it("says no if the argument is not a contract function but " + thing, function() {
            var subject = oneSubjectGenerator();
            //noinspection BadExpressionStatementJS,JSHint
            expect(subject.isImplementedBy(thing)).not.to.be.ok;
            self.expectInvariants(subject);
          });
      });
      it("says no if the argument is a contract function for another contract", function() {
        var subject = oneSubjectGenerator();
        var otherContract = oneSubjectGenerator();
        var f = createCandidateContractFunction(null, "contract", otherContract);
        //noinspection BadExpressionStatementJS,JSHint
        expect(subject.isImplementedBy(f)).not.to.be.ok;
        self.expectInvariants(subject);
      });
    });

  }

  return {
    preCases: preCases,
    postCases: postCases,
    exceptionCases: exceptionCases,
    thingsThatAreNotAFunctionNorAContract: notAFunctionNorAContract,
    constructorPreCases: constructorPreCases,
    constructorPostCases: constructorPostCases,
    constructorExceptionCases: constructorExceptionCases,
    location: location,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    createCandidateContractFunction: createCandidateContractFunction,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };

}));
