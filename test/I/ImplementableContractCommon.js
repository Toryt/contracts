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
  var common = require("./ContractCommon");
  var ImplementableContract = require("../../src/I/ImplementableContract");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ImplementableContract);
    common.expectInvariants(subject);
    expect(subject).to.have.property("implementation").that.is.a("function");
  }

  var test = {
    expectInvariants: expectInvariants
  };
  Object.setPrototypeOf(test, common);
  return test;

})();
