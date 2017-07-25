/*
 Copyright 2017 by Jan Dockx

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
                      "./ProxyImplementationContractCommon", "𝕋合同/III/ProxyImplementationContract",
                      "./AbstractContractCommon", "𝕋合同/III/AbstractContract"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, common, ProxyImplementationContract, AbstractContractCommon,
           AbstractContract) {
  "use strict";

  // describe("I", function() {
    describe("III/ProxyImplementationContract", function() {

      describe("ProxyImplementationContract", function() {
        it("has the expected properties", function() {
          expect(ProxyImplementationContract).to.haveOwnProperty("prototype");
          AbstractContractCommon.expectInvariants(ProxyImplementationContract.prototype);
          expect(ProxyImplementationContract.prototype).to.have.property("implementation").that.is.a("function");
          expect(ProxyImplementationContract).to.haveOwnProperty("root");
          expect(ProxyImplementationContract).to.have.property("root").that.equals(AbstractContract.root);
          expect(ProxyImplementationContract).to.haveOwnProperty("isAContractFunction");
          expect(ProxyImplementationContract)
            .to.have.property("isAContractFunction")
            .that.equals(AbstractContract.isAContractFunction);
        });
      });

      describe("#ProxyImplementationContract()", function() {
        common.constructorPreCases.forEach(function(pre) {
          common.constructorPostCases.forEach(function(post) {
            common.constructorExceptionCases.forEach(function(exception) {
              describe("works for pre: " + pre + ", post: " + post + ", exception: " + exception, function() {
                var preConditions = pre();
                var postConditions = post();
                var exceptionConditions = exception();
                var result = new ProxyImplementationContract({
                  pre: preConditions,
                  post: postConditions,
                  exception: exceptionConditions
                });
                common.expectConstructorPost(preConditions, postConditions, exceptionConditions, result);
              });
            });
          });
        });
      });

      common.generatePrototypeMethodsDescriptions(
        function() {return new ProxyImplementationContract({});},
        testUtil
          .x(common.constructorPreCases, common.constructorPostCases, common.constructorExceptionCases)
          .map(function(parameters) {
            return function() {
              var preConditions = parameters[0]();
              var postConditions = parameters[1]();
              var exceptionConditions = parameters[2]();
              return {
                subject: new ProxyImplementationContract({
                  pre: preConditions,
                  post: postConditions,
                  exception: exceptionConditions
                }),
                description: parameters.join(" - ")
              };
            };
          })
      );

    });
  // });

}));
