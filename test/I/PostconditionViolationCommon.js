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

  var dependencies = ["chai", "../_testUtil", "./ConditionViolationCommon", "../../src/I/PostconditionViolation"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(chai, testUtil, common, PostconditionViolation) {
  "use strict";

  var expect = chai.expect;

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

  function expectProperties(exception, Type, contractFunction, condition, self, args, result) {
    common.expectProperties.apply(undefined, arguments);
    expect(exception).to.have.property("result").that.equals(result);
  }

  var resultCaseGenerators = common.anyCasesGenerators("result");

  var test = {
    resultCaseGenerators: resultCaseGenerators,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    expectProperties: expectProperties,
    expectDetailsPost: expectDetailsPost
  };
  Object.setPrototypeOf(test, common);
  return test;

}));
