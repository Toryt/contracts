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
                      "𝕋合同/_private/util", "./AbstractContractCommon", "𝕋合同/I/Contract"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, util, common, Contract) {
  "use strict";

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(Contract);
    common.expectInvariants(subject);
    expect(subject.location).to.satisfy(function(location) {return util.isALocationOutsideLibrary(location);});
    // this strengthening implies the same for the location of subject.abstract, since the locations have to be the same
    expect(subject.abstract).to.satisfy(function(cf) {return Contract.isAContractFunction(cf);});
    expect(subject).to.have.property("implementation").that.is.a("function");
  }

  //noinspection FunctionNamingConventionJS
  function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
    common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);
    var self = this; // jshint ignore:line

    //noinspection FunctionTooLongJS
    describe("#implementation", function() {
      function expectPost(contract, implFunction , result) {
        //noinspection BadExpressionStatementJS,JSHint
        expect(contract.isImplementedBy(result)).to.be.ok;
        expect(result).to.satisfy(Contract.isAContractFunction);
        expect(result).to.have.property("contract").that.equals(contract);
        expect(result).to.have.property("implementation").that.equals(implFunction);
        self.expectInvariants(contract);
      }

      it("returns an Contract function that is configured as expected", function() {
        var subject = oneSubjectGenerator();
        var impl = function() {};
        var result = subject.implementation(impl);
        expectPost(subject, impl, result);
      });

      it("returns a different Contract function when called with the same implementation", function() {
        var subject = oneSubjectGenerator();
        var impl = function() {};
        var result = subject.implementation(impl);
        //noinspection LocalVariableNamingConventionJS
        var result2 = subject.implementation(impl);
        expectPost(subject, impl, result2);
        expect(result2).to.not.equal(result);
      });

      it("returns a different Contract function with a different implementation", function() {
        var subject = oneSubjectGenerator();
        var impl = function() {};
        //noinspection LocalVariableNamingConventionJS
        var impl2 = function() {};
        var result = subject.implementation(impl);
        //noinspection LocalVariableNamingConventionJS
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

}));
