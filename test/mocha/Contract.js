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

var expect = require("chai").expect;
var Contract = require("../../src/Contract");

function invariants(contract) {
  expect(contract).to.have.ownProperty("pre");
  expect(contract.pre).to.be.an("array");
  expect(contract).to.have.ownProperty("post");
  expect(contract.post).to.be.an("array");
  expect(contract).to.have.property("verify").that.is.a("function");
  expect(contract).to.have.property("implementation").that.is.a("function");
}

var someConditions = ["shallow"];

describe("Contract", function() {
  describe("#Contract()", function() {
    it("has pre and post properties, also when none are given", function() {
      var result = new Contract();
      invariants(result);
    });
    it("has a shallow copy of the given pre-conditions", function() {
      var result = new Contract(someConditions);
      invariants(result);
      expect(result.pre).to.eql(someConditions);
    });
    it("has a shallow copy of the given post-conditions", function() {
      var result = new Contract(null, someConditions);
      invariants(result);
      expect(result.post).to.eql(someConditions);
    });
    it("has a shallow copy of all the given conditions", function() {
      var result = new Contract(someConditions, someConditions);
      invariants(result);
      expect(result.pre).to.eql(someConditions);
      expect(result.post).to.eql(someConditions);
    });
  });
});
