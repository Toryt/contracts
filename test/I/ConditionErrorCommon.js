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

module.exports = (function() {
  "use strict";

  var expect = require("chai").expect;
  var common = require("./ContractErrorCommon");
  var ConditionError = require("../../src/I/ConditionError");
  var contractCommon = require("./ContractCommon");
  var util = require("../../src/_private/util");
  var Contract = require("../../src/I/Contract");
  var testUtil = require("../_testUtil");
  var path = require("path");

  var contractLibTestPath = path.dirname(module.filename);
  var contractLibPath = path.dirname(path.dirname(contractLibTestPath)) + "/src/I";

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

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ConditionError);
    common.expectInvariants(subject);
    testUtil.expectOwnFrozenProperty(subject, "contractFunction");
    expect(subject).to.have.property("contractFunction").that.satisfies(function(cf) {
      return Contract.isAContractFunction(cf);
    });
    expect(subject).to.have.property("condition").that.is.a("function");
    testUtil.expectOwnFrozenProperty(subject, "condition");
    testUtil.expectOwnFrozenProperty(subject, "self");
    testUtil.expectOwnFrozenProperty(subject, "args");
    //noinspection BadExpressionStatementJS
    expect(subject).to.have.property("args").that.is.ok;
    expect(util.typeOf(subject.args)).to.satisfy(function(t) {return t === "arguments" || t === "array";});
    testUtil.expectConfigurableDerivedPropertyOnAPrototype(subject, "message");
    testUtil.expectConfigurableDerivedPropertyOnAPrototype(subject, "stack");
    expect(subject).to.have.property("message").that.contains(subject.contractFunction.displayName);
    expect(subject).to.have.property("message")
      .that.contains(util.conciseConditionRepresentation("condition", subject.condition));
  }

  function expectConstructorPost(result, contractFunction, condition, self, args) {
    common.expectConstructorPost(result, result.message);
    expect(result).to.have.property("contractFunction").that.equals(contractFunction);
    expect(result).to.have.property("condition").that.equals(condition);
    expect(result).to.have.property("self").that.equals(self);
    expect(result).to.have.property("args").that.eql(args); // MUDO array protection
    //noinspection JSUnresolvedVariable,BadExpressionStatementJS
    expect(result).to.be.extensible;
  }

  function expectDetailsPost(subject, result) {
    expect(result).to.be.a("string");
    expect(result).to.contain(subject.condition);
    expect(result).to.contain(util.eol + subject.contractFunction.contract.location);
    expect(result).to.contain(subject.self);
    Array.prototype.forEach.call(
      subject.args,
      function(arg) {expect(result).to.contain(arg);}
    );
  }

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators, expectInvariants) {

    common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators, expectInvariants);

    describe("#getDetails()", function() {
      allSubjectGenerators.forEach(function(generator) {
        var testCase = generator();
        it("returns the details as expected for " + testCase.description, function() {
          var result = testCase.subject.getDetails();
          expectDetailsPost(testCase.subject, result);
          expectInvariants(testCase.subject);
        });
      });
    });

  }

  var test = {
    selfCases: selfCases,
    argsCases: argsCases,
    conditionCase: conditionCase,
    expectConstructorPost: expectConstructorPost,
    expectDetailsPost: expectDetailsPost,
    expectInvariants: expectInvariants,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions,
    createCandidateContractFunction: contractCommon.createCandidateContractFunction
  };
  Object.setPrototypeOf(test, common);
  return test;

})();
