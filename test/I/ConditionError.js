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
  var common = require("./ConditionErrorCommon");
  var ConditionError = require("../../src/I/ConditionError");
  var util = require("../../src/_private/util");
  var Contract = require("../../src/I/Contract");
  var testUtil = require("../_testUtil");

  // describe("I", function() {
    describe("I/ConditionError", function() {

      describe("#ConditionError.createMessage", function() {
        it("has a function createMessage()", function() {
          expect(ConditionError).to.have.property("createMessage").that.is.a("function");
        });
      });

      describe("#ConditionError.createMessage()", function() {
        common.selfCases.forEach(function(self) {
          common.argsCases.forEach(function(args) {
            it("works when called with " + self + " - " + args, function() {
              var contractFunction = Contract.dummyImplementation();
              var result = ConditionError.createMessage(contractFunction, common.conditionCase, self, args);
              expect(result).to.be.a("string");
              expect(result).to.contain(contractFunction.displayName);
              var conditionRepr = common.conditionCase.displayName || ("condition " + (common.conditionCase.name ||
                                                                                       common.conditionCase))
              expect(result).to.contain("" + conditionRepr);
              expect(result).to.contain("" + self);
              Array.prototype.forEach(function(arg) {
                expect(result).to.contain("" + arg);
              });
            });
          });
        });
      });

      describe("#ConditionError()", function() {
        common.selfCases.forEach(function(self) {
          common.argsCases.forEach(function(args) {
            it("creates an instance with all toppings for " + self + " - " + args, function() {
              var contractFunction = Contract.dummyImplementation();
              var result = new ConditionError(contractFunction, common.conditionCase, self, args);
              common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args);
              common.expectInvariants(result);
              expect(result.name).to.equal("Contract Condition Error");
              expect(result.message).to.equal(ConditionError.createMessage(contractFunction, common.conditionCase, self, args));
              testUtil.log("result.stack: %s", result.stack);
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
                subject: new ConditionError(Contract.dummyImplementation(), common.conditionCase, parameters[0], parameters[1]),
                description: parameters.join(" - ")
              };
            };
          })
      );

    });
  // });

})();
