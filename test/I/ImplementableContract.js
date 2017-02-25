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
  var common = require("./ImplementableContractCommon");
  var testUtil = require("../_testUtil");
  var ImplementableContract = require("../../src/I/ImplementableContract");

  // describe("I", function() {
    describe("I/ImplementableContract", function() {

      var subjects = testUtil
        .x(common.preCases, common.postCases, common.exceptionCases)
        .map(function(args) {
          return function() {return new ImplementableContract(args[0](), args[1](), args[2]());};
        });

      describe("#ImplementableContract()", function() {
        common.constructorPreCases.forEach(function(pre) {
          common.constructorPostCases.forEach(function(post) {
            common.constructorExceptionCases.forEach(function(exception) {
              describe("works for pre: " + pre + ", post: " + post + ", exception: " + exception, function() {
                var preConditions = pre();
                var postConditions = post();
                var exceptionConditions = exception();
                var result = new ImplementableContract(preConditions, postConditions, exceptionConditions);
                common.expectConstructorPost(preConditions, postConditions, exceptionConditions, result);
              });
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function() {return new ImplementableContract();},
        testUtil
          .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
          .map(function(parameters) {
            return function() {
              var preConditions = parameters[0]();
              var postConditions = parameters[1]();
              var exceptionConditions = parameters[2]();
              return {
                subject: new ImplementableContract(preConditions, postConditions, exceptionConditions),
                description: parameters.join(" - ")
              };
            };
          }),
        common.expectInvariants
      );

    });
  // });

})();
