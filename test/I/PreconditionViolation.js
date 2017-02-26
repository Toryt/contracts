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
  var common = require("./PreconditionViolationCommon");
  var PreconditionViolation = require("../../src/I/PreconditionViolation");
  var Contract = require("../../src/I/Contract");
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");

  // describe("I", function() {
    describe("I/PreconditionViolation", function() {

      describe("#PreconditionViolation.createMessage", function() {
        it("has a function createMessage()", function() {
          expect(PreconditionViolation).to.have.property("createMessage").that.is.a("function");
        });
      });

      describe("#PreconditionViolation.createMessage()", function() {
        common.selfCases.forEach(function(self) {
          common.argsCases.forEach(function(args) {
            it("works when called with " + self + " - " + args, function() {
              var contractFunction = common.createCandidateContractFunction();
              var result = PreconditionViolation.createMessage(contractFunction, common.conditionCase, self, args);
              expect(result).to.be.a("string");
              expect(result).to.contain(contractFunction.displayName);
              expect(result).to.contain(util.conditionRepresentation("condition", common.conditionCase));
            });
          });
        });
      });

      describe("#PreconditionViolation()", function() {
        common.selfCases.forEach(function(self) {
          common.argsCases.forEach(function(args) {
            it("creates an instance with all toppings for " + self + " - " + args, function() {
              var contractFunction = common.createCandidateContractFunction();
              var result = new PreconditionViolation(contractFunction, common.conditionCase, self, args);
              common.expectConstructorPost(result,
                                           contractFunction,
                                           common.conditionCase,
                                           self,
                                           args);
              common.expectInvariants(result);
              expect(result.name).to.equal("Contract Precondition Violation");
              expect(result.message).to.equal(
                PreconditionViolation.createMessage(contractFunction, common.conditionCase, self, args)
              );
              testUtil.log("result.stack:\n%s", result.stack);
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function() {
          return new PreconditionViolation(
            common.createCandidateContractFunction(),
            common.conditionCase,
            null,
            common.argsCases[0]
          );
        },
        testUtil
          .x(common.selfCases, common.argsCases)
          .map(function(parameters) {
            return function() {
              return {
                subject: new PreconditionViolation(common.createCandidateContractFunction(),
                                                   common.conditionCase,
                                                   parameters[0],
                                                   parameters[1]),
                description: parameters.join(" - ")
              };
            };
          })
      );

    });
  // });

})();
