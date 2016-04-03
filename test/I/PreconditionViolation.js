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
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");
  var conditionViolationTest = require("./ConditionViolation");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(PreconditionViolation);
    conditionViolationTest.expectInvariants(subject);
  }

  function expectConstructorPost(result, condition, self, args) {
    conditionViolationTest.expectConstructorPost(result, condition, self, args);
  }

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
    conditionViolationTest.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);
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
              var result = PreconditionViolation.createMessage(conditionViolationTest.conditionCase, self, args);
              expect(result).to.be.a("string");
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
              var result = new PreconditionViolation(conditionViolationTest.conditionCase, self, args);
              expectConstructorPost(result, conditionViolationTest.conditionCase, self, args);
              expectInvariants(result);
              expect(result.name).to.equal("Contract Precondition Violation");
              expect(result.message).to.equal(PreconditionViolation.createMessage(conditionViolationTest.conditionCase, self, args));
            });
          });
        });
      });

      generatePrototypeMethodsDescriptions(
        function() {
          return new PreconditionViolation(conditionViolationTest.conditionCase, null, conditionViolationTest.argsCases[0]);
        },
        testUtil
          .x([conditionViolationTest.conditionCase], conditionViolationTest.selfCases, conditionViolationTest.argsCases)
          .map(function(parameters) {
            return function() {
              return {
                subject: new PreconditionViolation(parameters[0], parameters[1], parameters[2]),
                description: parameters.join(" - ")
              };
            };
          })
      );

    });
  // });

  var test = {
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };
  Object.setPrototypeOf(test, conditionViolationTest);
  return test;

})();
