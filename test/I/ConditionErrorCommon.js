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


(function(factory) {
  "use strict";

  var dependencies = ["chai", "../_testUtil", "../../src/_private/util",
                      "./ContractErrorCommon", "../../src/I/ConditionError",
                      "../../src/I/AbstractContract", "./AbstractContractCommon",
                      "path"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(chai, testUtil, util, common, ConditionError, AbstractContract, abstractContractCommon, path) {
  "use strict";

  var expect = chai.expect;

  var contractLibTestPath = path.dirname(module.filename);
  var contractLibPath = path.dirname(path.dirname(contractLibTestPath)) + "/src/I";

  var conditionCase = function() {return "This simulates a condition";};

  function generateMultiLineAnonymousFunction() {
    return function() {
      var x = "This is a multi-line function";
      x += "The intention of this test";
      x += "is to verify";
      x += "whether we get an acceptable";
      x += "is to shortened version of this";
      x += "as a concise representation";
      x += "this function should have no name";
      x += "and no display name";
      return x;
    };
  }

  var conditionCases = [conditionCase, generateMultiLineAnonymousFunction()];

  function functionWithADisplayName() {}

  functionWithADisplayName.displayName = "This is a display name";
  conditionCases.push(functionWithADisplayName);
  var other = generateMultiLineAnonymousFunction();
  other.displayName = "This is a multi-line display name";
  other.displayName += "The intention of this test";
  other.displayName += "is to verify";
  other.displayName += "whether we get an acceptable";
  other.displayName += "is to shortened version of this";
  other.displayName += "as a concise representation";
  other.displayName += "this function should have a display name";
  conditionCases.push(other);

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
      return AbstractContract.isAContractFunction(cf);
    });
    expect(subject).to.have.property("condition").that.is.a("function");
    testUtil.expectOwnFrozenProperty(subject, "condition");
    testUtil.expectOwnFrozenProperty(subject, "self");
    testUtil.expectOwnFrozenProperty(subject, "_args");
    testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, "args", "_args");
    testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, "message");
    testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, "stack");
    expect(subject).to.have.property("message").that.contains(subject.contractFunction.displayName);
    expect(subject).to.have.property("message")
      .that.contains(util.conciseConditionRepresentation("condition", subject.condition));
  }

  function expectProperties(exception, Type, contractFunction, condition, self, args) {
    //noinspection BadExpressionStatementJS
    expect(exception).to.be.ok;
    expect(exception).to.be.instanceOf(Type);
    expect(exception).to.have.property("contractFunction").that.equals(contractFunction);
    expect(exception).to.have.property("condition").that.equals(condition);
    expect(exception).to.have.property("self").that.equals(self);
    expect(exception).to.have.property("args").that.eql(Array.prototype.slice.call(args));
  }

  function expectConstructorPost(result, contractFunction, condition, self, args) {
    common.expectConstructorPost(result, result.message);
    expectProperties(result, ConditionError, contractFunction, condition, self, args);
    //noinspection BadExpressionStatementJS
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
    conditionCases: conditionCases,
    expectProperties: expectProperties,
    expectConstructorPost: expectConstructorPost,
    expectDetailsPost: expectDetailsPost,
    expectInvariants: expectInvariants,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions,
    createCandidateContractFunction: abstractContractCommon.createCandidateContractFunction
  };
  Object.setPrototypeOf(test, common);
  return test;

}));
