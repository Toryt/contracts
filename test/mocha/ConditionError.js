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

    var conditionCase = function() {return "This simulates a condition";};

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

    function args() {return arguments;}

    var argsCases = [
      args([]),
      args(["one argument"]),
      args.call(null, selfCases)
    ];

    describe("#ConditionError.report()", function() {
      selfCases.forEach(function(self) {
        argsCases.forEach(function(args) {
          it("produces a string with all toppings for " + self + " - " + args, function() {
            var result = ConditionError.report(conditionCase, self, args);
            console.log(result + "\n");
            expect(result).to.be.a("string");
            expect(result).to.contain("" + conditionCase);
            if (args) {
              Array.prototype.forEach.call(args, function(arg) {
                expect(result).to.contain("" + arg);
              });
            }
            expect(result).to.contain("" + self);
          });
        });
      });
    });

    describe("#ConditionError()", function() {
      selfCases.forEach(function(self) {
        argsCases.forEach(function(args) {
          it("creates an instance with all toppings for " + self + " - " + args, function() {
            var conditionError = new ConditionError(conditionCase, self, args);
            expect(conditionError).to.be.an.instanceOf(ConditionError);
            expect(conditionError).to.have.property("condition").that.is.a("function");
            expect(conditionError.condition).equal(conditionCase);
            expect(conditionError).to.have.property("self");
            expect(conditionError.self).equal(self);
            expect(conditionError).to.have.property("args").that.is.an("arguments");
            expect(conditionError.args).equal(args);
          });
        });
      });
    });

    describe("#report()", function() {
      selfCases.forEach(function(self) {
        argsCases.forEach(function(args) {
          it("produces a string with all toppings from an instance with " + self + " - " + args, function() {
            var conditionError = new ConditionError(conditionCase, self, args);
            var result = conditionError.report();
            console.log(result + "\n");
            expect(result).to.be.a("string");
            expect(result).to.contain("" + conditionCase);
            if (args) {
              Array.prototype.forEach.call(args, function(arg) {
                expect(result).to.contain("" + arg);
              });
            }
            expect(result).to.contain("" + self);
          });
        });
      });
    });

  });
})();
