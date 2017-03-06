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

  var dependencies = ["chai", "../_testUtil", "../../src/_private/util",
                      "./ConditionViolationCommon", "../../src/I/ConditionMetaError", "../../src/I/ConditionViolation"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(chai, testUtil, util, common, ConditionMetaError, ConditionViolation) {
  "use strict";

  var expect = chai.expect;

  // describe("I", function() {
    describe("I/ConditionViolation", function() {

      describe("#ConditionViolation()", function() {
        common.selfCases.forEach(function(self) {
          common.argsCases.forEach(function(args) {
            it("creates an instance with all toppings for " + self + " - " + args, function() {
              var contractFunction = common.createCandidateContractFunction();
              var result = new ConditionViolation(contractFunction, common.conditionCase, self, args);
              common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args);
              common.expectInvariants(result);
              testUtil.log("result.stack: %s", result.stack);
              expect(result).not.to.haveOwnProperty("message");
              expect(result).not.to.haveOwnProperty("stack");
              testUtil.log("result.stack:\n%s", result.stack);
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function() {
          return new ConditionViolation(common.createCandidateContractFunction(),
                                        common.conditionCase,
                                        null,
                                        common.argsCases[0]);
        },
        testUtil
          .x(common.conditionCases, common.selfCases, common.argsCases)
          .map(function(parameters) {
            return function() {
              return {
                subject: new ConditionViolation(
                  common.createCandidateContractFunction(),
                  parameters[0],
                  parameters[1],
                  parameters[2]
                ),
                description: parameters.join(" - ")
              };
            };
          }),
        common.expectInvariants
      );

    });
  // });

}));
