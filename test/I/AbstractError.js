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
  var common = require("./AbstractErrorCommon");
  var AbstractContract = require("../../src/I/AbstractContract");
  var AbstractError = AbstractContract.AbstractError;
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");

  // describe("I", function() {
    describe("I/AbstractError", function() {

      describe("#AbstractError()", function() {
        it("creates an instance with all toppings for AbstractContract.root", function() {
          var result = new AbstractError(AbstractContract.root);
          common.expectConstructorPost(result, AbstractError.message, AbstractContract.root);
          common.expectInvariants(result);
          testUtil.log("result.stack:\n%s", result.stack);
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function () {
          return new AbstractError(AbstractContract.root);
        },
        [{
          subject: new AbstractError(AbstractContract.root),
          description: "AbstractContract.root"
        }]
      );

    });
  // });

})();
