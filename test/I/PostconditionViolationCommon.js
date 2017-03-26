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

  var dependencies = ["../_util/describe", "../_util/it", "../_util/expect", "../_util/testUtil",
                      "./ConditionViolationCommon", "𝕋合同/I/PostconditionViolation"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, common, PostconditionViolation) {
  "use strict";

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(PostconditionViolation);
    common.expectInvariants(subject);
    testUtil.expectOwnFrozenProperty(subject, "result");
    expect(subject).to.have.property("stack").that.contains("" + subject.result);
  }

  function expectConstructorPost(executionResult, contractFunction, condition, self, args, result) {
    common.expectConstructorPost.apply(undefined, arguments);
    expect(executionResult).to.have.property("result").that.equals(result);
  }

  function expectDetailsPost(subject, result) {
    common.expectDetailsPost(subject, result);
    expect(result).to.contain(subject.result);
  }

  //noinspection ParameterNamingConventionJS
  function expectProperties(exception, Type, contractFunction, condition, self, args, result) {
    common.expectProperties.apply(undefined, arguments);
    expect(exception).to.have.property("result").that.equals(result);
  }

  var resultCaseGenerators = testUtil.anyCasesGenerators("result");

  function doctorArgs(args, boundContractFunction, result) {
    var doctored = Array.prototype.slice.call(args);
    //noinspection MagicNumberJS
    var r = arguments.length >= 3 ? result : 42;
    doctored.push(r); // a result
    doctored.push(boundContractFunction);
    return doctored;
  }

  var test = {
    resultCaseGenerators: resultCaseGenerators,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    expectProperties: expectProperties,
    expectDetailsPost: expectDetailsPost,
    doctorArgs: doctorArgs
  };
  Object.setPrototypeOf(test, common);
  return test;

}));
