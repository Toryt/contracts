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
                      "𝕋合同/_private/util", "𝕋合同/I/Contract", "𝕋合同/I/AbstractContract", "𝕋合同/I/ConditionMetaError",
                      "𝕋合同/I/PreconditionViolation", "𝕋合同/I/PostconditionViolation",
                      "𝕋合同/I/ExceptionConditionViolation",
                      "./ConditionMetaErrorCommon", "./PreconditionViolationCommon", "./PostconditionViolationCommon",
                      "./ExceptionConditionViolationCommon"];

  if (typeof define === 'function' && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports =
      factory.apply(undefined, dependencies.map(function(d) {return require(d.replace("𝕋合同", "../../src"));}));
  }
}(function(describe, it, expect, testUtil, util,
           Contract, AbstractContract, ConditionMetaError,
           PreconditionViolation, PostconditionViolation, ExceptionConditionViolation,
           conditionMetaErrorCommon, preconditionViolationCommon, postconditionViolationCommon,
           exceptionConditionViolationCommon) {
  "use strict";

  /* This test is not included in Contract.generatePrototypeMethodsDescriptions, because it is
     specific for ContractFunction: we test extensively whether the contract function works as expected here.
     This tests the behavior of the resulting contract function. The tests in
     Contract.generatePrototypeMethodsDescriptions tests the state postconditions only. */

  // describe("I", function() {
    //noinspection FunctionTooLongJS
    describe("I/ContractFunction", function() {

      function fibonacciImpl(n) {
        return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
      }

      var fibonacci = new Contract({
        pre: [
          function(n) {return util.isInteger(n);},
          function(n) {return 0 <= n;}
        ],
        post: [
          function(n, result) {return util.isInteger(result);},
          function(n, result) {return n !== 0 || result === 0;},
          function(n, result) {return n !== 1 || result === 1;},
          function(n, result, fibonacci) {
            // don't refer to a specific implementation ("fibonacci") in the Contract!
            return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);
          }
        ],
        exception: [
          function() {return false;}
        ]
      }).implementation(fibonacciImpl);

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

      var factorialContract = new Contract({
        pre: [
          function(n) {return util.isInteger(n);},
          function(n) {return 0 <= n;}
        ],
        post: [
          function(n, result) {return util.isInteger(result);},
          function(n, result) {return n !== 0 || result === 1;},
          function(n, result, f) {
            // don't refer to a specific implementation in the Contract!
            return n < 1 || result === n * f(n - 1);
          }
        ],
        exception: [
          function() {return false;}
        ]
      });

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

      var integerMessage = "n must be integer";
      var positiveMessage = "n must be positive";

      var defensiveIntegerSum = new Contract({
        post: [
          function(n, result) {return util.isInteger(result);},
          function(n, result) {return 0 <= result;},
          function(n, result) {return n !== 0 || result === 0;},
          function(n, result, sum) {return n === 0 || result === sum(n - 1) + n;}
        ],
        exception: [
          function(n, exc) {return !(exc instanceof Error) || exc.message !== positiveMessage || n < 0;},
          function(n, exc) {return !(exc instanceof Error) || exc.message !== integerMessage || !util.isInteger(n);}
        ]
      }).implementation(function(n) {
        if (!util.isInteger(n)) {throw new Error(integerMessage);}
        if (n < 0) {throw new Error(positiveMessage);}
        var count = 0;
        var result = 0;
        while (count < n) {
          count++;
          result += count;
        }
        return result;
      });

      var fastDefensiveIntegerSum = defensiveIntegerSum.contract.implementation(function(n) {
        if (!util.isInteger(n)) {throw new Error(integerMessage);}
        if (n < 0) {throw new Error(positiveMessage);}
        return (n * (n + 1)) / 2;
      });

      var wrongException = new Error(integerMessage); // will be thrown in error

      var fastDefensiveIntegerSumWrong = defensiveIntegerSum.contract.implementation(function(n) {
        if (util.isInteger(n)) {throw wrongException;} // wrong
        if (n < 0) {throw new Error(positiveMessage);}
        return (n * (n + 1)) / 2;
      });

      var negativeParameter = -10;
      var nonIntegerParameter = Math.PI;

      var resultWhenMetaError = "This is the result or exception when we get a meta error";

      function callAndExpectException(self, func, parameter, expectException) {
        var result;
        var endsNominally = false;
        try {
          if (!self) {
            //noinspection JSUnusedAssignment
            result = func(parameter);
          }
          else {
            //noinspection JSUnusedAssignment
            result = func.call(self, parameter);
          }
          endsNominally = true;
        }
        catch (exception) {
          //noinspection BadExpressionStatementJS
          expect(exception).to.be.ok;
          var common = exception instanceof ConditionMetaError ? conditionMetaErrorCommon :
                       exception instanceof PreconditionViolation ? preconditionViolationCommon :
                       exception instanceof PostconditionViolation ? postconditionViolationCommon :
                       exception instanceof ExceptionConditionViolation ? exceptionConditionViolationCommon :
                       null;
          common.expectInvariants(exception);
          expectException(exception);
          testUtil.showStack(exception);
        }
        //noinspection BadExpressionStatementJS
        expect(endsNominally).not.to.be.ok;
      }

      function failsOnPreconditionViolation(self, func, parameter, violatedCondition) {
        it("fails when a precondition is violated - " + self + " - " + parameter, function() {
          callAndExpectException(self, func, parameter, function(exception) {
            expect(exception).to.be.an.instanceOf(PreconditionViolation);
            expect(exception.condition).to.equal(violatedCondition);
            if (!self) {
              //noinspection BadExpressionStatementJS
              expect(exception.self).not.to.be.ok;
            }
            else {
              expect(exception.self).to.equal(self);
            }
            expect(exception.args[0]).to.equal(parameter);
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
            expect(exception.args[2]).to.satisfy(function(f) {return AbstractContract.isAContractFunction(f);});
          }
          expect(exception.error).to.equal(intentionalError);
        });
      }

      function expectPostProperties(self, contractFunction, exception) {
        postconditionViolationCommon.expectProperties(
          exception,
          PostconditionViolation,
          contractFunction,
          contractFunction.contract.post[3],
          self,
          [wrongParameter],
          wrongResult
        );
      }

      function expectExceptionProperties(self, contractFunction, exception) {
        exceptionConditionViolationCommon.expectProperties(
          exception,
          ExceptionConditionViolation,
          contractFunction,
          contractFunction.contract.exception[1], // integer was programmed wrong
          self,
          [wrongParameter],
          wrongException
        );
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
        }),
        factorial: factorial,
        defensiveIntegerSum: defensiveIntegerSum,
        fastDefensiveIntegerSum: fastDefensiveIntegerSum,
        fastDefensiveIntegerSumWrong: fastDefensiveIntegerSumWrong
      };

      var intentionalError = new Error("This precondition intentionally fails.");

      var contractWithAFailingPre = new Contract({
        pre: [function() {throw intentionalError;}]
      });

      it("doesn't interfere when the implementation is correct", function() {
        var ignore = fibonacci(5); // any exception will fail the test
      });
      it("doesn't interfere when the implementation is correct too", function() {
        var ignore = factorial(5); // any exception will fail the test
      });
      it("doesn't interfere when the implementation is correct three", function() {
        //noinspection MagicNumberJS
        var ignore = defensiveIntegerSum(100); // any exception will fail the test
      });
      it("can deal with alternative implementations", function() {
        var ignore = factorialIterative(5); // any exception will fail the test
      });
      it("works with a method that is correct", function() {
        var ignore = self.fibonacci(5); // any exception will fail the test
      });
      it("works with a method that is correct too", function() {
        var ignore = self.factorial(5); // any exception will fail the test
      });
      it("works with a method that is correct three", function() {
        var ignore = self.defensiveIntegerSum(5); // any exception will fail the test
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
        var contractWithAFailingPost = new Contract({
          post: [function() {throw intentionalError;}]
        });

        var implementation = contractWithAFailingPost.implementation(function() {return resultWhenMetaError;});
        failsOnMetaError(
          undefined,
          implementation,
          contractWithAFailingPost.post[0],
          [resultWhenMetaError, implementation]
        );
      });
      it("fails with a meta-error when a postcondition is kaput when it is a method", function() {
        var contractWithAFailingPost = new Contract({
          post: [function() {throw intentionalError;}]
        });
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
        var contractWithAFailingExceptionCondition = new Contract({
          exception: [function() {throw intentionalError;}]
        });
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
        var contractWithAFailingExceptionCondition = new Contract({
          exception: [function() {throw intentionalError;}]
        });
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
        callAndExpectException(undefined, fibonacciWrong, wrongParameter, expectPostProperties.bind(undefined, undefined, fibonacciWrong));
      });
      it("fails when a simple postcondition is violated when it is a method", function() {
        callAndExpectException(self, self.fibonacciWrong, wrongParameter, expectPostProperties.bind(undefined, self, self.fibonacciWrong));
      });
      it("fails when a postcondition is violated in a called function with a nested Violation", function() {
        var parameter = 6;
        callAndExpectException(undefined, fibonacciWrong, parameter, expectPostProperties.bind(undefined, undefined, fibonacciWrong));
      });
      it("fails when a postcondition is violated in a called function with a nested Violation when it is a method", function() {
        var parameter = 6;
        callAndExpectException(self, self.fibonacciWrong, parameter, expectPostProperties.bind(undefined, self, self.fibonacciWrong));
      });

      it("works with a defensive function", function() {
        expect(fastDefensiveIntegerSum.bind(undefined, negativeParameter)).to.throw(Error, positiveMessage);
      });
      it("works with a defensive method", function() {
        expect(self.defensiveIntegerSum.bind(self, nonIntegerParameter)).to.throw(Error, integerMessage);
      });

      it("fails when a simple exception condition is violated", function() {
        callAndExpectException(
          undefined,
          fastDefensiveIntegerSumWrong,
          wrongParameter,
          expectExceptionProperties.bind(undefined, undefined, fastDefensiveIntegerSumWrong)
        );
      });
      it("fails when a simple exception condition is violated when it is a method", function() {
        callAndExpectException(
          self,
          self.fastDefensiveIntegerSumWrong,
          wrongParameter,
          expectExceptionProperties.bind(undefined, self, self.fastDefensiveIntegerSumWrong)
        );
      });

    });
  // });

}));
