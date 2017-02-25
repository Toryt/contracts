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
  var AbstractError = require("../../src/I/Contract").AbstractError;

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(AbstractError);
    common.expectInvariants(subject);
    expect(subject).to.have.property("message").that.equals(AbstractError.message);
  }

  function expectConstructorPost(result, contract) {
    common.expectConstructorPost(result, AbstractError.message);
    expect(result).to.have.property("contract").that.equals(contract);
  }

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

})();
