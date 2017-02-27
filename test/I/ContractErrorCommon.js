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
  var ContractError = require("../../src/I/ContractError");
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");
  var path = require("path");

  var contractLibTestPath = path.dirname(module.filename);
  var contractLibPath = path.dirname(path.dirname(contractLibTestPath)) + "/src/I";

  function expectStackInvariants(subject) {
    expect(subject).to.have.property("stack").to.be.a("string");
    var stack = subject.stack;
    var startOfStack = subject.name + ": " + subject.message + util.eol;
    expect(stack).to.match(new RegExp("^" + testUtil.regExpEscape(startOfStack)));
    expect(stack).to.match(new RegExp(
      testUtil.regExpEscape(util.eol + util.stackOutsideThisLibrary(subject._stackSource)) + "$")
    );
  }

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ContractError);
    testUtil.expectOwnFrozenProperty(subject, "_stackSource");
    //noinspection BadExpressionStatementJS
    expect(subject).to.have.property("_stackSource").that.is.frozen;
    expect(subject).to.have.property("_stackSource").that.is.instanceOf(Error);
    expect(subject).to.have.deep.property("_stackSource.name").that.equals(ContractError.stackSourceName);
    expect(subject)
      .to.have.deep.property("_stackSource.message")
      .that.is.a("string")
      .that.equals(ContractError.stackSourceMessage);
    testUtil.expectOwnFrozenProperty(Object.getPrototypeOf(subject), "name");
    expect(subject).to.have.property("name").that.is.a("string");
    testUtil.expectOwnFrozenProperty(ContractError.prototype, "message");
    expect(subject).to.have.property("message").that.is.a("string");
    expectStackInvariants(subject);
  }

  function expectConstructorPost(result, message) {
    //noinspection BadExpressionStatementJS
    expect(result).to.be.extensible;
    expect(result).to.have.property("name").that.equals(result.constructor.name);
    expect(result).to.have.property("message").that.equals(message);
  }

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {

    // NOP: no methods here

  }

  return {
    expectConstructorPost: expectConstructorPost,
    expectStackInvariants: expectStackInvariants,
    expectInvariants: expectInvariants,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };

})();
