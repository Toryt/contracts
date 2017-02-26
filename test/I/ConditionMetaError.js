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
  var common = require("./ConditionMetaErrorCommon");
  var ConditionMetaError = require("../../src/I/ConditionMetaError");
  var Contract = require("../../src/I/Contract");
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");

  // describe("I", function() {
    describe("I/ConditionMetaError", function() {

      describe("#ConditionMetaError.createMessage", function() {
        it("has a function createMessage()", function() {
          expect(ConditionMetaError).to.have.property("createMessage").that.is.a("function");
        });
      });

      describe("#ConditionMetaError.createMessage()", function() {
        common.selfCases.forEach(function(self) {
          common.argsCases.forEach(function(args) {
            common.errorCases.forEach(function(error) {
              it("works when called with " + self + " - " + args, function() {
                var contractFunction = common.createCandidateContractFunction();
                var result = ConditionMetaError.createMessage(contractFunction, common.conditionCase, self, args, error);
                expect(result).to.be.a("string");
                expect(result).to.contain(contractFunction.displayName);
                expect(result).to.contain(util.conciseConditionRepresentation("condition", common.conditionCase));
                expect(result).to.contain("" + error);
              });
            });
          });
        });
      });

      describe("#ConditionMetaError()", function() {
        common.selfCases.forEach(function(self) {
          common.argsCases.forEach(function(args) {
            common.errorCases.forEach(function(error) {
              it("creates an instance with all toppings for " + self + " - " + args + " - " + error, function() {
                var contractFunction = common.createCandidateContractFunction();
                var result = new ConditionMetaError(contractFunction, common.conditionCase, self, args, error);
                common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args, error);
                common.expectInvariants(result);
                expect(result.name).to.equal("Contract Condition Meta-Error");
                expect(result.message).to.equal(ConditionMetaError.createMessage(
                  contractFunction,
                  common.conditionCase,
                  self,
                  args,
                  error
                ));
                testUtil.log("result.stack:\n%s", result.stack);
              });
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function() {
          return new ConditionMetaError(
            common.conditionCase,
            null,
            common.argsCases[0],
            common.errorCases[0]
          );
        },
        testUtil
          .x(common.selfCases, common.argsCases, common.errorCases)
          .map(function(parameters) {
            return function() {
              return {
                subject: new ConditionMetaError(common.createCandidateContractFunction(),
                                                common.conditionCase,
                                                parameters[0],
                                                parameters[1],
                                                parameters[2]),
                description: parameters.join(" - ")
              };
            };
          })
      );

    });
  // });

})();
