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
  var ConditionError = require("../../src/ConditionError");

  describe("ConditionError", function() {

    var conditionCases = [
      null,
      undefined,
      function() {return "This simulates a condition";}
    ];

    var selfCases = [
      undefined,
      null,
      4,
      -1,
      "",
      "A string",
      new Date(),
      true,
      false,
      {},
      /foo/,
      function() {return "This simulates a self";}
    ];

    var argsCases = [
      undefined,
      null,
      [],
      ["one argument"],
      selfCases
    ];

    describe("#ConditionError.report()", function() {
      conditionCases.forEach(function(condition) {
        selfCases.forEach(function(self) {
          argsCases.forEach(function(args) {
            it("produces a string with all toppings for " + condition + " - " + self + " - " + args, function() {
              var result = ConditionError.report(condition, self, args);
              console.log(result + "\n");
              expect(result).to.be.a("string");
              expect(result).to.contain("" + condition);
              if (args) {
                args.forEach(function(arg) {
                  expect(result).to.contain("" + arg);
                });
              }
              expect(result).to.contain("" + self);
            });
          });
        });
      });
    });

    describe("#ConditionError()", function() {
    });

  });
})();
