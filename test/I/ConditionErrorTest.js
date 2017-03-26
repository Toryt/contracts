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
                      "𝕋合同/_private/util", "./ConditionErrorCommon", "𝕋合同/I/ConditionError"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, util, common, ConditionError) {
  "use strict";

  // describe("I", function() {
    describe("I/ConditionError", function() {

      describe("#ConditionError()", function() {
        common.selfCaseGenerators.forEach(function(selfCaseGenerator) {
          common.argsCases.forEach(function(args) {
            var self = selfCaseGenerator();
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
          .x(common.conditionCases, common.selfCaseGenerators, common.argsCases)
          .map(function(parameters) {
            return function() {
              var self = parameters[1]();
              return {
                subject: new ConditionError(
                  common.createCandidateContractFunction(),
                  parameters[0],
                  self,
                  parameters[2]
                ),
                description: parameters[0] + " — " + self + " – " + parameters[2]
              };
            };
          })
      );

    });
  // });

}));
