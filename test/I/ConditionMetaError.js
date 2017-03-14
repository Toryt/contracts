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
                      "./ConditionMetaErrorCommon", "../../src/I/ConditionMetaError"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(chai, testUtil, util, common, ConditionMetaError) {
  "use strict";

  var expect = chai.expect;

  // describe("I", function() {
    describe("I/ConditionMetaError", function() {

      describe("#ConditionMetaError()", function() {
        common.selfCaseGenerators.forEach(function(selfCaseGenerator) {
          common.argsCases.forEach(function(args) {
            common.errorCases.forEach(function(error) {
              var self = selfCaseGenerator();
              it("creates an instance with all toppings for " + self + " - " + args + " - " + error, function() {
                var contractFunction = common.createCandidateContractFunction();
                var result = new ConditionMetaError(contractFunction, common.conditionCase, self, args, error);
                common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args, error);
                common.expectInvariants(result);
                expect(result).not.to.haveOwnProperty("message");
                expect(result).not.to.haveOwnProperty("stack");
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
          .x(common.conditionCases, common.selfCaseGenerators, common.argsCases, common.errorCases)
          .map(function(parameters) {
            return function() {
              var self = parameters[1]();
              return {
                subject: new ConditionMetaError(
                  common.createCandidateContractFunction(),
                  parameters[0],
                  self,
                  parameters[2],
                  parameters[3]
                ),
                description: parameters[0] + " — " + self + " – " + parameters[2] + " – " + parameters[3]
              };
            };
          })
      );

    });
  // });

}));
