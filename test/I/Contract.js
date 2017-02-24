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

(function() {
  "use strict";

  var expect = require("chai").expect;
  var common = require("./ContractCommon");
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");
  var Contract = require("../../src/I/Contract");

  // describe("I", function() {
    describe("I/Contract", function() {

      describe("Contract", function() {
        it("has the expected properties", function() {
          expect(Contract).to.haveOwnProperty("displayNamePrefix");
          expect(Contract).to.have.property("displayNamePrefix").that.is.a("string");
          expect(Contract).to.haveOwnProperty("contractFunctionDisplayName");
          expect(Contract).to.have.property("contractFunctionDisplayName").that.is.a("function");
          expect(Contract).to.haveOwnProperty("bindContractFunction");
          expect(Contract).to.have.property("bindContractFunction").that.is.a("function");
          expect(Contract).to.haveOwnProperty("isAContractFunction");
          expect(Contract).to.have.property("isAContractFunction").that.is.a("function");
          expect(Contract).to.haveOwnProperty("bless");
          expect(Contract).to.have.property("bless").that.is.a("function");
          expect(Contract).to.haveOwnProperty("dummyImplementation");
          expect(Contract).to.have.property("dummyImplementation").that.is.a("function");
        });
      });

      describe("Contract.contractFunctionDisplayName", function() {
        it("returns the expected display name with a named function", function() {
          function namedFunction() {}

          var result = Contract.contractFunctionDisplayName(namedFunction);
          expect(result).to.be.equal(Contract.displayNamePrefix + "namedFunction");
        });

        it("returns the expected display name with a named function with a display name", function() {
          function namedFunction() {}
          var displayName = "display name";
          namedFunction.displayName = displayName;

          var result = Contract.contractFunctionDisplayName(namedFunction);
          expect(result).to.be.equal(Contract.displayNamePrefix + "namedFunction");
        });

        it("returns the expected display name with an anonymous function assigned to a variable", function() {
          var anonymousFunction = function() {};

          var result = Contract.contractFunctionDisplayName(anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          // MUDO this does not work in older node expect(result).to.be.equal(Contract.displayNamePrefix + "anonymousFunction");
        });

        it("returns the expected display name with an anonymous function with an implementation property that has a display name", function() {
          var anonymousFunction = (function() {return function() {};})();
          anonymousFunction.implementation = function() {};
          var implementationDisplayName = "implemenation display name";
          anonymousFunction.implementation.displayName = implementationDisplayName;

          var result = Contract.contractFunctionDisplayName(anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(Contract.displayNamePrefix + implementationDisplayName);
        });

        it("returns the expected display name with an anonymous function with an implementation property that has no display name, but has a name", function() {
          var anonymousFunction = (function() {return function() {};})();
          anonymousFunction.implementation = function implementationWithNoName() {};

          var result = Contract.contractFunctionDisplayName(anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(Contract.displayNamePrefix + "implementationWithNoName");
        });


        it("returns the expected display name with a function without a name and without an implementation", function() {
          var anonymousFunction = (function() {return function() {};})();
          testUtil.log(anonymousFunction.name);
          //noinspection BadExpressionStatementJS
          expect(anonymousFunction).to.have.property("name").that.is.not.ok;
          expect(anonymousFunction).not.to.have.property("implementation");

          var result = Contract.contractFunctionDisplayName(anonymousFunction);
          expect(result).to.be.equal(Contract.displayNamePrefix + "<<anonymous>>");
        });

        it("returns the expected display name with an anonymous function with an implementation property that has no display name and no name", function() {
          var anonymousFunction = (function() {return function() {};})();
          testUtil.log(anonymousFunction.name);
          //noinspection BadExpressionStatementJS
          expect(anonymousFunction).to.have.property("name").that.is.not.ok;
          anonymousFunction.implementation = (function() {return function() {};})();
          //noinspection BadExpressionStatementJS
          expect(anonymousFunction).to.have.property("implementation").that.is.ok;
          //noinspection BadExpressionStatementJS
          expect(anonymousFunction).to.have.property("implementation").that.has.property("name").that.is.not.ok;
          expect(anonymousFunction).to.have.property("implementation").not.to.have.property("displayName");

          var result = Contract.contractFunctionDisplayName(anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(Contract.displayNamePrefix + "<<anonymous>>");
        });

        it("returns the expected display name with an anonymous function assigned to a variable with a display name", function() {
          var f = function() {};
          var displayName = "display name";
          f.displayName = displayName;

          var result = Contract.contractFunctionDisplayName(f);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          // MUDO this does not work in older node expect(result).to.be.equal(Contract.displayNamePrefix + "f");
        });

        it("returns the expected display name with an anonymous function as a method", function() {
          var obj = {
            anonymousFunction: function() {}
          };

          var result = Contract.contractFunctionDisplayName(obj.anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          // MUDO this does not work in older node expect(result).to.be.equal(Contract.displayNamePrefix + "anonymousFunction");
        });

        it("returns the expected display name with an named function function as a method", function() {
          var obj = {
            f: function namedFunction() {}
          };

          var result = Contract.contractFunctionDisplayName(obj.f);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(Contract.displayNamePrefix + "namedFunction");
        });

      });

      describe("Contract.bindContractFunction", function() {
        it("behaves as expected", function() {
          var subject = common.createCandidateContractFunction();
          var result = Contract.bindContractFunction.apply(subject);
          expect(result).to.satisfy(function(r) {return Contract.isAContractFunction(r);});
        });
      });

      describe("Contract.isAContractFunction", function() {

        it("says yes if there is an implementation Function, a Contract, and a location, and all 3 properties are " +
           "frozen, and the contract is frozen, and it has the expected display name", function() {
          var candidate = common.createCandidateContractFunction();
          //noinspection BadExpressionStatementJS
          expect(Contract.isAContractFunction(candidate)).to.be.ok;
        });

        common.thingsThatAreNotAFunctionNorAContract.forEach(function(thing) {
          it("says no if the argument is not a function, but " + thing, function() {
              //noinspection BadExpressionStatementJS
            expect(Contract.isAContractFunction(thing)).not.to.be.ok;
          });
        });

        it("says no if the contract is not frozen", function() {
          var candidate = common.createCandidateContractFunction(true);
          //noinspection BadExpressionStatementJS
          expect(Contract.isAContractFunction(candidate)).not.to.be.ok;
        });

        ["contract", "implementation", "location", "bind"].forEach(function(dontFreezeProperty) {
          it("says no if the " + dontFreezeProperty + " property is not frozen", function() {
            var candidate = common.createCandidateContractFunction(false, dontFreezeProperty);
            //noinspection BadExpressionStatementJS
            expect(Contract.isAContractFunction(candidate)).not.to.be.ok;
          });
        });

        [
          {propertyName: "contract", expected: "a Contract", extra: [function() {}]},
          {propertyName: "implementation", expected: "a Function", extra: [new Contract()]},
          {propertyName: "location", expected: "a location outside this library", extra: ["    at", "at /"]},
          {propertyName: "bind", expected: "Contract.bindContractFunction", extra: []},
          {
            propertyName: "displayName",
            expected: "the contractFunctionDisplayName",
            extra: ["candidate", Contract.displayNamePrefix]
          }
        ].forEach(function(aCase) {
          common.thingsThatAreNotAFunctionNorAContract.concat(aCase.extra).forEach(function(v) {
            it("says no if the " + aCase.propertyName + " is not " + aCase.expected + " but " + v, function() {
              var candidate = common.createCandidateContractFunction(false, null, aCase.propertyName, v);
              //noinspection BadExpressionStatementJS
              expect(Contract.isAContractFunction(candidate)).not.to.be.ok;
            });
          });
        });

      });

      describe("Contract.bless", function() {
        it("behaves as expected", function() {
          var contractFunction = function() {};
          var contract = new Contract();
          Object.freeze(contract);
          var implFunction = function() {};
          var location = util.firstLocationOutsideLibrary();
          Contract.bless(contractFunction, contract, implFunction, location);
          expect(contractFunction).to.satisfy(function(cf) {return Contract.isAContractFunction(cf);});
          testUtil.expectOwnFrozenProperty(contractFunction, "contract");
          expect(contractFunction).to.have.property("contract").that.equals(contract);
          testUtil.expectOwnFrozenProperty(contractFunction, "implementation");
          expect(contractFunction).to.have.property("implementation").that.equals(implFunction);
          testUtil.expectOwnFrozenProperty(contractFunction, "location");
          expect(contractFunction).to.have.property("location").that.equals(location);
          testUtil.expectOwnFrozenProperty(contractFunction, "bind");
          expect(contractFunction).to.have.property("bind").that.equals(Contract.bindContractFunction);
          testUtil.expectFrozenDerivedPropertyOnAPrototype(contractFunction, "displayName");
          expect(contractFunction).to.haveOwnProperty("displayName");
          expect(contractFunction).to.have.property("displayName")
            .that.equals(Contract.contractFunctionDisplayName(contractFunction));
        });
      });

      describe("Contract.dummyImplementation", function() {
        it("returns a function that is a contract function", function() {
          var result = Contract.dummyImplementation();
          expect(result).to.satisfy(function(cf) {return Contract.isAContractFunction(cf);});
        });
      });

      describe("#Contract()", function() {
        common.constructorPreCases.forEach(function(pre) {
          common.constructorPostCases.forEach(function(post) {
            common.constructorExceptionCases.forEach(function(exception) {
              describe("works for pre: " + pre + ", post: " + post + ", exception: " + exception, function() {
                var preConditions = pre();
                var postConditions = post();
                var exceptionConditions = exception();
                var result = new Contract(preConditions, postConditions, exceptionConditions);
                common.expectConstructorPost(preConditions, postConditions, exceptionConditions, result);
              });
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function() {return new Contract();},
        testUtil
          .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
          .map(function(parameters) {
            return function() {
              var preConditions = parameters[0]();
              var postConditions = parameters[1]();
              var exceptionConditions = parameters[2]();
              return {
                subject: new Contract(preConditions, postConditions, exceptionConditions),
                description: parameters.join(" - ")
              };
            };
          }),
        common.expectInvariants
      );

    });
  // });

})();
