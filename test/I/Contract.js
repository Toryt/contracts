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
  var common = require("./ContractCommon");
  var testUtil = require("../_testUtil");
  var Contract = require("../../src/I/Contract");
  var AbstractContract = require("../../src/I/AbstractContract");

  // describe("I", function() {
    describe("I/Contract", function() {

      describe("Contract", function() {
        it("has the expected properties", function() {
          expect(Contract).to.haveOwnProperty("root");
          expect(Contract).to.have.property("root").that.equals(AbstractContract.root);
        });
      });

      var subjects = testUtil
        .x(common.preCases, common.postCases, common.exceptionCases)
        .map(function(args) {
          return function() {return new Contract(args[0](), args[1](), args[2]());};
        });

      describe("#Contract()", function() {
        common.constructorPreCases.forEach(function(pre) {
          common.constructorPostCases.forEach(function(post) {
            common.constructorExceptionCases.forEach(function(exception) {
              describe("works for pre: " + pre + ", post: " + post + ", exception: " + exception, function() {
                var preConditions = pre();
                var postConditions = post();
                var exceptionConditions = exception();
                var result = new Contract({
                  pre: preConditions,
                  post: postConditions,
                  exception: exceptionConditions
                });
                common.expectConstructorPost(preConditions, postConditions, exceptionConditions, result);
              });
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function() {return new Contract({});},
        testUtil
          .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
          .map(function(parameters) {
            return function() {
              var preConditions = parameters[0]();
              var postConditions = parameters[1]();
              var exceptionConditions = parameters[2]();
              return {
                subject: new Contract({
                  pre: preConditions,
                  post: postConditions,
                  exception: exceptionConditions
                }),
                description: parameters.join(" - ")
              };
            };
          }),
        common.expectInvariants
      );

    });
  // });

})();
