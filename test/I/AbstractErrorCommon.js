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
                      "𝕋合同/_private/util", "./ContractErrorCommon", "𝕋合同/I/AbstractContract"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, util, common, AbstractContract) {
  "use strict";

  //noinspection LocalVariableNamingConventionJS
  var AbstractError = AbstractContract.AbstractError;

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(AbstractError);
    common.expectInvariants(subject);
    testUtil.expectOwnFrozenProperty(subject, "name");
    expect(subject).to.have.property("name").that.equals(AbstractError.name);
    testUtil.expectOwnFrozenProperty(Object.getPrototypeOf(subject), "name");
    expect(Object.getPrototypeOf(subject)).to.have.property("name").that.equals(AbstractError.name);
    testUtil.expectOwnFrozenProperty(subject, "message");
    expect(subject).to.have.property("message").that.equals(AbstractError.message);
    testUtil.expectOwnFrozenProperty(AbstractError.prototype, "message");
    expect(Object.getPrototypeOf(subject)).to.have.property("message").that.equals(AbstractError.message);
  }

  function expectConstructorPost(result, message, contract) {
    common.expectConstructorPost(result, message);
    expect(result).to.have.property("contract").that.equals(contract);
  }

  //noinspection FunctionNamingConventionJS
  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {

    common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);

    // NOP: no methods here

  }

  var test = {
    expectConstructorPost: expectConstructorPost,
    expectInvariants: expectInvariants,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };
  Object.setPrototypeOf(test, common);
  return test;

}));
