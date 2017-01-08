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

(function() {
  "use strict";

  var expect = require("chai").expect;
  var common = require("./ImplementableContractCommon");
  var util = require("../../src/_private/util");
  var testUtil = require("../_testUtil");
  var ImplementableContract = require("../../src/I/ImplementableContract");
  var Contract = require("../../src/I/Contract");
  var ConditionMetaError = require("../../src/I/ConditionMetaError");
  var ConditionViolation = require("../../src/I/ConditionViolation");
  var PreconditionViolation = require("../../src/I/PreconditionViolation");
  var conditionMetaErrorCommon = require("./ConditionMetaErrorCommon");
  var conditionViolationCommon = require("./ConditionViolationCommon");
  var preconditionViolationCommon = require("./PreconditionViolationCommon");

  function expectInvariants(subject) {
    expect(subject).to.be.an.instanceOf(ImplementableContract);
    common.expectInvariants(subject);
    expect(subject).to.have.property("implementation").that.is.a("function");
  }

  // describe("I", function() {
    describe("I/ImplementableContract", function() {

      var subjects = testUtil
        .x(common.preCases, common.postCases, common.exceptionCases)
        .map(function(args) {
          return function() {return new ImplementableContract(args[0](), args[1](), args[2]());};
        });

      describe("#ImplementableContract()", function() {
        common.constructorPreCases.forEach(function(pre) {
          common.constructorPostCases.forEach(function(post) {
            common.constructorExceptionCases.forEach(function(exception) {
              describe("works for pre: " + pre + ", post: " + post + ", exception: " + exception, function() {
                var preConditions = pre();
                var postConditions = post();
                var exceptionConditions = exception();
                var result = new ImplementableContract(preConditions, postConditions, exceptionConditions);
                common.expectConstructorPost(preConditions, postConditions, exceptionConditions, result);
              });
            });
          });
        });
      });

      //noinspection FunctionTooLongJS
      describe("#implementation", function() {
        function expectPost(ImplementableContract, result) {
          //noinspection BadExpressionStatementJS
          expect(ImplementableContract.isImplementedBy(result)).to.be.ok;
          //noinspection JSUnresolvedVariable,BadExpressionStatementJS
          expect(ImplementableContract).to.be.frozen;
          expectInvariants(ImplementableContract);
        }

        function fibonacciImpl(n) {
          return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
        }

        var fibonacci = new ImplementableContract(
          [
            function(n) {return util.isInteger(n);},
            function(n) {return 0 <= n;}
          ],
          [
            function(n, result) {return util.isInteger(result);},
            function(n, result) {return n !== 0 || result === 0;},
            function(n, result) {return n !== 1 || result === 1;},
            function(n, result, fibonacci) {
              // Note: don't refer to a specific implementation ("fibonacci") in the ImplementableContract!
              return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);
            }
          ],
          [
            function() {return false;}
          ]
        ).implementation(fibonacciImpl);

        it("returns a different ImplementableContract function when called with the same implementation", function() {
          var fibonacci2 = fibonacci.contract.implementation(fibonacciImpl);
          expect(fibonacci2).to.not.equal(fibonacci);
          expect(fibonacci2).to.have.property("contract").that.equals(fibonacci.contract);
          expect(fibonacci2).to.have.property("implementation").that.equals(fibonacci.implementation);
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

        it("returns a different ImplementableContract function with a different implementation", function() {
          expect(fibonacciWrong).to.not.equal(fibonacci);
          expect(fibonacciWrong).to.have.property("contract").that.equals(fibonacci.contract);
          expect(fibonacciWrong).to.have.property("implementation").that.not.equals(fibonacci.implementation);
        });

        var factorialContract = new ImplementableContract(
          [
            function(n) {return util.isInteger(n);},
            function(n) {return 0 <= n;}
          ],
          [
            function(n, result) {return util.isInteger(result);},
            function(n, result) {return n !== 0 || result === 1;},
            function(n, result) {
              function f(n) {return n < 1 ? 1 : n * f(n - 1);}

              // Note: don't refer to a specific implementation in the ImplementableContract!

              return n < 1 || result === f(n);
            }
          ],
          [
            function() {return false;}
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

        var resultWhenMetaError = "This is the result or exception when we get a meta error";

        function callAndExpectException(self, func, parameter, expectException) {
          var result;
          var endsNominally = false;
          try {
            if (!self) {
              result = func(parameter);
            }
            else {
              result = func.call(self, parameter);
            }
            endsNominally = true;
          }
          catch (exception) {
            //noinspection BadExpressionStatementJS
            expect(exception).to.be.ok;
            var common = exception instanceof ConditionMetaError ? conditionMetaErrorCommon :
                         exception instanceof PreconditionViolation ? preconditionViolationCommon :
                         exception instanceof ConditionViolation ? conditionViolationCommon :
                         null;
            common.expectInvariants(exception);
            expectException(exception);
          }
          if (endsNominally) {
            throw "Method ended nominally with result " + result + ", but expected an exception.";
          }
        }

        function failsOnPreconditionViolation(self, func, parameter, violatedCondition) {
          it("fails when a precondition is violated - " + self + " - " + parameter, function() {
            callAndExpectException(self, func, parameter, function(exception) {
              expect(exception).to.be.an.instanceOf(ConditionViolation);
              expect(exception.condition).to.equal(violatedCondition);
              if (!self) {
                //noinspection BadExpressionStatementJS
                expect(exception.self).not.to.be.ok;
              }
              else {
                expect(exception.self).to.equal(self);
              }
              expect(exception.args[0]).to.equal(parameter);
              testUtil.log("exception.stack: %s", exception.stack);
            });
          });
        }

        function failsOnMetaError(self, functionWithAMetaError, conditionWithAMetaError, extraArgs) {
          var param = "a parameter";
          callAndExpectException(self, functionWithAMetaError, param, function(exception) {
            expect(exception).to.be.an.instanceOf(ConditionMetaError);
            expect(exception.condition).to.equal(conditionWithAMetaError);
            //noinspection BadExpressionStatementJS
            if (!self) {
              //noinspection BadExpressionStatementJS
              expect(exception.self).not.to.be.ok;
            }
            else {
              expect(exception.self).to.equal(self);
            }
            expect(exception.args.length).to.equal(extraArgs ? extraArgs.length + 1 : 1);
            expect(exception.args[0]).to.equal(param);
            if (extraArgs) {
              expect(exception.args[1]).to.equal(extraArgs[0]);
              expect(exception.args[2]).to.satisfy(function(f) {return Contract.isAContractFunction(f);});
              // MUDO we actually don't want the extraArgs in the exception, do we? That is confusing. We want separate properties
            }
            expect(exception.error).to.equal(intentionalError);
            testUtil.log("exception.stack: %s", exception.stack);
          });
        }

        function expectDeepViolation(self, exc, parameter) {
          //noinspection BadExpressionStatementJS
          expect(exc).to.be.ok;
          expect(exc).to.be.an.instanceOf(ConditionViolation);
          expect(exc.args[0]).to.equal(wrongParameter);
          //noinspection BadExpressionStatementJS
          if (!self) {
            //noinspection BadExpressionStatementJS
            expect(exc.self).not.to.be.ok;
          }
          else {
            expect(exc.self).to.equal(self);
          }
          expect(exc.condition).to.equal(fibonacciWrong.contract.post[3]);
        }

        var argumentsOfWrongType = [undefined, null, "bar"];
        var self = {
          aProperty: "a property value",
          fibonacci: fibonacci.contract.implementation(function(n) {
            return n <= 1 ? n : this.fibonacci(n - 1) + this.fibonacci(n - 2);
          }),
          fibonacciWrong: fibonacci.contract.implementation(function(n) {
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
              return this.fibonacciWrong(n - 1) + this.fibonacciWrong(n - 2);
            }
          })
        };

        var intentionalError = new Error("This precondition intentionally fails.");

        var contractWithAFailingPre = new ImplementableContract(
          [function() {throw intentionalError;}]
        );

        it("returns a ImplementableContract function that implements the ImplementableContract, which is frozen", function() {
          var subject = new ImplementableContract();
          expectPost(subject, subject.implementation(function() {}));
        });
        it("doesn't interfere when the implementation is correct", function() {
          var ignore = fibonacci(5); // any exception will fail the test
        });
        it("doesn't interfere when the implementation is correct too", function() {
          var ignore = factorial(5); // any exception will fail the test
        });
        it("can deal with alternative implementations", function() {
          var ignore = factorialIterative(5); // any exception will fail the test
        });
        it("works with a method that is correct", function() {
          var ignore = self.fibonacci(5); // any exception will fail the test
        });
        argumentsOfWrongType.forEach(function(wrongArg) {
          failsOnPreconditionViolation(undefined, fibonacci, wrongArg, fibonacci.contract.pre[0]);
        });
        failsOnPreconditionViolation(undefined, fibonacci, -5, fibonacci.contract.pre[1]);
        argumentsOfWrongType.forEach(function(wrongArg) {
          failsOnPreconditionViolation(self, self.fibonacci, wrongArg, fibonacci.contract.pre[0]);
        });
        failsOnPreconditionViolation(self, self.fibonacci, -5, fibonacci.contract.pre[1]);
        it("fails with a meta-error when a precondition is kaput", function() {
          failsOnMetaError(
            undefined,
            contractWithAFailingPre.implementation(function() {return resultWhenMetaError;}),
            contractWithAFailingPre.pre[0]
          );
        });
        it("fails with a meta-error when a precondition is kaput when it is a method", function() {
          var self = {
            method: contractWithAFailingPre.implementation(function() {return resultWhenMetaError;})
          };

          failsOnMetaError(
            self,
            self.method,
            contractWithAFailingPre.pre[0]
          );
        });
        it("fails with a meta-error when a postcondition is kaput", function() {
          var contractWithAFailingPost = new ImplementableContract(
            [],
            [function() {throw intentionalError;}]
          );

          var implementation = contractWithAFailingPost.implementation(function() {return resultWhenMetaError;});
          failsOnMetaError(
            undefined,
            implementation,
            contractWithAFailingPost.post[0],
            [resultWhenMetaError, implementation]
          );
        });
        it("fails with a meta-error when a postcondition is kaput when it is a method", function() {
          var contractWithAFailingPost = new ImplementableContract(
            [],
            [function() {throw intentionalError;}]
          );
          var self = {
            method: contractWithAFailingPost.implementation(function() {return resultWhenMetaError;})
          };

          failsOnMetaError(
            self,
            self.method,
            contractWithAFailingPost.post[0],
            [resultWhenMetaError, self.method.bind(self)]
          );
        });
        it("fails with a meta-error when an exception condition is kaput", function() {
          var contractWithAFailingExceptionCondition = new ImplementableContract(
            [],
            [],
            [function() {throw intentionalError;}]
          );
          var anExceptedException = "This exception is expected.";
          var implementation = contractWithAFailingExceptionCondition.implementation(function() {throw anExceptedException;});
          failsOnMetaError(
            undefined,
            implementation,
            contractWithAFailingExceptionCondition.exception[0],
            [anExceptedException, implementation]
          );
        });
        it("fails with a meta-error when an exception condition is kaput when it is a method", function() {
          var contractWithAFailingExceptionCondition = new ImplementableContract(
            [],
            [],
            [function() {throw intentionalError;}]
          );
          var anExceptedException = "This exception is expected.";
          var self = {
            method: contractWithAFailingExceptionCondition.implementation(function() {throw anExceptedException;})
          };

          failsOnMetaError(
            self,
            self.method,
            contractWithAFailingExceptionCondition.exception[0],
            [anExceptedException, self.method.bind(self)]
          );
        });
        it("fails when a simple postcondition is violated", function() {
          callAndExpectException(undefined, fibonacciWrong, wrongParameter, function(exception) {
            expect(exception).to.be.an.instanceOf(ConditionViolation);
            expect(exception.condition).to.equal(fibonacciWrong.contract.post[3]);
            //noinspection BadExpressionStatementJS
            expect(exception.self).not.to.be.ok;
            expect(exception.args[0]).to.equal(wrongParameter);
            expect(exception.args[1]).to.equal(wrongResult);
            testUtil.log("exception.stack: %s", exception.stack);
          });
        });
        it("fails when a simple postcondition is violated when it is a method", function() {
          callAndExpectException(self, self.fibonacciWrong, wrongParameter, function(exception) {
            expect(exception).to.be.an.instanceOf(ConditionViolation);
            expect(exception.condition).to.equal(fibonacciWrong.contract.post[3]);
            //noinspection BadExpressionStatementJS
            expect(exception.self).to.equal(self);
            expect(exception.args[0]).to.equal(wrongParameter);
            expect(exception.args[1]).to.equal(wrongResult);
            testUtil.log("exception.stack: %s", exception.stack);
          });
        });
        it("fails when a postcondition is violated in a called function with a nested Violation", function() {
          var parameter = 6;
          callAndExpectException(undefined, fibonacciWrong, parameter, function(exception) {
            expectDeepViolation(undefined, exception, parameter);
            testUtil.log("exception.stack: %s", exception.stack);
          });
        });
        it("fails when a postcondition is violated in a called function with a nested Violation when it is a method", function() {
          var parameter = 6;
          callAndExpectException(self, self.fibonacciWrong, parameter, function(exception) {
            expectDeepViolation(self, exception, parameter);
            testUtil.log("exception.stack: %s", exception.stack);
          });
        });

        /* Uncomment to demonstrate what happens when a ImplementableContract fails: */
        // self.fibonacci(undefined);
        // self.fibonacci(-5);
        // self.fibonacciWrong(wrongParameter);
        // self.fibonacciWrong(5);
        // contractWithAFailingPre.implementation(function() {return resultWhenMetaError;})(1);
      });
    });
  // });

})();
