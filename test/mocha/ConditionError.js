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

module.exports = (function() {
  "use strict";

  var expect = require("chai").expect;
  var ConditionError = require("../../src/ConditionError");

  function expectFrozenProperty(subject, propertyName) {
    //noinspection JSUnresolvedFunction
    expect(subject).to.have.ownPropertyDescriptor(propertyName);
    //noinspection JSUnresolvedFunction
    expect(subject).ownPropertyDescriptor(propertyName).to.have.property('enumerable', true);
    //noinspection JSUnresolvedFunction
    expect(subject).ownPropertyDescriptor(propertyName).to.have.property('configurable', false);
    //noinspection JSUnresolvedFunction
    expect(subject).ownPropertyDescriptor(propertyName).to.have.property('writable', false);
  }

  function expectInvariants(conditionError) {
    expect(conditionError).to.be.an.instanceOf(ConditionError);
    expect(conditionError).to.have.property("condition").that.is.a("function");
    expectFrozenProperty(conditionError, "condition");
    expect(conditionError).to.have.property("self");
    expectFrozenProperty(conditionError, "self");
    expect(conditionError).to.have.property("args").that.is.an("arguments");
    expectFrozenProperty(conditionError, "args");
    //noinspection JSUnresolvedVariable,BadExpressionStatementJS
    expect(conditionError).to.be.extensible;
  }

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
            expectInvariants(conditionError);
            expect(conditionError.condition).equal(conditionCase);
            expect(conditionError.self).equal(self);
            expect(conditionError.args).equal(args);
          });
        });
      });
    });

    describe("#_setAndFreezeProperty()", function() {
      it("sets a property, and freezes it", function() {
        var subject = new ConditionError(conditionCase, null, argsCases[0]);
        var propertyName = "a new property";
        var propertyValue = "a new value";
        subject._setAndFreezeProperty(propertyName, propertyValue);
        expectFrozenProperty(subject, propertyName);
        expect(subject[propertyName]).to.equal(propertyValue);
        expectInvariants(subject);
      });
    });

    describe("#report()", function() {
      selfCases.forEach(function(self) {
        argsCases.forEach(function(args) {
          it("produces a string with all toppings from an instance with " + self + " - " + args, function() {
            var subject = new ConditionError(conditionCase, self, args);
            var result = subject.report();
            console.log(result + "\n");
            expect(result).to.be.a("string");
            expect(result).to.contain("" + conditionCase);
            if (args) {
              Array.prototype.forEach.call(args, function(arg) {
                expect(result).to.contain("" + arg);
              });
            }
            expect(result).to.contain("" + self);
            expectInvariants(subject);
          });
        });
      });
    });

  });

  return expectInvariants;
})();
