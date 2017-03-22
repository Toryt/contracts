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

  var dependencies = ["chai", "../_testUtil", "𝕋合同/_private/util",
                      "./PostconditionViolationCommon", "𝕋合同/I/PostconditionViolation"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(chai, testUtil, util, common, PostconditionViolation) {
  "use strict";

  var expect = chai.expect;

  var argsCases = common.argsCases.filter(function(a) {return util.typeOf(a) === "array"});

  // describe("I", function() {
    describe("I/PostconditionViolation", function() {

      describe("#PostconditionViolation()", function() {
        common.selfCaseGenerators.forEach(function(selfCaseGenerator) {
          argsCases.forEach(function(args) {
            common.resultCaseGenerators.forEach(function(resultCaseGenerator) {
              var self = selfCaseGenerator();
              var result = resultCaseGenerator();
              it("creates an instance with all toppings for " + self + " - " + args + " - " + result, function() {
                var contractFunction = common.createCandidateContractFunction();
                var doctoredArgs = args.slice();
                doctoredArgs.push(result);
                doctoredArgs.push(contractFunction.bind(self));
                var creationResult = new PostconditionViolation(
                  contractFunction,
                  common.conditionCase,
                  self,
                  doctoredArgs
                );
                common.expectConstructorPost(
                  creationResult,
                  contractFunction,
                  common.conditionCase,
                  self,
                  args,
                  result
                );
                common.expectInvariants(creationResult);
                testUtil.log("result.stack:\n%s", creationResult.stack);
              });
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function() {
          var contractFunction = common.createCandidateContractFunction();
          var self = null;
          var doctoredArgs = common.doctorArgs(common.argsCases[0], contractFunction.bind(self));
          return new PostconditionViolation(contractFunction, common.conditionCase, self, doctoredArgs);
        },
        testUtil
          .x(common.conditionCases, common.selfCaseGenerators, argsCases, common.resultCaseGenerators)
          .map(function(parameters) {
            return function() {
              var contractFunction = common.createCandidateContractFunction();
              var self = parameters[1]();
              var doctoredArgs = common.doctorArgs(parameters[2], contractFunction.bind(self), parameters[3]());
              return {
                subject: new PostconditionViolation(contractFunction, parameters[0], self, doctoredArgs),
                description: parameters[0] + " — " + self + " – " + parameters[2] + " – " + parameters[3]
              };
            };
          })
      );

    });
  // });

}));
