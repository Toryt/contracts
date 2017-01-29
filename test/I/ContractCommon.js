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

  var location = util.eol + "    at /";

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(Contract);
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "pre", "_pre");
    testUtil.expectToBeArrayOfFunctions(subject.pre);
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "post", "_post");
    testUtil.expectToBeArrayOfFunctions(subject.post);
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "exception", "_exception");
    testUtil.expectToBeArrayOfFunctions(subject.exception);
    testUtil.expectOwnFrozenProperty(subject, "location");
    expect(subject.location).to.satisfy(function(location) {return util.isALocationOutsideLibrary(location);});
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

  function createCandidateContractFunction(dontFreezeContract,
                                           dontFreezeProperty,
                                           otherPropertyName,
                                           otherPropertyValue) {
    function candidate() {}

    function impl() {}

    var contract = otherPropertyName === "contract" ? otherPropertyValue : new Contract();
    var implementation = otherPropertyName === "implementation" ? otherPropertyValue : impl;
    var location = otherPropertyName === "location" ? otherPropertyValue : util.firstLocationOutsideLibrary();

    if (!dontFreezeContract) {
      Object.freeze(contract);
    }
    if (dontFreezeProperty === "contract") {
      candidate.contract = contract;
    }
    else {
      util.setAndFreezeProperty(candidate, "contract", contract);
    }
    if (dontFreezeProperty === "implementation") {
      candidate.implementation = implementation;
    }
    else {
      util.setAndFreezeProperty(candidate, "implementation", implementation);
    }
    if (dontFreezeProperty === "location") {
      candidate.location = location;
    }
    else {
      util.setAndFreezeProperty(candidate, "location", location);
    }
    candidate.displayName =
      (otherPropertyName === "displayName")
        ? otherPropertyValue
        : Contract.contractFunctionDisplayName(candidate);
    return candidate;
  }

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
    var self = this;

    describe("#isImplementedBy()", function() {
      it("says yes if the argument is a contract function for the contract", function() {
        var subject = oneSubjectGenerator();
        var f = createCandidateContractFunction(false, null, "contract", subject);
        //noinspection BadExpressionStatementJS
        expect(subject.isImplementedBy(f)).to.be.ok;
        self.expectInvariants(subject);
      });
      thingsThatAreNotAFunctionNorAContract
        .concat(["function() {}"])
        .forEach(function(thing) {
          it("says no if the argument is not a contract function but " + thing, function() {
            var subject = oneSubjectGenerator();
            //noinspection BadExpressionStatementJS
            expect(subject.isImplementedBy(thing)).not.to.be.ok;
            self.expectInvariants(subject);
          });
      });
      it("says no if the argument is a contract function for another contract", function() {
        var subject = oneSubjectGenerator();
        var otherContract = oneSubjectGenerator();
        var f = createCandidateContractFunction(false, null, "contract", otherContract);
        //noinspection BadExpressionStatementJS
        expect(subject.isImplementedBy(f)).not.to.be.ok;
        self.expectInvariants(subject);
      });
    });

  }

  return {
    preCases: preCases,
    postCases: postCases,
    exceptionCases: exceptionCases,
    thingsThatAreNotAFunctionNorAContract: thingsThatAreNotAFunctionNorAContract,
    constructorPreCases: constructorPreCases,
    constructorPostCases: constructorPostCases,
    constructorExceptionCases: constructorExceptionCases,
    location: location,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    createCandidateContractFunction: createCandidateContractFunction,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };

})();
