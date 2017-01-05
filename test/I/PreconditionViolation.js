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
  var PreconditionViolation = require("../../src/I/PreconditionViolation");
  var Contract = require("../../src/I/Contract");
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");
  var conditionViolationTest = require("./ConditionViolation");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(PreconditionViolation);
    conditionViolationTest.expectInvariants(subject);
  }

  // describe("I", function() {
    describe("I/PreconditionViolation", function() {

      describe("#PreconditionViolation.createMessage", function() {
        it("has a function createMessage()", function() {
          expect(PreconditionViolation).to.have.property("createMessage").that.is.a("function");
        });
      });

      describe("#PreconditionViolation.createMessage()", function() {
        conditionViolationTest.selfCases.forEach(function(self) {
          conditionViolationTest.argsCases.forEach(function(args) {
            it("works when called with " + self + " - " + args, function() {
              var contractFunction = Contract.dummyImplementation();
              var result = PreconditionViolation.createMessage(contractFunction, conditionViolationTest.conditionCase, self, args);
              expect(result).to.be.a("string");
              expect(result).to.contain(contractFunction.displayName);
              expect(result).to.contain("" + conditionViolationTest.conditionCase);
              expect(result).to.contain("" + self);
              Array.prototype.forEach(function(arg) {
                expect(result).to.contain("" + arg);
              });
            });
          });
        });
      });

      describe("#PreconditionViolation()", function() {
        conditionViolationTest.selfCases.forEach(function(self) {
          conditionViolationTest.argsCases.forEach(function(args) {
            it("creates an instance with all toppings for " + self + " - " + args, function() {
              var contractFunction = Contract.dummyImplementation();
              var result = new PreconditionViolation(contractFunction, conditionViolationTest.conditionCase, self, args);
              conditionViolationTest.expectConstructorPost(result,
                                                           contractFunction,
                                                           conditionViolationTest.conditionCase,
                                                           self,
                                                           args);
              expectInvariants(result);
              expect(result.name).to.equal("Contract Precondition Violation");
              expect(result.message).to.equal(
                PreconditionViolation.createMessage(contractFunction, conditionViolationTest.conditionCase, self, args)
              );
            });
          });
        });
      });

      conditionViolationTest.generatePrototypeMethodsDescriptions(
        function() {
          return new PreconditionViolation(
            Contract.dummyImplementation(),
            conditionViolationTest.conditionCase,
            null,
            conditionViolationTest.argsCases[0]
          );
        },
        testUtil
          .x(conditionViolationTest.selfCases, conditionViolationTest.argsCases)
          .map(function(parameters) {
            return function() {
              return {
                subject: new PreconditionViolation(Contract.dummyImplementation(),
                                                   conditionViolationTest.conditionCase,
                                                   parameters[0],
                                                   parameters[1]),
                description: parameters.join(" - ")
              };
            };
          })
      );

    });
  // });

  var test = {
    expectInvariants: expectInvariants
  };
  Object.setPrototypeOf(test, conditionViolationTest);
  return test;

})();
