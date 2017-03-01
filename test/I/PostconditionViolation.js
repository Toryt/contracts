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
  var common = require("./PostconditionViolationCommon");
  var PostconditionViolation = require("../../src/I/PostconditionViolation");
  var Contract = require("../../src/I/Contract");
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");

  var argsCases = common.argsCases.filter(function(a) {return util.typeOf(a) === "array"});

  // describe("I", function() {
    describe("I/PostconditionViolation", function() {

      describe("#PostconditionViolation()", function() {
        common.selfCases.forEach(function(self) {
          argsCases.forEach(function(args) {
            common.resultCases.forEach(function(result) {
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
          //noinspection MagicNumberJS
          return new PostconditionViolation(
            common.createCandidateContractFunction(),
            common.conditionCase,
            null,
            common.argsCases[0],
            42
          );
        },
        testUtil
          .x(common.conditionCases, common.selfCases, argsCases, common.resultCases)
          .map(function(parameters) {
            return function() {
              return {
                subject: new PostconditionViolation(
                  common.createCandidateContractFunction(),
                  parameters[0],
                  parameters[1],
                  parameters[2],
                  parameters[3]
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
