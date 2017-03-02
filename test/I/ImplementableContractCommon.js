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
  var common = require("./AbstractContractCommon");
  var ImplementableContract = require("../../src/I/ImplementableContract");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ImplementableContract);
    common.expectInvariants(subject);
    expect(subject).to.have.property("implementation").that.is.a("function");
  }

  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
    common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);
    var self = this;

    //noinspection FunctionTooLongJS
    describe("#implementation", function() {
      function expectPost(implementableContract, implFunction , result) {
        //noinspection BadExpressionStatementJS
        expect(implementableContract.isImplementedBy(result)).to.be.ok;
        expect(result).to.have.property("contract").that.equals(implementableContract);
        expect(result).to.have.property("implementation").that.equals(implFunction);
        self.expectInvariants(implementableContract);
      }

      it("returns an ImplementableContract function that is configured as expected", function() {
        var subject = oneSubjectGenerator();
        var impl = function() {};
        var result = subject.implementation(impl);
        expectPost(subject, impl, result);
      });

      it("returns a different ImplementableContract function when called with the same implementation", function() {
        var subject = oneSubjectGenerator();
        var impl = function() {};
        var result = subject.implementation(impl);
        var result2 = subject.implementation(impl);
        expectPost(subject, impl, result2);
        expect(result2).to.not.equal(result);
      });

      it("returns a different ImplementableContract function with a different implementation", function() {
        var subject = oneSubjectGenerator();
        var impl = function() {};
        var impl2 = function() {};
        var result = subject.implementation(impl);
        var result2 = subject.implementation(impl2);
        expectPost(subject, impl2, result2);
        expect(result2).to.not.equal(result);
        expect(result2).to.have.property("implementation").that.not.equals(result.implementation);
      });

    });

  }

  var test = {
    expectInvariants: expectInvariants,
    generatePrototypeMethodsDescriptions: generatePrototypeMethodsDescriptions
  };
  Object.setPrototypeOf(test, common);
  return test;

})();
