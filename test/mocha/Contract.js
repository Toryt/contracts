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
    expect(contract).to.have.ownProperty("exception"); // array not shared
    expect(contract.exception).to.be.an("array");
    expect(contract).to.have.property("verifyOne").that.is.a("function");
    expect(contract).to.have.property("verifyAll").that.is.a("function");
    expect(contract).to.have.property("implementation").that.is.a("function");
  }

  var someConditions = [
    function() {return [];},
    function() {return ["shallow"];}
  ];
  var preCases = [
    function() {return null;}
  ].concat(someConditions);
  var postCases = [
    function() {return null;}
  ].concat(someConditions);
  var exceptionCases = [
    function() {return null;}
  ].concat(someConditions);

  var subjects = x(preCases, postCases, exceptionCases).map(function(args) {
    return function() {return new Contract(args[0](), args[1](), args[2]());};
  });

  var selfCases = [
    function() {return undefined;},
    function() {return null;},
    function() {return {};}
  ];

  var argsCases = [
    function() {return undefined;},
    function() {return null;},
    function() {return [];},
    function() {return ["an argument"];},
    function() {return ["an argument", "another argument"];}
  ];

  var thingsThatAreNotAFunctionNorAContract = [
    undefined,
    null,
    "",
    "lala",
    0,
    -1,
    true,
    false,
    /lala/,
    {},
    new Date()
  ];

  describe("Contract.isAContractFunction", function() {
    function createSubject(contract, implementation) {
      var subject = function() {};
      if (contract) {
        subject.contract = contract;
      }
      if (implementation) {
        subject.implementation = implementation;
      }
      return subject;
    }

    it("says no on any thing that is not a function", function() {
      thingsThatAreNotAFunctionNorAContract.forEach(function(thing) {
        //noinspection BadExpressionStatementJS
        expect(Contract.isAContractFunction(thing)).not.to.be.ok;
      });
    });
    it("says no if there is no Contract property, with or without an implementation", function() {
      thingsThatAreNotAFunctionNorAContract.concat([function() {}]).forEach(function(thing) {
        var subject = createSubject(thing);
        //noinspection BadExpressionStatementJS
        expect(Contract.isAContractFunction(subject)).not.to.be.ok;
        subject = createSubject(thing, function() {});
        //noinspection BadExpressionStatementJS
        expect(Contract.isAContractFunction(subject)).not.to.be.ok;
      });
    });
    it("says no if there is no implementation property, with or without a Contract", function() {
      thingsThatAreNotAFunctionNorAContract.forEach(function(thing) {
        var subject = createSubject(null, thing);
        //noinspection BadExpressionStatementJS
        expect(Contract.isAContractFunction(subject)).not.to.be.ok;
        subject = createSubject(new Contract(), thing);
        //noinspection BadExpressionStatementJS
        expect(Contract.isAContractFunction(subject)).not.to.be.ok;
      });
    });
    it("says yes if there is an implementation Function, and a Contract", function() {
      var subject = function() {};
      subject.contract = new Contract();
      subject.implementation = function() {};
      //noinspection BadExpressionStatementJS
      expect(Contract.isAContractFunction(subject)).to.be.ok;
    });
  });

  describe("#Contract()", function() {

    function expectPost(pre, post, exception, result) {
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
      it("has a shallow copy of the given exception-conditions", function() {
        if (!exception) {
          expect(result.exception).to.eql([]);
        }
        else {
          expect(result.exception).to.eql(exception);
          expect(result.exception).to.not.equal(exception); // it must be copy, don't share the array
          // TODO consider adding getter that slices
        }
      });
      it("adheres to the invariants", function() {
        invariants(result);
      });
    }

    var constructorPreCases = [
      function() {return undefined;}
    ].concat(preCases);
    var constructorPostCases = [
      function() {return undefined;}
    ].concat(postCases);
    var constructorExceptionCases = [
      function() {return undefined;}
    ].concat(exceptionCases);

    constructorPreCases.forEach(function(pre) {
      constructorPostCases.forEach(function(post) {
        constructorExceptionCases.forEach(function(exception) {
          describe("works for pre: " + pre + ", post: " + post + ", exception: " + exception, function() {
            var preConditions = pre();
            var postConditions = post();
            var exceptionConditions = exception();
            var result = new Contract(preConditions, postConditions, exceptionConditions);
            expectPost(preConditions, postConditions, exceptionConditions, result);
          });
        });
      });
    });
  });

  describe("#isImplementedBy()", function() {
    it("says no if the argument is not a contract function", function() {
      thingsThatAreNotAFunctionNorAContract
        .concat(["function() {}"])
        .forEach(function(thing) {
          var subject = new Contract();
          //noinspection BadExpressionStatementJS
          expect(subject.isImplementedBy(thing)).not.to.be.ok;
          invariants(subject);
        });
    });
    it("says no if the argument is a contract function for another contract", function() {
      var subject = new Contract();
      var f = function() {};
      f.contract = new Contract();
      f.implementation = function() {};
      //noinspection BadExpressionStatementJS
      expect(subject.isImplementedBy(f)).not.to.be.ok;
      invariants(subject);
    });
    it("says yes if the argument is a contract function for the contract", function() {
      var subject = new Contract();
      var f = function() {};
      f.contract = subject;
      f.implementation = function() {};
      //noinspection BadExpressionStatementJS
      expect(subject.isImplementedBy(f)).to.be.ok;
      invariants(subject);
    });
  });

  describe("#verifyOne()", function() {
    function expectPost(subject, condition, self, args, appliedSelf, appliedArgs, exception) {
      var outcome;
      try {
        outcome = condition.apply();
      }
      catch (err) {
        it("should throw a ContractConditionMetaError because the condition had an error", function(){
          //noinspection BadExpressionStatementJS
          expect(exception).to.be.ok;
          expect(exception).to.be.instanceOf(ContractConditionMetaError);
          expect(exception.error).to.eql(err);
          expect(exception.condition).to.equal(condition);
          expect(exception.self).to.equal(self);
          expect(exception.args).to.eql(args);
        });
        return;
      }
      it("should have called the condition with the given this", function() {
        expect(appliedSelf).to.equal(self);
      });
      it("should have called the condition with the given arguments", function() {
        //noinspection BadExpressionStatementJS
        expect(appliedArgs).to.be.ok;
        //noinspection JSAnnotator,BadExpressionStatementJS
        expect(appliedArgs).to.be.arguments;
        if (!args) {
          //noinspection BadExpressionStatementJS
          expect(appliedArgs).to.be.empty;
        }
        else {
          expect(appliedArgs).to.have.lengthOf(args.length);
          for (var i = 0; i < args.length; i++) {
            expect(appliedArgs[i]).to.equal(args[i]);
          }
        }
      });
      it("should throw an exception when the condition and evaluates to false, and not otherwise, " +
         "because the condition ended nominally",
        function() {
          expect(!exception).to.equal(!!outcome);
        }
      );
      if (!outcome) {
        it("should throw a ContractConditionViolation that is correctly configured, " +
           "because the condition evaluated to false nominally",
          function() {
            //noinspection BadExpressionStatementJS
            expect(exception).to.be.ok;
            expect(exception).to.be.instanceOf(ContractConditionViolation);
            expect(exception.condition).to.equal(condition);
            expect(exception.self).to.equal(self);
            expect(exception.args).to.eql(args);
          }
        );
      }
      else {
        it("should not throw an exception, because the condition evaluated to true nominally", function() {
          //noinspection BadExpressionStatementJS
          expect(exception).to.not.be.ok;
        });
      }
      it("adheres to the invariants", function() {
        invariants(subject);
      });
    }

    var conditionCases = [
      function() {
        return function f() {
          f.self = this;
          f.args = arguments;
          // no return
        };
      },
      function() {
        return function f() {
          f.self = this;
          f.args = arguments;
          return false;
        };
      },
      function() {
        return function f() {
          f.self = this;
          f.args = arguments;
          return true;
        };
      },
      function() {
        return function f() {
          f.self = this;
          f.args = arguments;
          throw "This condition fails with an error";
        };
      }
    ];

    subjects.forEach(function(subjectGenerator) {
      conditionCases.forEach(function(conditionGenerator) {
        selfCases.forEach(function(selfGenerator) {
          argsCases.forEach(function(argGenerator) {
            var subject = subjectGenerator();
            var condition = conditionGenerator();
            var self = selfGenerator();
            var args = argGenerator();
            describe("works for " + subject + " - " + condition + " - " + self + " - " + args, function() {
              var exception;
              try {
                subject.verifyOne(condition, self, args);
              }
              catch (exc) {
                exception = exc;
              }
              expectPost(subject, condition, self, args, condition.self, condition.args, exception);
            });
          });
        });
      });
    });
  });

  describe("#verifyAll()", function() {
    function expectPost(subject, conditions, self, args, exception) {
      if (!conditions || conditions.length <= 0) {
        it("doesn't throw an exception if there are no conditions", function() {
          //noinspection BadExpressionStatementJS
          expect(exception).not.to.be.ok;
        });
        return;
      }
      var selfAndArgs = conditions.map(function(condition) {
        // save self and args, because in our determination of firstFailure, they will be overwritten
        return {self: condition.self, args: condition.args};
      });
      var firstFailure;
      var firstFailureIndex;
      var thrown;
      for (var i = 0; !firstFailure && i < conditions.length; i++) {
        try {
          var outcome = conditions[i].apply();
          if (!outcome) {
            firstFailure = conditions[i];
            firstFailureIndex = i;
          }
        }
        catch (err) {
          firstFailure = conditions[i];
          firstFailureIndex = i;
          thrown = err;
        }
      }
      it("throws an exception if one of the conditions fails or evaluates nominally to false", function() {
        expect(!!exception).to.equal(!!firstFailure);
      });
      if (thrown) {
        it("throws a ContractConditionMetaError if one of the conditions fails", function() {
          expect(exception).to.be.instanceOf(ContractConditionMetaError);
          expect(exception.condition).to.equal(firstFailure);
        });
      }
      else if (firstFailure) {
        it("throws a ContractConditionViolation if one of the conditions evaluates nominally to false", function() {
          expect(exception).to.be.instanceOf(ContractConditionViolation);
          expect(exception.condition).to.equal(firstFailure);
        });
      }
      else {
        it("ends nominally if all conditions evaluate nominally to true", function() {
          //noinspection BadExpressionStatementJS
          expect(exception).not.to.be.ok;
        });
      }
      it("evaluates all conditions up until the first failure with the given self and arguments", function() {
        for (var j = 0; j <= firstFailureIndex; j++) {
          expect(selfAndArgs[j].self).to.equal(self);
          var appliedArgs = selfAndArgs[j].args;
          //noinspection BadExpressionStatementJS
          expect(appliedArgs).to.be.ok;
          //noinspection JSAnnotator,BadExpressionStatementJS
          expect(appliedArgs).to.be.arguments;
          if (!args) {
            //noinspection BadExpressionStatementJS
            expect(appliedArgs).to.be.empty;
          }
          else {
            expect(appliedArgs).to.have.lengthOf(args.length);
            for (var i = 0; i < args.length; i++) {
              expect(appliedArgs[i]).to.equal(args[i]);
            }
          }
        }
      });
      it("does not evaluate conditions after the first failure", function() {
        for (var j = firstFailureIndex + 1; j < conditions.length; j++) {
          //noinspection BadExpressionStatementJS
          expect(selfAndArgs[j].self).not.to.be.ok;
          //noinspection BadExpressionStatementJS
          expect(selfAndArgs[j].args).not.to.be.ok;
        }
      });
      it("adheres to the invariants", function() {
        invariants(subject);
      });
    }

    var conditionsCases = [
      function() {return undefined;},
      function() {return null;},
      function() {return [];},
      function() {return [];},
      function() {return [
        function f() {
          f.self = this;
          f.args = arguments;
          return false;
        }
      ];},
      function() {return [
        function f() {
          f.self = this;
          f.args = arguments;
          return true;
        }
      ];},
      function() {return [
        function f() {
          f.self = this;
          f.args = arguments;
          return {};
        }
      ];},
      function() {return [
        function f1() {
          f1.self = this;
          f1.args = arguments;
          return true;
        },
        function f2() {
          f2.self = this;
          f2.args = arguments;
          return true;
        }
      ];},
      function() {return [
        function f1() {
          f1.self = this;
          f1.args = arguments;
          return true;
        },
        function f2() {
          f2.self = this;
          f2.args = arguments;
          return false;
        },
        function f3() {
          f3.self = this;
          f3.args = arguments;
          return true;
        }
      ];},
      function() {return [
        function f1() {
          f1.self = this;
          f1.args = arguments;
          return true;
        },
        function f3() {
          f3.self = this;
          f3.args = arguments;
          throw "This condition fails with an error";
        },
        function f3() {
          f3.self = this;
          f3.args = arguments;
          return true;
        }
      ];}
    ];

    subjects.forEach(function(subjectGenerator) {
      conditionsCases.forEach(function(conditionsGenerator) {
        selfCases.forEach(function(selfGenerator) {
          argsCases.forEach(function(argGenerator) {
            var subject = subjectGenerator();
            var conditions = conditionsGenerator();
            var self = selfGenerator();
            var args = argGenerator();
            describe("works for " + subject + " - " + conditions + " - " + self + " - " + args, function() {
              var exception;
              try {
                subject.verifyAll(conditions, self, args);
              }
              catch (exc) {
                exception = exc;
              }
              expectPost(subject, conditions, self, args, exception);
            });
          });
        });
      });
    });
  });

  describe("#implementation", function() {
    function expectPost(contract, result) {
      //noinspection BadExpressionStatementJS
      expect(contract.isImplementedBy(result)).to.be.ok;
      invariants(contract);
    }

    var fibonacci = new Contract(
      [
        function(n) {return Number.isInteger(n);},
        function(n) {return 0 <= n;}
      ],
      [
        function(n, result) {return n !== 0 || result === 0;},
        function(n, result) {return n !== 1 || result === 1;},
        function(n, result) {return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);}
        // MUDO wrong: don't talk about a specific implementation in the contract!
      ]
    ).implementation(function(n) {
      return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
    });

    var wrongParameter = 4;
    var wrongResult = -3;

    var fibonacciWrong = fibonacci.contract.implementation(function(n) {
      if (n === 0) {
        return 0;
      }
      else if (n === 1) {
        return 1;
      }
      else if (n === 4) {
        return -3; // wrong!
      }
      else {
        return fibonacciWrong(n - 1) + fibonacciWrong(n - 2);
      }
    });

    var factorialContract = new Contract(
      [
        function(n) {return Number.isInteger(n);},
        function(n) {return 0 <= n;}
      ],
      [
        function(n, result) {return n !== 0 || result === 1;},
        function(n, result) {return n < 1 || result === n * factorial(n - 1);}
      ]
    );

    var factorial = factorialContract.implementation(function(n) {
      if (n <= 0) {
        return 1;
      }
      else {
        return n * factorial(n - 1);
      }
    });

    var factorialIterative = factorialContract.implementation(function(n) {
      if (n === 8) {
        return -3; // wrong!
      }
      var result = 1;
      var next = 1;
      while (next <= n) {
        result *= next;
        next++;
      }
      return result;
    });

    function failsOnPreconditionViolation(parameter, violatedCondition) {
      it("fails when a precondition is violated - " + parameter, function() {
        try {
          var result = fibonacci(parameter);
          throw "Should not have succeeded.";
        }
        catch (exception) {
          //noinspection BadExpressionStatementJS
          expect(exception).to.be.ok;
          expect(exception.condition).to.equal(violatedCondition);
          //noinspection BadExpressionStatementJS
          expect(exception.self).not.to.be.ok;
          expect(exception.args[0]).to.equal(parameter);
        }
      });
    }

    it("returns a contract function that implements the contract", function() {
      var subject = new Contract();
      expectPost(subject, subject.implementation(function() {}));
    });
    it("doesn't interfere when the implementation is correct", function() {
      var result = fibonacci(5); // any exception will fail the test
    });
    it("doesn't interfere when the implementation is correct too", function() {
      var result = factorial(5); // any exception will fail the test
    });
    it("can deal with alternative implementations", function() {
      var result = factorialIterative(5); // any exception will fail the test
    });
    failsOnPreconditionViolation(undefined, fibonacci.contract.pre[0]);
    failsOnPreconditionViolation(null, fibonacci.contract.pre[0]);
    failsOnPreconditionViolation("lala", fibonacci.contract.pre[0]);
    failsOnPreconditionViolation(-5, fibonacci.contract.pre[1]);
    // MUDO fails with meta error on pre error
    // MUDO fails with meta error on post error
    it("fails when a simple postcondition is violated", function() {
      try {
        var result = fibonacciWrong(wrongParameter);
        throw "Should not have succeeded.";
      }
      catch (exception) {
        //noinspection BadExpressionStatementJS
        expect(exception).to.be.ok;
        expect(exception.condition).to.equal(fibonacciWrong.contract.post[2]);
        //noinspection BadExpressionStatementJS
        expect(exception.self).not.to.be.ok;
        expect(exception.args[0]).to.equal(wrongParameter);
        expect(exception.args[1]).to.equal(wrongResult);
      }
    });
    it("fails when a postcondition is violated in a called function with a nested Violation", function() {
      function expectViolation(exc, parameter) {
        //noinspection BadExpressionStatementJS
        expect(exc).to.be.ok;
        expect(exc).to.be.an.instanceOf(ContractConditionViolation);
        if (parameter === wrongParameter) {
          expect(exc.condition).to.equal(fibonacciWrong.contract.post[2]);
          //noinspection BadExpressionStatementJS
          expect(exc.self).not.to.be.ok;
          expect(exc.args[0]).to.equal(parameter);
          expect(exc.args[1]).to.equal(wrongResult);
        }
        else {
          expect(exc.condition).to.equal(fibonacciWrong.contract.exception[0]);
          //noinspection BadExpressionStatementJS
          expect(exc.self).not.to.be.ok;
          expect(exc.args[0]).to.equal(parameter);
          expectViolation(exc.args[1], parameter - 1);
        }
      }

      var parameter = 6;
      try {
        var result = fibonacciWrong(parameter);
        throw "Should not have succeeded.";
      }
      catch(exception) {
        expectViolation(exception, parameter);
      }
    });
  });
});
