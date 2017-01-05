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
  var ConditionError = require("../../src/I/ConditionError");
  var util = require("../../src/_private/util");
  var Contract = require("../../src/I/Contract");
  var testUtil = require("../_testUtil");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ConditionError);
    expect(subject).to.have.property("contractFunction").that.satisfies(function(cf) {
      return Contract.isAContractFunction(cf);
    });
    testUtil.expectOwnFrozenProperty(subject, "contractFunction");
    expect(subject).to.have.property("condition").that.is.a("function");
    testUtil.expectOwnFrozenProperty(subject, "condition");
    expect(subject).to.have.property("self");
    testUtil.expectOwnFrozenProperty(subject, "self");
    //noinspection BadExpressionStatementJS
    expect(subject).to.have.property("args").that.is.ok;
    expect(util.typeOf(subject.args)).to.satisfy(function(t) {return t === "arguments" || t === "array";});
    testUtil.expectOwnFrozenProperty(subject, "args");
    expect(subject).to.have.ownProperty("_stackSource");
    expect(subject._stackSource).to.be.instanceOf(Error);
    expect(subject._stackSource).to.have.property("name").that.equals(subject.name);
    expect(subject._stackSource).to.have.property("message").that.equals(subject.message);
    testUtil.expectOwnFrozenProperty(subject, "_stackSource");
    //noinspection JSUnresolvedVariable,BadExpressionStatementJS
    expect(subject._stackSource).to.be.frozen;
    expect(subject).to.have.property("stack");
    var startOfStack = subject.name + ": " + subject.message;
    expect(subject.stack.indexOf(startOfStack)).to.equal(0);
  }

  function expectConstructorPost(result, contractFunction, condition, self, args) {
    expect(result.contractFunction).equal(contractFunction);
    expect(result.condition).equal(condition);
    expect(result.self).equal(self);
    expect(result.args).equal(args);
    //noinspection JSUnresolvedVariable,BadExpressionStatementJS
    expect(result).to.be.extensible;
  }

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

  var argsCases = [
    [],
    ["one argument"],
    selfCases
  ];
  argsCases = argsCases.concat(argsCases.map(function(c) {
    function asArgs(args) {
      return arguments;
    }

    return asArgs.apply(undefined, c);
  }));

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {

    describe("#isCivilized", function() {
      allSubjectGenerators.forEach(function(subjectGenerator) {
        var subjectContext = subjectGenerator();
        var subject = subjectContext.subject;
        it("determines civilization as expected from an instance with " + subjectContext.description, function() {
          var result = subject.isCivilized();
          expect(result).to.be.a("boolean");
          /* Postcondition is an implication: subtypes might add more

             (result === true) ==> (this.condition && this.args),
             which is the same as
             (result === false) || (this.condition && this.args)
             (this.condition && this.args) || (result === false)
             !(!this.condition || !this.args) || (result === false)
             (!this.condition || !this.args) ==> (result === false)

             A false result doesn't imply anything. It could be because there is no condition, or no args,
             but it also might be because of any other reason.
             When there is a condition and there are args, the result does not necessarily have to be true.
             There might be other conditions that need to apply for that.
           */
          if (result) {
            //noinspection BadExpressionStatementJS
            expect(subject.condition).to.be.ok;
            //noinspection BadExpressionStatementJS
            expect(subject.args).to.be.ok;
          }
          expectInvariants(subject);
        });
      });
    });

  }

  // describe("I", function() {
    describe("I/ConditionError", function() {

      describe("#ConditionError.createMessage", function() {
        it("has a function createMessage()", function() {
          expect(ConditionError).to.have.property("createMessage").that.is.a("function");
        });
      });

      describe("#ConditionError.createMessage()", function() {
        selfCases.forEach(function(self) {
          argsCases.forEach(function(args) {
            it("works when called with " + self + " - " + args, function() {
              var contractFunction = Contract.dummyImplementation();
              var result = ConditionError.createMessage(contractFunction, conditionCase, self, args);
              expect(result).to.be.a("string");
              expect(result).to.contain(contractFunction.displayName);
              expect(result).to.contain("" + conditionCase);
              expect(result).to.contain("" + self);
              Array.prototype.forEach(function(arg) {
                expect(result).to.contain("" + arg);
              });
            });
          });
        });
      });

      describe("#ConditionError()", function() {
        selfCases.forEach(function(self) {
          argsCases.forEach(function(args) {
            it("creates an instance with all toppings for " + self + " - " + args, function() {
              var contractFunction = Contract.dummyImplementation();
              var result = new ConditionError(contractFunction, conditionCase, self, args);
              expectConstructorPost(result, contractFunction, conditionCase, self, args);
              expectInvariants(result);
              expect(result.name).to.equal("Contract Condition Error");
              expect(result.message).to.equal(ConditionError.createMessage(contractFunction, conditionCase, self, args));
              testUtil.log("result.stack: %s", result.stack);
            });
          });
        });
      });

      generatePrototypeMethodsDescriptions(
        function () {
          return new ConditionError(conditionCase, null, argsCases[0]);
        },
        testUtil
          .x(selfCases, argsCases)
          .map(function(parameters) {
            return function() {
              return {
                subject: new ConditionError(Contract.dummyImplementation(), conditionCase, parameters[0], parameters[1]),
                description: parameters.join(" - ")
              };
            };
          })
      );

    });
  // });

  return {
    selfCases: selfCases,
    argsCases: argsCases,
    conditionCase: conditionCase,
    expectConstructorPost: expectConstructorPost,
    expectInvariants: expectInvariants,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };

})();
