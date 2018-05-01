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
                      "𝕋合同/_private/util", "./ConditionErrorCommon", "𝕋合同/III/ConditionMetaError"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, util, common, ConditionMetaError) {
  "use strict";

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ConditionMetaError);
    if (subject.error) {
      //noinspection BadExpressionStatementJS,JSHint
      expect(subject.error).to.be.frozen;
    }
    common.expectInvariants(subject);
    testUtil.expectOwnFrozenProperty(subject, "error");
    expect(subject).to.have.property("stack").that.contains("" + subject.error);
    if (subject.error && subject.error.stack) {
      expect(subject).to.have.property("stack").that.contains(subject.error.stack);
    }
    expect(subject).to.have.property("message").that.contains("(" + subject.error + ")");
  }

  function expectConstructorPost(result, contractFunction, condition, self, args, error) {
    common.expectConstructorPost.apply(undefined, arguments);
    expect(result).to.have.property("error").that.equals(error);
  }

  //noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS,JSHint
  var errorCases = [
    new Error("This is an error case"),
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
    arguments,
    {},
    {a: 1, b: "b", c: {}, d: {d1: undefined, d2: "d2", d3: {d31: 31}}}
  ];

  function expectDetailsPost(subject, result) {
    common.expectDetailsPost(subject, result);
    expect(result)
      .to.contain("" + subject.error);
    if (subject.error && subject.error.stack) {
      expect(result).to.contain(util.eol + subject.error.stack);
    }
  }

  var test = {
    errorCases: errorCases,
    expectInvariants: expectInvariants,
    expectConstructorPost: expectConstructorPost,
    expectDetailsPost: expectDetailsPost
  };
  Object.setPrototypeOf(test, common);
  return test;

}));
