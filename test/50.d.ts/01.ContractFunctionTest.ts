/*
 Copyright 2016 - 2020 by Jan Dockx

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

/* eslint-env mocha */

import {
  Precondition,
  Condition,
  ContractFunction,
  AbstractContract,
  ConditionError,
  ConditionMetaError,
  PreconditionViolation,
  PostconditionViolation,
  ExceptionConditionViolation,
  Contract
} from "../../lib";
import * as should from "should";
import { environment, showStack, log } from "../_util/testUtil";
import { frozenDerived } from "../../lib/_private/property";
import { stack as stackEOL }  from "../../lib/_private/eol";
import * as conditionMetaErrorCommon from "../ConditionMetaErrorCommon";
import * as preconditionViolationCommon from "../PreconditionViolationCommon";
import * as postconditionViolationCommon from "../PostconditionViolationCommon";
import * as exceptionConditionViolationCommon from "../ExceptionConditionViolationCommon";
import { intentionalError } from "../_cases";

/* This test is not included in Contract.generatePrototypeMethodsDescriptions, because it is
     specific for ContractFunction: we test extensively whether the contract function works as expected here.
     This tests the behavior of the resulting contract function. The tests in
     Contract.generatePrototypeMethodsDescriptions tests the state postconditions only. */

function consume(a: any): void {
  JSON.stringify(a);
}

function intentionallyFailingFunction (): boolean {
  throw intentionalError;
}


// noinspection FunctionTooLongJS
describe('ContractFunction', function () {
  function fibonacciImpl (this: void, n: number): number {
    return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
  }

  const fibonacci: ContractFunction<(this: void, n: number) => number, undefined, undefined> =
    new Contract<(this: void, n: number) => number, undefined>({
      pre: [
        function (this: void, n: number): boolean {
          return Number.isInteger(n);
        },
        function (this: void, n: number): boolean {
          return n >= 0;
        }
      ],
      post: [
        function (this: void, _n: number, result: number): boolean {
          return Number.isInteger(result);
        },
        function (this: void, n: number, result: number): boolean {
          return n !== 0 || result === 0;
        },
        function (this: void, n: number, result: number): boolean {
          return n !== 1 || result === 1;
        },
        function (this: void, n: number, result: number, fibonacci: ContractFunction<(this: void, n: number) => number, undefined, undefined>) {
          // don't refer to a specific implementation ("fibonacci") in the Contract!
          return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);
        }
      ],
      exception: Contract.mustNotHappen
    }).implementation(fibonacciImpl);

  const wrongParameter: number = 4;
  const wrongResult: number = -3;

  const fibonacciWrong: ContractFunction<(this: void, n: number) => number, undefined, undefined> =
    fibonacci.contract.implementation(function fWrong (this: void, n: number): number {
      // noinspection IfStatementWithTooManyBranchesJS
      if (n === 0) {
        return 0;
      } else if (n === 1) {
        return 1;
      } else if (n === 4) {
        return -3; // wrong!
      } else {
        return fibonacciWrong(n - 1) + fibonacciWrong(n - 2);
      }
    });

  const factorialContract: Contract<(this: void, n: number) => number, undefined> =
    new Contract<(this: void, n: number) => number, undefined>({
      pre: [
        function (this: void, n: number): boolean {
          return Number.isInteger(n);
        },
        function (this: void, n: number): boolean {
          return n >= 0;
        }
      ],
      post: [
        function (this: void, _n: number, result: number): boolean {
          return Number.isInteger(result);
        },
        function (this: void, n: number, result: number): boolean {
          return n !== 0 || result === 1;
        },
        function (this: void, n: number, result: number, f: ContractFunction<(this: void, n: number) => number, undefined, undefined>): boolean {
          // don't refer to a specific implementation in the Contract!
          return n < 1 || result === n * f(n - 1);
        }
      ],
      exception: Contract.mustNotHappen
    });

  // noinspection JSUnresolvedFunction
  const factorial: ContractFunction<(this: void, n: number) => number, undefined, undefined> =
    factorialContract.implementation(function (this: void, n: number): number {
      if (n <= 0) {
        return 1;
      } else {
        return n * factorial(n - 1);
      }
    });

  // noinspection JSUnresolvedFunction
  const factorialIterative: ContractFunction<(this: void, n: number) => number, undefined, undefined> =
    factorialContract.implementation(function (this: void, n: number): number {
      if (n === 8) {
        return -3; // wrong!
      }
      let result: number = 1;
      let next: number = 1;
      while (next <= n) {
        result *= next;
        next++;
      }
      return result;
    });

  const integerMessage: string = 'n must be integer';
  const positiveMessage:string  = 'n must be positive';

  // noinspection JSUnresolvedFunction
  const defensiveIntegerSum: ContractFunction<(this: void, n: number) => number, Error, undefined> =
    new Contract<(this: void, n: number) => number, Error>({
      post: [
        function (this: void, _n: number, result: number): boolean {
          return Number.isInteger(result);
        },
        function (this: void, _n: number, result: number): boolean {
          return result >= 0;
        },
        function (this: void, n: number, result: number): boolean {
          return n !== 0 || result === 0;
        },
        function (this: void, n: number, result: number, sum: ContractFunction<(n: number) => number, Error, undefined>): boolean {
          return n === 0 || result === sum(n - 1) + n;
        }
      ],
      exception: [
        // function (this: void, _n: number, exc: Error): boolean {
        //   return exc instanceof Error;
        // },
        function (this: void, _n: number, exc: Error): boolean {
          return exc.message === positiveMessage || exc.message === integerMessage;
        },
        function (this: void, n: number, exc: Error): boolean {
          return exc.message !== positiveMessage || n < 0;
        },
        function (this: void, n: number, exc: Error): boolean {
          return exc.message !== integerMessage || !Number.isInteger(n);
        }
      ]
    }).implementation(function (this: void, n: number): number {
      if (!Number.isInteger(n)) {
        throw new Error(integerMessage);
      }
      if (n < 0) {
        throw new Error(positiveMessage);
      }
      let count: number = 0;
      let result: number = 0;
      while (count < n) {
        count++;
        result += count;
      }
      return result;
    });

  const fastDefensiveIntegerSum: ContractFunction<(this: void, n:number) => number, Error, undefined> =
    defensiveIntegerSum.contract.implementation(function (this: void, n: number): number {
      if (!Number.isInteger(n)) {
        throw new Error(integerMessage);
      }
      if (n < 0) {
        throw new Error(positiveMessage);
      }
      return (n * (n + 1)) / 2;
    });

  const wrongException: Error = new Error(integerMessage); // will be thrown in error

  const fastDefensiveIntegerSumWrong: ContractFunction<(this: void, n:number) => number, Error, undefined> =
    defensiveIntegerSum.contract.implementation(function (this: void, n: number): number {
      if (Number.isInteger(n)) {
        throw wrongException;
      } // wrong
      if (n < 0) {
        throw new Error(positiveMessage);
      }
      return (n * (n + 1)) / 2;
    });

  const negativeParameter: number = -10;
  const nonIntegerParameter: number = Math.PI;

  const resultWhenMetaError: string = 'This is the result or exception when we get a meta error';

  function callAndExpectException<O extends object | undefined, P extends any, R extends any, EXC extends Error> (
    self: O,
    func: (this: O, param: P) => R,
    parameter: P,
    expectException: (exc: ConditionError<
      (this: O, param: P) => R,
      EXC,
      undefined,
      Condition<(this: O, parameter: P) => R ,EXC, undefined>
    >) => void,
    recursive: boolean = false
  ): void {
    // eslint-disable-next-line no-unused-vars
    let endsNominally: boolean = false;
    try {
      const result: R = func.call(self, parameter);
      consume(result);
      endsNominally = true;
    } catch (exception: any) {
      exception.should.be.ok();

      interface Common {
        expectInvariants(exception: any): void
      }

      const common: Common | null =
        exception instanceof ConditionMetaError
          ? conditionMetaErrorCommon
          : /* prettier-ignore */ exception instanceof PreconditionViolation
            // resolves infighting between prettier and standard
            ? preconditionViolationCommon
            : exception instanceof PostconditionViolation
              ? postconditionViolationCommon
              : exception instanceof ExceptionConditionViolation
                ? exceptionConditionViolationCommon
                : null;
      should(common).be.ok();
      (common as Common).expectInvariants(exception);
      exception.message.should.containEql(func.name);
      const stack: string = exception.stack;
      stack.should.containEql(func.name);
      showStack(exception);
      expectException(exception);
      const stackLines: Array<string> = stack.split(stackEOL);
      const callStackLine: number = stackLines.indexOf('call stack:');
      callStackLine.should.be.greaterThanOrEqual(0);
      stackLines.splice(0, callStackLine + 1);
      stackLines.length.should.be.greaterThanOrEqual(1);
      // For post- and exception conditions, we expect the top of the stack trace to be the contract function (it is at
      // fault).  For preconditions, we expect the top of the stack trace to be where we called the contract function,
      // but then we have no report of the implementation that was called in the report. The top will point to the line
      // where the contract function was called, so we know it indirectly. For post- and exception condition, the line
      // to refer to would be inside the implementation. It would be the return statement, or the throw. This would be
      // important, because an implementation might have multiple exit points, and this would report which exit point
      // failed the contract. But we cannot create a stacktrace to that. We only can use our 'contractFunction' wrapper
      // for the stack trace, and it makes no sense to point inside, or to that internal function. So the best we can
      // do is to point to where the contract function is called. The same applies to Meta errors (in conditions),
      // since we cannot create a stack trace that points in the condition. The caused by probably will for meta errors,
      // but there is no such thing for pre-, post- or exception conditions.
      if (environment !== 'safari') {
        if (!recursive) {
          stackLines[0].should.containEql('callAndExpectException');
        } else {
          stackLines[0].should.containEql(recursive);
          stackLines[2].should.containEql(recursive);
          stackLines[4].should.containEql('callAndExpectException');
        }
      }
    }
    endsNominally.should.be.false();
  }

  function failsOnPreconditionViolation<O extends object | undefined, P extends any, R extends any> (
    self: O,
    func: (this: O, parameter:P) => R,
    parameter: P,
    violatedCondition: Precondition<(this: O, parameter:P) => R>
  ): void {
    it('fails when a precondition is violated - ' + self + ' - ' + parameter, function () {
      callAndExpectException(self, func, parameter, (exception/* TODO : PreconditionViolation<(this: O, parameter:P) => R, undefined, undefined>*/): void => {
        exception.should.be.an.instanceof(PreconditionViolation);
        // noinspection JSUnresolvedVariable
        exception.condition.should.equal(violatedCondition);
        if (!self) {
          should(exception.self).not.be.ok();
        } else {
          exception.self.should.equal(self);
        }
        should(exception.args[0]).equal(parameter);
      });
    });
  }

  const contractWithAFailingPre: Contract<(this: void) => void, undefined> = new Contract<(this: void) => void, undefined>({
    pre: [intentionallyFailingFunction]
  });

  function failsOnMetaError<O extends Object, R extends any> (
    self: O,
    functionWithAMetaError: (this: O, param: string) => R,
    conditionWithAMetaError: Condition<(this: O, param: string) => R, Error | undefined, Error | undefined>,
    extraArgs: Array<any>
  ): void {
    const param: string = 'a parameter';
    callAndExpectException(
      self,
      functionWithAMetaError,
      param,
      (exception: ConditionMetaError<(this: O, param: string) => R, undefined, undefined, Condition<(this: O, param: string) => R, Error | undefined, Error | undefined>>): void => {
        exception.should.be.an.instanceof(ConditionMetaError);
        // noinspection JSUnresolvedVariable
        exception.condition.should.equal(conditionWithAMetaError);
        if (!self) {
          should(exception.self).not.be.ok();
        } else {
          exception.self.should.equal(self);
        }
        exception.args.length.should.equal(extraArgs ? extraArgs.length + 1 : 1);
        exception.args[0].should.equal(param);
        if (extraArgs) {
          should(exception.args[1]).equal(extraArgs[0]);
          AbstractContract.isAContractFunction(exception.args[2]).should.be.true();
        }
        exception.error.should.equal(intentionalError);
      }
    );
  }

  function expectPostProperties (self, contractFunction, exception) {
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

  function expectExceptionProperties (self, contractFunction, exception) {
    exceptionConditionViolationCommon.expectProperties(
      exception,
      ExceptionConditionViolation,
      contractFunction,
      contractFunction.contract.exception[3], // integer was programmed wrong
      self,
      [wrongParameter],
      wrongException
    );
  }

  const argumentsOfWrongType = [undefined, null, 'bar'];

  interface Self {
    aProperty: string;
    fibonacci: ContractFunction<(this: Self, n: number) => number, undefined, undefined>;
    fibonacciWrong: ContractFunction<(this: Self, n: number) => number, undefined, undefined>;
    factorial: ContractFunction<(this: Self, n: number) => number, undefined, undefined>;
    defensiveIntegerSum: ContractFunction<(this: Self, n: number) => number, Error, undefined>;
    fastDefensiveIntegerSum: ContractFunction<(this: Self, n: number) => number, Error, undefined>;
    fastDefensiveIntegerSumWrong: ContractFunction<(this: Self, n: number) => number, Error, undefined>;
  }

  const self: Self = {
    aProperty: 'a property value',
    fibonacci: new Contract<(this: Self, n: number) => number, undefined>({
      pre: [
        function (this: Self, n: number): boolean {
          return Number.isInteger(n);
        },
        function (this: Self, n: number): boolean {
          return n >= 0;
        }
      ],
      post: [
        function (this: Self, _n: number, result: number): boolean {
          return Number.isInteger(result);
        },
        function (this: Self, n: number, result: number): boolean {
          return n !== 0 || result === 0;
        },
        function (this: Self, n: number, result: number): boolean {
          return n !== 1 || result === 1;
        },
        function (this: Self, n: number, result: number, fibonacci: ContractFunction<(this: Self, n: number) => number, undefined, undefined>) {
          // don't refer to a specific implementation ("fibonacci") in the Contract!
          return n < 2 || result === fibonacci(n - 1) + fibonacci(n - 2);
        }
      ],
      exception: Contract.mustNotHappen
    }).implementation(function (n) {
      return n <= 1 ? n : this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }),
    fibonacciWrong: fibonacci.contract.implementation(function fWrong (n) {
      // noinspection IfStatementWithTooManyBranchesJS
      if (n === 0) {
        return 0;
      } else if (n === 1) {
        return 1;
      } else if (n === 4) {
        return -3; // wrong!
      } else {
        return this.fibonacciWrong(n - 1) + this.fibonacciWrong(n - 2);
      }
    }),
    factorial: factorial,
    defensiveIntegerSum: defensiveIntegerSum,
    fastDefensiveIntegerSum: fastDefensiveIntegerSum,
    fastDefensiveIntegerSumWrong: fastDefensiveIntegerSumWrong
  };

  describe('#name', function () {
    it('fibonacci has the right name', function () {
      fibonacciImpl.name.should.equal('fibonacciImpl');
      log('fibonacci.name: %s', fibonacci.name);
      fibonacci.name.should.equal(`${AbstractContract.namePrefix} ${fibonacciImpl.name}`);
    });
    it('fibonacciWrong has the right name', function () {
      log('fibonacciWrong.name: %s', fibonacciWrong.name);
      fibonacciWrong.name.should.equal(`${AbstractContract.namePrefix} fWrong`);
    });
    it('self.fibonacciWrong has the right name', function () {
      log('self.fibonacciWrong.name: %s', self.fibonacciWrong.name);
      self.fibonacciWrong.name.should.equal(`${AbstractContract.namePrefix} fWrong`);
    });
    const anonymousContractFunctions = [
      { name: 'factorial', f: factorial },
      { name: 'factorialIterative', f: factorialIterative },
      { name: 'defensiveIntegerSum', f: defensiveIntegerSum },
      { name: 'fastDefensiveIntegerSum', f: fastDefensiveIntegerSum },
      { name: 'fastDefensiveIntegerSumWrong', f: fastDefensiveIntegerSumWrong },
      { name: 'self.fibonacci', f: self.fibonacci },
      { name: 'self.factorial', f: self.factorial },
      { name: 'self.defensiveIntegerSum', f: self.defensiveIntegerSum },
      { name: 'self.fastDefensiveIntegerSum', f: self.fastDefensiveIntegerSum },
      {
        name: 'self.fastDefensiveIntegerSumWrong',
        f: self.fastDefensiveIntegerSumWrong
      }
    ]
    anonymousContractFunctions.forEach(a => {
      it(`${a.name} has the right name`, function () {
        log(`${a.name}.name: ${a.f.name}`);
        a.f.name.should.containEql(`${AbstractContract.namePrefix} function (n) {`);
      });
    });
  });

  describe('correct', function () {
    it("doesn't interfere when the implementation is correct", function () {
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      const ignore: number = fibonacci(5);
      console.log(ignore);
    });
    it("doesn't interfere when the implementation is correct too", function () {
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      const ignore: number = factorial(5);
      console.log(ignore);
    });
    it("doesn't interfere when the implementation is correct three", function () {
      // noinspection MagicNumberJS
      const oneHundred: number = 100;
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      const ignore: number = defensiveIntegerSum(oneHundred);
      console.log(ignore);
    });
    it('can deal with alternative implementations', function () {
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      const ignore: number = factorialIterative(5);
      console.log(ignore);
    });
    it('works with a method that is correct', function () {
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      const ignore = self.fibonacci(5)
    })
    it('works with a method that is correct too', function () {
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      const ignore = self.factorial(5)
    })
    it('works with a method that is correct three', function () {
      // any exception will fail the test
      // eslint-disable-next-line no-unused-vars
      const ignore = self.defensiveIntegerSum(5)
    })
    it('works with a defensive function', function () {
      fastDefensiveIntegerSum.contract.verifyPostconditions = true
      fastDefensiveIntegerSum.bind(undefined, negativeParameter).should.throw(Error, { message: positiveMessage })
      fastDefensiveIntegerSum.contract.verifyPostconditions = false
    })
    it('works with a defensive method', function () {
      self.defensiveIntegerSum.contract.verifyPostconditions = true
      self.defensiveIntegerSum.bind(self, nonIntegerParameter).should.throw(Error, { message: integerMessage })
      self.defensiveIntegerSum.contract.verifyPostconditions = false
    })

    // noinspection LocalVariableNamingConventionJS
    const PersonConstructorContract = new Contract({
      pre: [
        function (name) {
          return typeof name === 'string'
        },
        function (name) {
          return !!name
        }
      ],
      post: [
        function (name, ignore) {
          return this.name === name
        }
      ],
      exception: Contract.mustNotHappen
    })

    // noinspection ParameterNamingConventionJS
    function expectConstructorToWork (PersonImplementation, doBind) {
      // noinspection LocalVariableNamingConventionJS, JSUnresolvedFunction
      let ContractPerson = PersonConstructorContract.implementation(PersonImplementation)
      if (doBind) {
        ContractPerson = ContractPerson.bind(undefined)
      }
      const caseName = 'Jim'
      const result = new ContractPerson(caseName)
      result.should.be.ok()
      result.should.be.instanceof(ContractPerson)
      result.should.be.instanceof(PersonImplementation)
      result.should.have.ownProperty('_name')
      result.name.should.equal(caseName)
    }

    it('works with a constructor', function () {
      // noinspection LocalVariableNamingConventionJS
      const PersonImplementation = function (name) {
        this._name = name
      }
      PersonImplementation.should.have.property('prototype')
      PersonImplementation.prototype.should.have.property('constructor')
      PersonImplementation.prototype.constructor.should.equal(PersonImplementation)
      PersonImplementation.prototype._name = null
      frozenDerived(PersonImplementation.prototype, 'name', function () {
        return this._name
      })

      expectConstructorToWork(PersonImplementation)
    })
    it('works with a bound constructor', function () {
      // noinspection LocalVariableNamingConventionJS
      const PersonImplementation = function (name) {
        this._name = name
      }
      PersonImplementation.should.have.property('prototype')
      PersonImplementation.prototype.should.have.property('constructor')
      PersonImplementation.prototype.constructor.should.equal(PersonImplementation)
      PersonImplementation.prototype._name = null
      frozenDerived(PersonImplementation.prototype, 'name', function () {
        return this._name
      })

      expectConstructorToWork(PersonImplementation, true)
    })
    // TODO support class construct
    // it("works with a class", function() {
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
    // });
  })

  describe('precondition', function () {
    describe('violation', function () {
      argumentsOfWrongType.forEach(wrongArg => {
        failsOnPreconditionViolation(undefined, fibonacci, wrongArg, fibonacci.contract.pre[0])
      })
      failsOnPreconditionViolation(undefined, fibonacci, -5, fibonacci.contract.pre[1])
      argumentsOfWrongType.forEach(wrongArg => {
        failsOnPreconditionViolation(self, self.fibonacci, wrongArg, fibonacci.contract.pre[0])
      })
      failsOnPreconditionViolation(self, self.fibonacci, -5, fibonacci.contract.pre[1])
      it('does not fail on a precondition violation when verify is false', function () {
        fibonacci.contract.verify = false
        // eslint-disable-next-line
        const ignore = fibonacci(-5)
        fibonacci.contract.verify = true
      })
    })
    describe('meta-error', function () {
      it('fails with a meta-error when a precondition is kaput', function () {
        // noinspection JSUnresolvedFunction, JSUnresolvedVariable
        failsOnMetaError(
          undefined,
          contractWithAFailingPre.implementation(function () {
            return resultWhenMetaError
          }),
          contractWithAFailingPre.pre[0]
        )
      })
      it('fails with a meta-error when a precondition is kaput when it is a method', function () {
        // noinspection JSUnresolvedFunction
        const self = {
          method: contractWithAFailingPre.implementation(function () {
            return resultWhenMetaError
          })
        }

        // noinspection JSUnresolvedVariable
        failsOnMetaError(self, self.method, contractWithAFailingPre.pre[0])
      })
      it('does not fail when a precondition is kaput when verify is false', function () {
        const expectedResult = 'expected result'
        contractWithAFailingPre.verify = false
        const result = contractWithAFailingPre.implementation(function () {
          return expectedResult
        })()
        contractWithAFailingPre.verify = true
        result.should.equal(expectedResult)
      })
    })
  })
  describe('postcondition', function () {
    describe('violation', function () {
      it('fails when a simple postcondition is violated', function () {
        fibonacciWrong.contract.verifyPostconditions = true
        callAndExpectException(
          undefined,
          fibonacciWrong,
          wrongParameter,
          expectPostProperties.bind(undefined, undefined, fibonacciWrong)
        )
        fibonacciWrong.contract.verifyPostconditions = false
      })
      it('fails when a simple postcondition is violated when it is a method', function () {
        self.fibonacciWrong.contract.verifyPostconditions = true
        callAndExpectException(
          self,
          self.fibonacciWrong,
          wrongParameter,
          expectPostProperties.bind(undefined, self, self.fibonacciWrong)
        )
        self.fibonacciWrong.contract.verifyPostconditions = false
      })
      it('fails when a postcondition is violated in a called function with a nested Violation', function () {
        const parameter = 6
        fibonacciWrong.contract.verifyPostconditions = true
        callAndExpectException(
          undefined,
          fibonacciWrong,
          parameter,
          expectPostProperties.bind(undefined, undefined, fibonacciWrong),
          'fWrong'
        )
        fibonacciWrong.contract.verifyPostconditions = false
      })
      it('fails when a postcondition is violated in a called function with a nested Violation when it is a method', function () {
        const parameter = 6
        self.fibonacciWrong.contract.verifyPostconditions = true
        callAndExpectException(
          self,
          self.fibonacciWrong,
          parameter,
          expectPostProperties.bind(undefined, self, self.fibonacciWrong),
          'fWrong'
        )
        self.fibonacciWrong.contract.verifyPostconditions = false
      })
      it('does not fail when a simple postcondition is violated when verify is false', function () {
        fibonacciWrong.contract.verify = false
        fibonacciWrong.contract.verifyPostconditions = true
        // eslint-disable-next-line
        const result = fibonacciWrong(wrongParameter)
        fibonacciWrong.contract.verifyPostconditions = false
        fibonacciWrong.contract.verify = true
        result.should.equal(wrongResult)
      })
      it('does not fail when a simple postcondition is violated when verifyPostcondition is false', function () {
        // eslint-disable-next-line
        const result = fibonacciWrong(wrongParameter)
        result.should.equal(wrongResult)
      })
    })
    describe('meta-error', function () {
      const contractWithAFailingPost = new Contract({
        post: [intentionallyFailingFunction]
      })
      it('fails with a meta-error when a postcondition is kaput', function () {
        // noinspection JSUnresolvedFunction
        const implementation = contractWithAFailingPost.implementation(function () {
          return resultWhenMetaError
        })
        implementation.contract.verifyPostconditions = true
        // noinspection JSUnresolvedVariable
        failsOnMetaError(undefined, implementation, contractWithAFailingPost.post[0], [
          resultWhenMetaError,
          implementation
        ])
      })
      it('fails with a meta-error when a postcondition is kaput when it is a method', function () {
        // noinspection JSUnresolvedFunction
        const self = {
          method: contractWithAFailingPost.implementation(function () {
            return resultWhenMetaError
          })
        }
        self.method.contract.verifyPostconditions = true

        // noinspection JSUnresolvedVariable
        failsOnMetaError(self, self.method, contractWithAFailingPost.post[0], [
          resultWhenMetaError,
          self.method.bind(self)
        ])
      })
      it('does not fail when a postcondition is kaput when verify is false', function () {
        const expectedResult = 'expected result'
        contractWithAFailingPre.verify = false
        contractWithAFailingPre.verifyPostconditions = true
        const result = contractWithAFailingPost.implementation(function () {
          return expectedResult
        })()
        contractWithAFailingPre.verifyPostconditions = false
        contractWithAFailingPre.verify = true
        result.should.equal(expectedResult)
      })
      it('does not fail when a postcondition is kaput when verifyPostcondition is false', function () {
        const expectedResult = 'expected result'
        const result = contractWithAFailingPost.implementation(function () {
          return expectedResult
        })()
        result.should.equal(expectedResult)
      })
    })
  })
  describe('exception condition', function () {
    describe('violation', function () {
      it('fails when a simple exception condition is violated', function () {
        fastDefensiveIntegerSumWrong.contract.verifyPostconditions = true
        callAndExpectException(
          undefined,
          fastDefensiveIntegerSumWrong,
          wrongParameter,
          expectExceptionProperties.bind(undefined, undefined, fastDefensiveIntegerSumWrong)
        )
        fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
      })
      it('fails when a simple exception condition is violated when it is a method', function () {
        self.fastDefensiveIntegerSumWrong.contract.verifyPostconditions = true
        callAndExpectException(
          self,
          self.fastDefensiveIntegerSumWrong,
          wrongParameter,
          expectExceptionProperties.bind(undefined, self, self.fastDefensiveIntegerSumWrong)
        )
        self.fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
      })
      it('does not fail when a exception condition is violated when verify is false', function () {
        fastDefensiveIntegerSumWrong.contract.verify = false
        fastDefensiveIntegerSumWrong.contract.verifyPostconditions = true
        try {
          // eslint-disable-next-line
          const ignore = fastDefensiveIntegerSumWrong(wrongParameter)
          true.should.be.false()
        } catch (err) {
          err.should.equal(wrongException)
        } finally {
          fastDefensiveIntegerSumWrong.contract.verifyPostconditions = false
          fastDefensiveIntegerSumWrong.contract.verify = true
        }
      })
      it('does not fail when a simple exception condition is violated when verifyPostcondition is false', function () {
        try {
          // eslint-disable-next-line
          const ignore: number = fastDefensiveIntegerSumWrong(wrongParameter);
          consume(ignore);
          true.should.be.false()
        } catch (err) {
          err.should.equal(wrongException)
        }
      })
    })
    describe('meta-error', function () {
      // noinspection LocalVariableNamingConventionJS
      const contractWithAFailingExceptionCondition = new Contract({
        exception: [intentionallyFailingFunction]
      });
      const anExceptedException: string = 'This exception is expected.';
      it('fails with a meta-error when an exception condition is kaput', function () {
        // noinspection JSUnresolvedFunction
        const implementation = contractWithAFailingExceptionCondition.implementation(function () {
          throw anExceptedException;
        });
        implementation.contract.verifyPostconditions = true;
        // noinspection JSUnresolvedVariable
        failsOnMetaError(undefined, implementation, contractWithAFailingExceptionCondition.exception[0], [
          anExceptedException,
          implementation
        ]);
      });
      it('fails with a meta-error when an exception condition is kaput when it is a method', function () {
        // noinspection JSUnresolvedFunction
        const self = {
          method: contractWithAFailingExceptionCondition.implementation(function (): never {
            throw anExceptedException;
          })
        };
        self.method.contract.verifyPostconditions = true;

        // noinspection JSUnresolvedVariable
        failsOnMetaError(self, self.method, contractWithAFailingExceptionCondition.exception[0], [
          anExceptedException,
          self.method.bind(self)
        ]);
      });
      it('does not fail when a exception condition is kaput when verify is false', function () {
        contractWithAFailingExceptionCondition.verify = false;
        contractWithAFailingExceptionCondition.verifyPostconditions = true;
        try {
          // eslint-disable-next-line
          const ignore: any = contractWithAFailingExceptionCondition.implementation(function (): never {
            throw anExceptedException;
          })();
          consume(ignore);
          contractWithAFailingExceptionCondition.verifyPostconditions = false;
          contractWithAFailingExceptionCondition.verify = true;
          true.should.be.false();
        } catch (err: any) {
          err.should.equal(anExceptedException);
        }
      });
      it('does not fail when a exception condition is kaput when verifyPostcondition is false', function () {
        try {
          // eslint-disable-next-line
          const ignore: any = contractWithAFailingExceptionCondition.implementation(function (): never {
            throw anExceptedException;
          })();
          consume(ignore);
          true.should.be.false();
        } catch (err: any) {
          err.should.equal(anExceptedException);
        }
      });
    });
  });
});