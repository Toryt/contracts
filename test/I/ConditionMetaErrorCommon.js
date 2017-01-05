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
  var common = require("./ConditionErrorCommon");
  var ConditionMetaError = require("../../src/I/ConditionMetaError");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ConditionMetaError);
    if (subject.error) {
      //noinspection JSUnresolvedVariable,BadExpressionStatementJS
      expect(subject.error).to.be.frozen;
    }
    common.expectInvariants(subject);
    expect(subject.stack).to.contain("" + subject.error);
  }

  function expectConstructorPost(result, contractFunction, condition, self, args, error) {
    common.expectConstructorPost(result, contractFunction, condition, self, args);
    expect(result.error).to.equal(error);
  }

  //noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS
  var errorCases = [
    new Error(),
    undefined,
    null,
    1,
    0,
    "a string that is used as an error",
    "",
    true,
    false,
    new Date(),
    /foo/,
    function() {},
    new Number(42),
    new Boolean(false),
    new String("lalala"),
    arguments
  ];

  var test = {
    errorCases: errorCases,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost
  };
  Object.setPrototypeOf(test, common);
  return test;

})();
