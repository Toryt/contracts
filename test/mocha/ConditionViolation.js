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
  var ConditionViolation = require("../../src/ConditionViolation");
  var util = require("../../src/util");
  var testUtil = require("./testUtil");
  var conditionErrorTest = require("./ConditionError");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ConditionViolation);
    conditionErrorTest.expectInvariants(subject);
  }

  function expectConstructorPost(result, condition, self, args) {
    conditionErrorTest.expectConstructorPost(result, condition, self, args);
  }

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectsGenerator) {
    conditionErrorTest.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectsGenerator);
  }

  describe("ConditionViolation", function() {

    describe("#ConditionViolation()", function() {
      conditionErrorTest.selfCases.forEach(function(self) {
        conditionErrorTest.argsCases.forEach(function(args) {
          it("creates an instance with all toppings for " + self + " - " + args, function() {
            var result = new ConditionViolation(conditionErrorTest.conditionCase, self, args);
            expectConstructorPost(result, conditionErrorTest.conditionCase, self, args);
            expectInvariants(result);
          });
        });
      });
    });

    generatePrototypeMethodsDescriptions(
      function() {
        return new ConditionViolation(conditionErrorTest.conditionCase, null, conditionErrorTest.argsCases[0]);
      }
    );

  });

  var test = {
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };
  Object.setPrototypeOf(test, conditionErrorTest);
  return test;

})();
