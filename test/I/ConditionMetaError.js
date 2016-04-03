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
  var ConditionMetaError = require("../../src/I/ConditionMetaError");
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");
  var conditionErrorTest = require("./ConditionError");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ConditionMetaError);
    if (subject.error) {
      //noinspection JSUnresolvedVariable,BadExpressionStatementJS
      expect(subject.error).to.be.frozen;
    }
    conditionErrorTest.expectInvariants(subject);
  }

  function expectConstructorPost(result, condition, self, args, error) {
    conditionErrorTest.expectConstructorPost(result, condition, self, args);
    expect(result.error).to.equal(error);
  }

  var errorCases = [
    new Error(),
    undefined,
    null,
    1,
    0,
    "a string that is used as an error",
    "",
    true,
    false,
    new Date(),
    /foo/,
    function() {}
  ];

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
    conditionErrorTest.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);
  }

  // describe("I", function() {
    describe("I/ConditionMetaError", function() {

      describe("#ConditionMetaError.createMessage", function() {
        it("has a function createMessage()", function() {
          expect(ConditionMetaError).to.have.property("createMessage").that.is.a("function");
        });
      });

      describe("#ConditionMetaError.createMessage()", function() {
        conditionErrorTest.selfCases.forEach(function(self) {
          conditionErrorTest.argsCases.forEach(function(args) {
            errorCases.forEach(function(error) {
              it("works when called with " + self + " - " + args, function() {
                var result = ConditionMetaError.createMessage(conditionErrorTest.conditionCase, self, args, error);
                expect(result).to.be.a("string");
                expect(result).to.contain("" + conditionErrorTest.conditionCase);
                expect(result).to.contain("" + self);
                Array.prototype.forEach(function(arg) {
                  expect(result).to.contain("" + arg);
                });
                expect(result).to.contain("" + error);
              });
            });
          });
        });
      });

      describe("#ConditionMetaError()", function() {
        conditionErrorTest.selfCases.forEach(function(self) {
          conditionErrorTest.argsCases.forEach(function(args) {
            errorCases.forEach(function(error) {
              it("creates an instance with all toppings for " + self + " - " + args + " - " + error, function() {
                var result = new ConditionMetaError(conditionErrorTest.conditionCase, self, args, error);
                expectConstructorPost(result, conditionErrorTest.conditionCase, self, args, error);
                expectInvariants(result);
                expect(result.name).to.equal("Contract Condition Meta-Error");
                expect(result.message).to.equal(ConditionMetaError.createMessage(
                  conditionErrorTest.conditionCase,
                  self,
                  args,
                  error
                ));
              });
            });
          });
        });
      });

      generatePrototypeMethodsDescriptions(
        function() {
          return new ConditionMetaError(
            conditionErrorTest.conditionCase,
            null,
            conditionErrorTest.argsCases[0],
            errorCases[0]
          );
        },
        testUtil
          .x([conditionErrorTest.conditionCase], conditionErrorTest.selfCases, conditionErrorTest.argsCases, errorCases)
          .map(function(parameters) {
            return function() {return {
              subject: new ConditionMetaError(parameters[0], parameters[1], parameters[2], parameters[3]),
              description: parameters.join(" - ")
            };};
          })
      );

    });
  // });

  var test = {
    errorCases: errorCases,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };
  Object.setPrototypeOf(test, conditionErrorTest);
  return test;

})();
