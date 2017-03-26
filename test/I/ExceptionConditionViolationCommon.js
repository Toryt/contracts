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
                      "./ConditionViolationCommon", "𝕋合同/I/ExceptionConditionViolation"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, common, ExceptionConditionViolation) {
  "use strict";

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ExceptionConditionViolation);
    common.expectInvariants(subject);
    testUtil.expectOwnFrozenProperty(subject, "exception");
    expect(subject).to.have.property("stack").that.contains("" + subject.exception);
  }

  function expectConstructorPost(executionResult, contractFunction, condition, self, args, exception) {
    common.expectConstructorPost.apply(undefined, arguments);
    expect(executionResult).to.have.property("exception").that.equals(exception);
  }


  function expectProperties(exception, Type, contractFunction, condition, self, args, thrownException) {
    common.expectProperties.apply(undefined, arguments);
    expect(exception).to.have.property("exception").that.equals(thrownException);
  }

  function expectDetailsPost(subject, result) {
    common.expectDetailsPost(subject, result);
    expect(result).to.contain(subject.exception);
  }

  var exceptionCaseGenerators = testUtil.anyCasesGenerators("exception");

  function doctorArgs(args, boundContractFunction, exception) {
    var doctored = Array.prototype.slice.call(args);
    //noinspection MagicNumberJS
    var e = arguments.length >= 3 ? exception : new Error("Dummy exception for ExceptionConditionViolation");
    doctored.push(e); // an exception
    doctored.push(boundContractFunction);
    return doctored;
  }

  var test = {
    exceptionCaseGenerators: exceptionCaseGenerators,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    expectProperties: expectProperties,
    expectDetailsPost: expectDetailsPost,
    doctorArgs: doctorArgs
  };
  Object.setPrototypeOf(test, common);
  return test;

}));
