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
"use strict";

var expect = require("chai").expect;
var Contract = require("../../src/Contract");
var ContractConditionMetaError = require("../../src/ContractConditionMetaError");
var ContractConditionViolation = require("../../src/ContractConditionViolation");

function x() {
  if (arguments.length <= 0) {
    return [];
  }
  return Array.prototype.reduce.call(
    arguments,
    function(acc, arrayI) {
      var ret = [];
      acc.forEach(function(elementSoFar) {
        arrayI.forEach(function(elementOfI) {
          ret.push(elementSoFar.concat([elementOfI]));
        });
      });
      return ret;
    },
    [[]]
  );
}

describe("Contract", function() {

  function invariants(contract) {
    expect(contract).to.have.ownProperty("pre"); // array not shared
    expect(contract.pre).to.be.an("array");
    expect(contract).to.have.ownProperty("post"); // array not shared
    expect(contract.post).to.be.an("array");
    expect(contract).to.have.property("verifyOne").that.is.a("function");
    expect(contract).to.have.property("verifyAll").that.is.a("function");
    expect(contract).to.have.property("implementation").that.is.a("function");
  }

  function someConditions() {return ["shallow"];} // MUDO these must be generators!
  function preCases() {return [null, someConditions()];}
  function postCases() {return [null, someConditions()];}

  function subjects() {
    return x(preCases(), postCases()).map(function(args) {
      return new Contract(args[0], args[1]);
    });
  }

  describe("#Contract()", function() {

    function expectPost(pre, post, result) {
      it("has a shallow copy of the given pre-conditions", function() {
        if (!pre) {
          expect(result.pre).to.eql([]);
        }
        else {
          expect(result.pre).to.eql(pre);
          expect(result.pre).to.not.equal(pre);  // it must be copy, don't share the array
          // TODO consider adding getter that slices
        }
      });
      it("has a shallow copy of the given post-conditions", function() {
        if (!post) {
          expect(result.post).to.eql([]);
        }
        else {
          expect(result.post).to.eql(post);
          expect(result.post).to.not.equal(post); // it must be copy, don't share the array
          // TODO consider adding getter that slices
        }
      });
      it("adheres to the invariants", function() {
        invariants(result);
      });
    }

    function constructorPreCases() {return preCases().concat([undefined]);}
    function constructorPostCases() {return postCases().concat([undefined]);}

    constructorPreCases().forEach(function(pre) {
      constructorPostCases().forEach(function(post) {
        describe("works for pre: " + pre + ", post: " + post, function() {
          var result = new Contract(pre, post);
          expectPost(pre, post, result);
        });
      });
    });
  });

  describe("#verifyOne()", function() {
    function expectPost(subject, condition, exception) {
      var outcome;
      try {
        outcome = condition.apply();
      }
      catch (err) {
        it("should throw a ContractConditionMetaError because the condition had an error", function(){
          expect(exception).to.be.ok;
          expect(exception).to.be.instanceOf(ContractConditionMetaError);
          expect(exception.error).to.eql(err);
          expect(exception.condition).to.equal(condition);
          // MUDO args
        });
        return;
      }
      it("should have thrown an exception when the condition and evaluates to false, and not otherwise, " +
         "because the condition ended nominally",
        function() {
          expect(!exception).to.equal(!!outcome);
          if (!outcome) {
            expect(exception).to.be.ok;
            expect(exception).to.be.instanceOf(ContractConditionViolation);
            expect(exception.condition).to.equal(condition);
            // MUDO args
          }
        }
      );
      it("adheres to the invariants", function() {
        invariants(subject);
      });
    }

    function conditionCases() {return [function() {}];}

    subjects().forEach(function(subject) {
      conditionCases().forEach(function(condition) {
        describe("works for " + subject + " - " + condition, function() {
          var exception;
          try {
            subject.verifyOne(condition); // MUDO args
          }
          catch (exc) {
            exception = exc;
          }
          expectPost(subject, condition, exception);
        });
      });
    });
  });

  describe("#verifyAll()", function() {
    function expectPost(subject, conditions, exception) {
      it("evaluates all conditions up until the first failure", function() {
        var firstFailure;
        var firstFailureIndex;
        for (var i = 0; !firstFailure && i < conditions.length; i++) {
          var outcome = conditions[i].apply();
          if (!outcome) {
            firstFailureIndex = i;
            firstFailure = conditions[i];
          }
        }
        expect(!!exception).to.equal(!!firstFailure);
      });
      it("adheres to the invariants", function() {
        invariants(subject);
      });
    }

    function conditionsCases() {return [[]];}

    subjects().forEach(function(subject) {
      conditionsCases().forEach(function(conditions) {
        describe("works for " + subject, function() {
          var exception;
          try {
            subject.verifyAll(conditions);
          }
          catch(exc) {
            exception = exc;
          }
          expectPost(subject, conditions, exception);
        });
      });
    });
  });
});
