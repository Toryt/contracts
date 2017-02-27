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

(function() {
  "use strict";

  var expect = require("chai").expect;
  var common = require("./ConditionErrorCommon");
  var ConditionError = require("../../src/I/ConditionError");
  var util = require("../../src/_private/util");
  var Contract = require("../../src/I/Contract");
  var testUtil = require("../_testUtil");

  // describe("I", function() {
    describe("I/ConditionError", function() {

      describe("#ConditionError()", function() {
        common.selfCases.forEach(function(self) {
          common.argsCases.forEach(function(args) {
            it("creates an instance with all toppings for " + self + " - " + args, function() {
              var contractFunction = common.createCandidateContractFunction();
              var result = new ConditionError(contractFunction, common.conditionCase, self, args);
              common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args);
              common.expectInvariants(result);
              expect(result).not.to.haveOwnProperty("message");
              expect(result).not.to.haveOwnProperty("stack");
              testUtil.log("result.stack:\n%s", result.stack);
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function () {
          return new ConditionError(common.conditionCase, null, argsCases[0]);
        },
        testUtil
          .x(common.selfCases, common.argsCases)
          .map(function(parameters) {
            return function() {
              return {
                subject: new ConditionError(
                  common.createCandidateContractFunction(),
                  common.conditionCase, // MUDO vary, with cases from concise…
                  parameters[0],
                  parameters[1]
                ),
                description: parameters.join(" - ")
              };
            };
          }),
        common.expectInvariants
      );

    });
  // });

})();
