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
                      "𝕋合同/_private/util", "./AbstractContractCommon", "𝕋合同/I/AbstractContract"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, util, common, AbstractContract) {
  "use strict";

  // describe("I", function() {
    describe("I/AbstractContract", function() {

      describe("AbstractContract", function() {
        //noinspection FunctionTooLongJS
        it("has the expected properties", function() {
          expect(AbstractContract).to.haveOwnProperty("displayNamePrefix");
          expect(AbstractContract).to.have.property("displayNamePrefix").that.is.a("string");
          expect(AbstractContract).to.haveOwnProperty("contractFunctionDisplayName");
          expect(AbstractContract).to.have.property("contractFunctionDisplayName").that.is.a("function");
          expect(AbstractContract).to.haveOwnProperty("bindContractFunction");
          expect(AbstractContract).to.have.property("bindContractFunction").that.is.a("function");
          expect(AbstractContract).to.haveOwnProperty("isAContractFunction");
          expect(AbstractContract).to.have.property("isAContractFunction").that.is.a("function");
          expect(AbstractContract).to.haveOwnProperty("bless");
          expect(AbstractContract).to.have.property("bless").that.is.a("function");
          expect(AbstractContract).to.haveOwnProperty("internalLocation");
          expect(AbstractContract).to.have.property("internalLocation").that.is.an("object");
          expect(AbstractContract).to.have.property("internalLocation").that.satisfies(function(internalLocation) {
            return "" + internalLocation === "INTERNAL";
          });
          expect(AbstractContract).to.haveOwnProperty("falseCondition");
          expect(AbstractContract).to.have.property("falseCondition").that.is.a("function");
          expect(AbstractContract).to.haveOwnProperty("root");
          expect(AbstractContract).to.have.property("root").that.is.an.instanceof(AbstractContract);
          var root = AbstractContract.root;
          common.expectInvariants(root);
          expect(root).to.have.property("pre").to.have.lengthOf(1);
          expect(root.pre[0]).to.equal(AbstractContract.falseCondition);
          expect(root).to.have.property("post").to.have.lengthOf(0);
          expect(root).to.have.property("exception").to.have.lengthOf(0);
          expect(root).to.have.property("location").that.equals(AbstractContract.internalLocation);
          expect(AbstractContract).to.haveOwnProperty("AbstractError");
          expect(AbstractContract).to.have.property("AbstractError").that.is.a("function");
          expect(AbstractContract).to.have.property("AbstractError").to.have.property("prototype").that.is.instanceof(Error);
          expect(AbstractContract).to.haveOwnProperty("prototype");
          expect(AbstractContract).to.have.property("prototype").that.is.an("object");
          var prototype = AbstractContract.prototype;
          expect(prototype).to.have.property("_pre").to.be.null;
          expect(prototype).to.have.property("_post").to.be.null;
          expect(prototype).to.have.property("_post").to.be.null;
          expect(prototype).to.have.property("_exception").to.be.null;
          expect(prototype).to.have.property("location").that.equals(AbstractContract.internalLocation);
          expect(prototype).to.have.property("abstract").to.be.null;
          expect(prototype).to.have.property("isImplementedBy").that.is.a("function");
        });
      });

      describe("AbstractContract.contractFunctionDisplayName", function() {
        it("returns the expected display name with a named function", function() {
          function namedFunction() {}

          var result = AbstractContract.contractFunctionDisplayName(namedFunction);
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + "namedFunction");
        });

        it("returns the expected display name with a named function with a display name", function() {
          function namedFunction() {}
          namedFunction.displayName = "display name";

          var result = AbstractContract.contractFunctionDisplayName(namedFunction);
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + "namedFunction");
        });

        it("returns the expected display name with an anonymous function assigned to a variable", function() {
          var anonymousFunction = function() {};

          var result = AbstractContract.contractFunctionDisplayName(anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          // This is, at 2017-03-26, implemented in node, Chrome and Safari on Mac, but not yet in Firefox 52.
          // Firefox 53, based on Gecko 53, will ship in April 2017, and will have this functionality:
          // https://developer.mozilla.org/en-US/Firefox/Releases/53
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + "anonymousFunction");
        });

        it("returns the expected display name with an anonymous function with an implementation property that has a display name", function() {
          var anonymousFunction = (function() {return function() {};})();
          anonymousFunction.implementation = function() {};
          var implementationDisplayName = "implementation display name";
          anonymousFunction.implementation.displayName = implementationDisplayName;

          var result = AbstractContract.contractFunctionDisplayName(anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + implementationDisplayName);
        });

        it("returns the expected display name with an anonymous function with an implementation property that has no display name, but has a name", function() {
          var anonymousFunction = (function() {return function() {};})();
          anonymousFunction.implementation = function implementationWithNoName() {};

          var result = AbstractContract.contractFunctionDisplayName(anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + "implementationWithNoName");
        });


        it("returns the expected display name with a function without a name and without an implementation", function() {
          var anonymousFunction = (function() {return function() {};})();
          testUtil.log(anonymousFunction.name);
          //noinspection BadExpressionStatementJS,JSHint
          expect(anonymousFunction).to.have.property("name").that.is.not.ok;
          expect(anonymousFunction).not.to.have.property("implementation");

          var result = AbstractContract.contractFunctionDisplayName(anonymousFunction);
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + "<<anonymous>>");
        });

        it("returns the expected display name with an anonymous function with an implementation property that has no display name and no name", function() {
          var anonymousFunction = (function() {return function() {};})();
          testUtil.log(anonymousFunction.name);
          //noinspection BadExpressionStatementJS,JSHint
          expect(anonymousFunction).to.have.property("name").that.is.not.ok;
          anonymousFunction.implementation = (function() {return function() {};})();
          //noinspection BadExpressionStatementJS,JSHint
          expect(anonymousFunction).to.have.property("implementation").that.is.ok;
          //noinspection BadExpressionStatementJS,JSHint
          expect(anonymousFunction).to.have.property("implementation").that.has.property("name").that.is.not.ok;
          expect(anonymousFunction).to.have.property("implementation").not.to.have.property("displayName");

          var result = AbstractContract.contractFunctionDisplayName(anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + "<<anonymous>>");
        });

        it("returns the expected display name with an anonymous function assigned to a variable with a display name", function() {
          var f = function() {};
          f.displayName = "display name";

          var result = AbstractContract.contractFunctionDisplayName(f);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          // This is, at 2017-03-26, implemented in node, Chrome and Safari on Mac, but not yet in Firefox 52.
          // Firefox 53, based on Gecko 53, will ship in April 2017, and will have this functionality:
          // https://developer.mozilla.org/en-US/Firefox/Releases/53
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + "f");
        });

        it("returns the expected display name with an anonymous function as a method", function() {
          var obj = {
            anonymousFunction: function() {}
          };

          var result = AbstractContract.contractFunctionDisplayName(obj.anonymousFunction);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          // This is, at 2017-03-26, implemented in node, Chrome and Safari on Mac, but not yet in Firefox 52.
          // Firefox 53, based on Gecko 53, will ship in April 2017, and will have this functionality:
          // https://developer.mozilla.org/en-US/Firefox/Releases/53
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + "anonymousFunction");
        });

        it("returns the expected display name with an named function function as a method", function() {
          var obj = {
            f: function namedFunction() {}
          };

          var result = AbstractContract.contractFunctionDisplayName(obj.f);
          // in ES6, this function has the name of the variable
          // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
          expect(result).to.be.equal(AbstractContract.displayNamePrefix + "namedFunction");
        });

      });

      describe("AbstractContract.bindContractFunction", function() {
        it("behaves as expected", function() {
          var subject = common.createCandidateContractFunction();
          var result = AbstractContract.bindContractFunction.apply(subject);
          expect(result).to.satisfy(AbstractContract.isAGeneralContractFunction);
          expect(result).to.have.property("contract").to.equal(subject.contract);
          expect(result).to.have.property("location").to.equal(subject.location);
          if (AbstractContract.isAContractFunction(subject)) {
            expect(result).to.satisfy(AbstractContract.isAContractFunction);
          }
        });
      });

      function generateIAGCFTests(isAGeneralizedContractFunction) {
        it("says yes if there is an implementation Function, an AbstractContract, and a location, and all 3 " +
           "properties are frozen, and it has the expected display name",
          function() {
            var candidate = common.createCandidateContractFunction();
            //noinspection BadExpressionStatementJS,JSHint
            expect(isAGeneralizedContractFunction(candidate)).to.be.ok;
          }
        );

        common.thingsThatAreNotAFunctionNorAContract.forEach(function(thing) {
          it("says no if the argument is not a function, but " + thing, function() {
            //noinspection BadExpressionStatementJS,JSHint
            expect(isAGeneralizedContractFunction(thing)).not.to.be.ok;
          });
        });

        ["contract", "implementation", "location", "bind"].forEach(function(doNotFreezeProperty) {
          it("says no if the " + doNotFreezeProperty + " property is not frozen", function() {
            var candidate = common.createCandidateContractFunction(doNotFreezeProperty);
            //noinspection BadExpressionStatementJS,JSHint
            expect(isAGeneralizedContractFunction(candidate)).not.to.be.ok;
          });
        });

        [
          {propertyName: "contract", expected: "an AbstractContract", extra: [function() {}]},
          {propertyName: "implementation", expected: "a Function", extra: [new AbstractContract({})]},
          {propertyName: "bind", expected: "AbstractContract.bindContractFunction", extra: []},
          {
            propertyName: "displayName",
            expected:     "the contractFunctionDisplayName",
            extra:        ["candidate", AbstractContract.displayNamePrefix]
          }
        ].forEach(function(aCase) {
          common.thingsThatAreNotAFunctionNorAContract.concat(aCase.extra).forEach(function(v) {
            it("says no if the " + aCase.propertyName + " is not " + aCase.expected + " but " + v, function() {
              var candidate = common.createCandidateContractFunction(null, aCase.propertyName, v);
              //noinspection BadExpressionStatementJS,JSHint
              expect(isAGeneralizedContractFunction(candidate)).not.to.be.ok;
            });
          });
        });
        common.thingsThatAreNotAFunctionNorAContract.filter(function(v) {return !v;}).forEach(function(v) {
          it("says no if the location is not truthy but " + v, function() {
            var candidate = common.createCandidateContractFunction(null, "location", v);
            //noinspection BadExpressionStatementJS,JSHint
            expect(AbstractContract.isAContractFunction(candidate)).not.to.be.ok;
          });
        });
      }

      describe("AbstractContract.isAGeneralizedContractFunction", function() {
        generateIAGCFTests(AbstractContract.isAGeneralContractFunction);
        common.thingsThatAreNotAFunctionNorAContract
          .filter(function(v) {return !!v;})
          .concat(["    at", "at /", {}, AbstractContract.internalLocation])
          .forEach(function(v) {
            it("says yes if there is an implementation Function, an AbstractContract, and a location that is " + v +
               ", and all 3 properties are frozen, and it has the expected display name",
              function() {
                var candidate = common.createCandidateContractFunction(null, "location", v);
                //noinspection BadExpressionStatementJS,JSHint
                expect(AbstractContract.isAGeneralContractFunction(candidate)).to.be.ok;
              }
            );
          });
      });

      describe("AbstractContract.isAContractFunction", function() {
        generateIAGCFTests(AbstractContract.isAContractFunction);
        common.thingsThatAreNotAFunctionNorAContract
          .concat(["    at", "at /", {}, AbstractContract.internalLocation])
          .forEach(function(v) {
            it("says no if the location is not a location outside this library but " + v, function() {
              var candidate = common.createCandidateContractFunction(null, "location", v);
              //noinspection BadExpressionStatementJS,JSHint
              expect(AbstractContract.isAContractFunction(candidate)).not.to.be.ok;
            });
          });
      });

      describe("AbstractContract.bless", function() {
        it("behaves as expected", function() {
          var contractFunction = function() {};
          var contract = new AbstractContract({});
          var implFunction = function() {};
          var location = util.firstLocationOutsideLibrary();
          AbstractContract.bless(contractFunction, contract, implFunction, location);
          expect(contractFunction).to.satisfy(function(cf) {return AbstractContract.isAContractFunction(cf);});
          testUtil.expectOwnFrozenProperty(contractFunction, "contract");
          expect(contractFunction).to.have.property("contract").that.equals(contract);
          testUtil.expectOwnFrozenProperty(contractFunction, "implementation");
          expect(contractFunction).to.have.property("implementation").that.equals(implFunction);
          testUtil.expectOwnFrozenProperty(contractFunction, "location");
          expect(contractFunction).to.have.property("location").that.equals(location);
          testUtil.expectOwnFrozenProperty(contractFunction, "bind");
          expect(contractFunction).to.have.property("bind").that.equals(AbstractContract.bindContractFunction);
          testUtil.expectFrozenDerivedPropertyOnAPrototype(contractFunction, "displayName");
          expect(contractFunction).to.haveOwnProperty("displayName");
          expect(contractFunction).to.have.property("displayName")
            .that.equals(AbstractContract.contractFunctionDisplayName(contractFunction));
        });
      });

      describe("AbstractContract.falseCondition", function() {
        it("always returns false", function() {
          var result = AbstractContract.falseCondition();
          expect(result).to.equal(false);
        });
      });

      describe("#AbstractContract()", function() {
        common.constructorPreCases.forEach(function(pre) {
          common.constructorPostCases.forEach(function(post) {
            common.constructorExceptionCases.forEach(function(exception) {
              describe("works for pre: " + pre + ", post: " + post + ", exception: " + exception, function() {
                var preConditions = pre();
                var postConditions = post();
                var exceptionConditions = exception();
                var result = new AbstractContract({pre: preConditions, post: postConditions, exception: exceptionConditions});
                common.expectConstructorPost(preConditions, postConditions, exceptionConditions, result);
              });
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function() {return new AbstractContract({});},
        testUtil
          .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
          .map(function(parameters) {
            return function() {
              var preConditions = parameters[0]();
              var postConditions = parameters[1]();
              var exceptionConditions = parameters[2]();
              return {
                subject: new AbstractContract({pre: preConditions, post: postConditions, exception: exceptionConditions}),
                description: parameters.join(" - ")
              };
            };
          })
      );

    });
  // });

}));
