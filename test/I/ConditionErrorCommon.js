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
    expect(subject).to.have.property("name").that.is.a("string");
    expect(subject).to.have.property("message").that.is.a("string");
    expect(subject).to.have.property("stack");
    var startOfStack = subject.name + ": " + subject.message;
    expect(subject.stack.indexOf(startOfStack)).to.equal(0);
    var linesInMessage = util.nrOfLines(subject.message);
    var stackWithoutMessage = subject.stack.split(util.eol).splice(linesInMessage);
    stackWithoutMessage.forEach(function(line, index) {
      /* .../src/... contains the library code. This should never be mentioned in the stack trace.
         It is inner workings, and confuses the target audience, which is only interested in the code that
         uses the library. */
      expect(line).to.satisfy(function(l) {return l.indexOf(contractLibPath) < 0;});
      /* In our tests, the code that uses the library is our test code in ...//test/I/Condition..., or the
         test framework library, in .../mocha/..., except for the last few lines. These lines will be node-internal,
         and have no slash, or be internal/module.js. The first line should be our own code. */
      if (index === 0) {
        // expect(line).to.satisfy(function(l) {return 0 <= l.indexOf(contractLibTestPath);});
      }
      else if (index < (stackWithoutMessage.length - 1)) {
        // expect(line).to.satisfy(function(l) {
        //   return 0 <= l.indexOf(contractLibTestPath) ||
        //          0 <= l.indexOf("/mocha/") ||
        //          l.indexOf("/") < 0 ||
        //          0 <= l.indexOf("require (internal/module.js");
        // });
      }
    });
    expect(subject).to.have.property("constructor").that.hasOwnProperty("createMessage");
    expect(subject).to.have.property("constructor").that.has.property("createMessage").that.is.a("function");
  }

  function expectConstructorPost(result, contractFunction, condition, self, args) {
    var otherArgs = Array.prototype.slice.call(arguments);
    otherArgs.shift();
    otherArgs.unshift(result.constructor.createMessage.apply(undefined, otherArgs));
    otherArgs.unshift(result);
    common.expectConstructorPost.apply(undefined, otherArgs);
    expect(result.contractFunction).equal(contractFunction);
    expect(result.condition).equal(condition);
    expect(result.self).equal(self);
    expect(result.args).equal(args);
    //noinspection JSUnresolvedVariable,BadExpressionStatementJS
    expect(result).to.be.extensible;
  }

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {

    common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);

    // NOP: no methods here

  }

  var test = {
    selfCases: selfCases,
    argsCases: argsCases,
    conditionCase: conditionCase,
    expectConstructorPost: expectConstructorPost,
    expectInvariants: expectInvariants,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions,
    createCandidateContractFunction: contractCommon.createCandidateContractFunction
  };
  Object.setPrototypeOf(test, common);
  return test;

})();
