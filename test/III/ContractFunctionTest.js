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

  var dependencies = ["./ContractFunctionCommon", "𝕋合同/III/Contract"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(common, Contract) {
  "use strict";

  common.generateDescriptions("ContractFunction", Contract);

      // TODO support class construct
      //it("works with a class", function() {
      //  class PersonImplementation {
      //    constructor(name) {
      //      this._name = name;
      //    }
      //
      //    get name() {
      //      return this._name;
      //    }
      //  }
      //
      //  expectConstructorToWork(PersonImplementation);
      //});

}));
