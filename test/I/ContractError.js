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
  var common = require("./ContractErrorCommon");
  var ContractError = require("../../src/I/ContractError");
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");

  // describe("I", function() {
    describe("I/ContractError", function() {

      describe("#ContractError()", function() {
        it("creates an instance with all toppings", function() {
          var result = new ContractError();
          common.expectConstructorPost(result, ContractError.message);
          common.expectInvariants(result);
          expect(result).not.to.haveOwnProperty("message");
          testUtil.log("result.stack:\n%s", result.stack);
        });
        it("can get a message set", function() {
          var result = new ContractError();
          var message = "another message";
          util.defineFrozenDerivedProperty(result, "message", function() {return message;});
          expect(result).to.haveOwnProperty("message");
          expect(result).to.have.property("message").that.equals(message);
          common.expectInvariants(result);
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function () {
          return new ContractError();
        },
        [{
          subject: new ContractError(),
          description: "a contract error"
        }]
      );

    });
  // });

})();
