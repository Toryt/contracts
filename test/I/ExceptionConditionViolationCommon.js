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
  var common = require("./ConditionViolationCommon");
  var ExceptionConditionViolation = require("../../src/I/ExceptionConditionViolation");
  var testUtil = require("../_testUtil");

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

  function expectDetailsPost(subject, result) {
    common.expectDetailsPost(subject, result);
    expect(result).to.contain(subject.exception);
  }

  //noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS
  var exceptionCases = [
    new Error("This is an exception case"),
    undefined,
    null,
    1,
    0,
    "a string that is used as an exception",
    "",
    true,
    false,
    new Date(),
    /foo/,
    function() {},
    new Number(42),
    new Boolean(false),
    new String("lalala"),
    arguments,
    {},
    {a: 1, b: "b", c: {}, d: {d1: undefined, d2: "d2", d3: {d31: 31}}}
  ];

  var test = {
    exceptionCases: exceptionCases,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    expectDetailsPost: expectDetailsPost
  };
  Object.setPrototypeOf(test, common);
  return test;

})();
