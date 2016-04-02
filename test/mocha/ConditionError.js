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
  var util = require("../../src/util");
  var testUtil = require("./testUtil");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ConditionError);
    expect(subject).to.have.property("condition").that.is.a("function");
    testUtil.expectFrozenProperty(subject, "condition");
    expect(subject).to.have.property("self");
    testUtil.expectFrozenProperty(subject, "self");
    //noinspection BadExpressionStatementJS
    expect(subject).to.have.property("args").that.is.ok;
    expect(util.typeOf(subject.args)).to.satisfy(function(t) {return t === "arguments" || t === "array";});
    testUtil.expectFrozenProperty(subject, "args");
    //noinspection JSUnresolvedVariable,BadExpressionStatementJS
    expect(subject).to.be.extensible;
  }

  function expectConstructorPost(result, condition, self, args) {
    expect(result.condition).equal(condition);
    expect(result.self).equal(self);
    expect(result.args).equal(args);
  }

  var conditionCase = function() {return "This simulates a condition";}; // MUDO not mandatory!

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

  var argsCases = [ // MUDO not mandatory!
    [],
    ["one argument"],
    selfCases
  ];
  argsCases = argsCases.concat(argsCases.map(function(c) {return arguments;}));

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {

    describe("#_setAndFreezeProperty()", function() {
      it("sets a property, and freezes it", function() {
        var subject = oneSubjectGenerator();
        var propertyName = "a new property";
        var propertyValue = "a new value";
        subject._setAndFreezeProperty(propertyName, propertyValue);
        testUtil.expectFrozenProperty(subject, propertyName);
        expect(subject[propertyName]).to.equal(propertyValue);
        expectInvariants(subject);
      });
    });

    // MUDO isCivilized

    describe("#report()", function() {
      allSubjectGenerators.forEach(function(subjectGenerator) {
        var subjectContext = subjectGenerator();
        var subject = subjectContext.subject;
        it(
          "produces a string with all toppings from an instance with " + subjectContext.description,
          function() {
            var result = subject.report();
            console.log(result + "\n");
            expect(result).to.be.a("string");
            expect(result).to.contain("" + subject.condition);
            if (subject.args) {
              Array.prototype.forEach.call(subject.args, function(arg) {
                expect(result).to.contain("" + arg);
              });
            }
            expect(result).to.contain("" + subject.self);
            expectInvariants(subject);
          }
        );
      });
    });

  }

  describe("ConditionError", function() {

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
            var result = new ConditionError(conditionCase, self, args);
            expectConstructorPost(result, conditionCase, self, args);
            expectInvariants(result);
          });
        });
      });
    });

    generatePrototypeMethodsDescriptions(
      function () {
        return new ConditionError(conditionCase, null, argsCases[0]);
      },
      testUtil.x([conditionCase], selfCases, argsCases).map(function(parameters) {
        return function() {
          return {
            subject: new ConditionError(parameters[0], parameters[1], parameters[2]),
            description: parameters.join(" - ")
          };
        };
      })
    );

  });

  return {
    selfCases: selfCases,
    argsCases: argsCases,
    conditionCase: conditionCase,
    expectConstructorPost: expectConstructorPost,
    expectInvariants: expectInvariants,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };

})();
