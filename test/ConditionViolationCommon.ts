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


import type {
  Condition,
  ConditionArguments,
  ConditionContract,
  ConditionThis, ExceptionCondition,
  GeneralContractFunction, Postcondition, Precondition
} from "../lib/AbstractContract";
import type ContractError from "../lib/ContractError";
import type ConditionError from "../lib/ConditionError";

import {ConditionErrorCommon} from "./ConditionErrorCommon";
import {expectFrozenPropertyOnAPrototype} from "./_util/testUtil";
import ConditionViolation from "../lib/ConditionViolation";
import {ok} from "assert";
import {functionArguments} from "../lib/_private/is";
import * as should from "should";
import conditionMetaErrorCommon from "./ConditionMetaErrorCommon";
import ConditionMetaError from "../lib/ConditionMetaError";

function isArguments (o: any): void {
  functionArguments(o).should.be.true();
}

const selfVerifyCases: Array<(this: void) => any> = [
  function () {
    return undefined;
  },
  function () {
    return null;
  },
  function () {
    return {};
  }
];

function args (..._args: any): IArguments {
  return arguments;
}

const argsVerifyCases: Array<(this: void) => ArrayLike<any>> = [
  function () {
    return args();
  },
  function () {
    return args('an argument');
  },
  function () {
    return args('an argument', 'another argument');
  },
  function () {
    return ['an argument in an array'];
  }
];


export class ConditionViolationCommon extends ConditionErrorCommon {
  doctorArgs (args, boundContractFunction) { // MUDO
    return args;
  }

  expectInvariants(subject: ContractError): void {
    subject.should.be.an.instanceof(ConditionViolation);
    ok(subject instanceof ConditionViolation);
    super.expectInvariants(subject);
    expectFrozenPropertyOnAPrototype(subject, 'verify');
    subject.verify.should.be.a.Function();
    expectFrozenPropertyOnAPrototype(subject, 'verifyAll');
    subject.verifyAll.should.be.a.Function();
  }

  // noinspection ParameterNamingConventionJS
  expectProperties<B extends Condition<any>>(
    exception: ConditionError<B>,
    Type: typeof ConditionError,
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>,
    _extraProperty?: any
  ): void {
    super.expectProperties(exception, Type, contractFunction, condition, self, args);
    Object.isFrozen(exception).should.be.true();
  }

  expectConstructorPost<B extends Condition<any>> (
    result: ConditionError<B>,
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>
  ): void {
    super.expectConstructorPost(result, contractFunction, condition, self, args, result['_rawStack']);
    this.expectProperties( result, ConditionViolation, contractFunction, condition, self, args);
    // not frozen yet
  }

  // noinspection FunctionNamingConventionJS
  generatePrototypeMethodsDescriptions(
    oneSubjectGenerator: () => ConditionViolation<any>,
    allSubjectGenerators: Array<{ subject: () => ConditionViolation<any>, description: string }>
  ): void {
    super.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);

    const that = this;

    type GeneralConditionCase =
      Precondition<any> & Postcondition<any> & ExceptionCondition<any> & {self: any, args: IArguments};

    function adorn(f: Precondition<any> & Postcondition<any> & ExceptionCondition<any>): GeneralConditionCase {
      return function adorned() {
        (adorned as GeneralConditionCase).self = this;
        (adorned as GeneralConditionCase).args = arguments;
        return f.call(this, ...arguments);
      } as GeneralConditionCase;
    }

    const verifyConditionCases: Array<(this: void) => GeneralConditionCase> = [
      () => function f(): void {
        // no return
      },
      () => function f(): false {
        return false;
      },
      () => function f(): true {
        return true;
      },
      () => function f(): never {
        throw new Error('This condition fails with an error');
      }
    ].map((g: (this: void) => Precondition<any> & Postcondition<any> & ExceptionCondition<any>) => () => adorn(g()));

/* MUDO
    const verifyPromiseConditionCases: Array<(this: void) => GeneralConditionCase> = [
      () =>
        function f() {
          f.self = this;
          f.args = arguments;
          return Promise.resolve();
        },
      () =>
        function f() {
          f.self = this;
          f.args = arguments;
          return Promise.resolve(false);
        },
      () =>
        function f() {
          f.self = this;
          f.args = arguments;
          return Promise.resolve(true);
        },
      () =>
        function f() {
          f.self = this;
          f.args = arguments;
          return Promise.reject(new Error('This condition fails with an error'));
        }
    ];
*/

    describe('#verify()', function () {
      verifyConditionCases.forEach((conditionGenerator: (this: void) => GeneralConditionCase) => {
        selfVerifyCases.forEach((selfGenerator: (this:void) => any) => {
          argsVerifyCases.forEach((argGenerator: (this: void) => ArrayLike<any>) => {
            const condition: GeneralConditionCase = conditionGenerator();
            const self: any = selfGenerator();
            const args: ArrayLike<any> = argGenerator();
            it('works for ' + condition + ' - ' + self + ' - ' + args, function () {
              const subject: ConditionViolation<any> = oneSubjectGenerator();
              const contractFunction: GeneralContractFunction<any> = that.createCandidateContractFunction();
              const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self)); // MUDO
              let outcome: any;
              let metaError: boolean = false;
              try {
                outcome = condition.apply(undefined);
              } catch (ignore) {
                // ConditionMetaError
                metaError = true;
              }
              try {
                subject.verify(contractFunction, condition, self, doctoredArgs);
                outcome.should.be.ok(); // otherwise, we get an exception
                should(metaError).not.be.ok();
              } catch (exc: any) {
                if (metaError) {
                  // noinspection JSUnresolvedFunction
                  conditionMetaErrorCommon.expectProperties(
                    exc,
                    ConditionMetaError,
                    contractFunction,
                    condition,
                    self,
                    doctoredArgs
                  );
                } else {
                  // ConditionViolation
                  should(outcome).not.be.ok();
                  const extraProperty = doctoredArgs[args.length]; // might not exist
                  that.expectProperties(exc, subject.constructor, contractFunction, condition, self, args, extraProperty);
                }
              } finally {
                should(condition.self).equal(self);
                condition.args.should.be.ok();
                isArguments(condition.args);
                // doctoredArgs might be arguments, or Array
                Array.prototype.slice.call(doctoredArgs).should.eql(Array.prototype.slice.call(condition.args));
                that.expectInvariants(subject);
              }
            });
          });
        });
      });
    });

/* MUDO
    describe('#verifyPromise()', function () {
      verifyConditionCases.forEach(conditionGenerator => {
        selfVerifyCases.forEach(selfGenerator => {
          argsVerifyCases.forEach(argGenerator => {
            const condition = conditionGenerator()
            const self = selfGenerator()
            const args = argGenerator()
            it('works for ' + condition + ' - ' + self + ' - ' + args, function () {
              const subject = oneSubjectGenerator()
              const contractFunction = common.createCandidateContractFunction()
              const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))

              let outcome
              let metaError = false
              try {
                outcome = condition.apply()
              } catch (ignore) {
                // ConditionMetaError
                metaError = true
              }

              return subject
                .verifyPromise(contractFunction, condition, self, doctoredArgs)
                .then(
                  () => {
                    outcome.should.be.ok() // otherwise, we get an exception
                    should(metaError).not.be.ok()
                  },
                  exc => {
                    if (metaError) {
                      // noinspection JSUnresolvedFunction
                      conditionMetaErrorCommon.expectProperties(
                        exc,
                        ConditionMetaError,
                        contractFunction,
                        condition,
                        self,
                        doctoredArgs
                      )
                    } else {
                      // ConditionViolation
                      should(outcome).not.be.ok()
                      const extraProperty = doctoredArgs[args.length] // might not exist
                      that.expectProperties(
                        exc,
                        subject.constructor,
                        contractFunction,
                        condition,
                        self,
                        args,
                        extraProperty
                      )
                    }
                  }
                )
                .then(() => {
                  should(condition.self).equal(self)
                  condition.args.should.be.ok()
                  isArguments(condition.args)
                  // doctoredArgs might be arguments, or Array
                  Array.prototype.slice.call(doctoredArgs).should.eql(Array.prototype.slice.call(condition.args))
                  that.expectInvariants(subject)
                })
            })
          })
        })
      })
      verifyPromiseConditionCases.forEach(conditionGenerator => {
        selfVerifyCases.forEach(selfGenerator => {
          argsVerifyCases.forEach(argGenerator => {
            const condition = conditionGenerator()
            const self = selfGenerator()
            const args = argGenerator()
            it('works for Promise condition ' + condition + ' - ' + self + ' - ' + args, function () {
              const subject = oneSubjectGenerator()
              const contractFunction = common.createCandidateContractFunction()
              const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))

              return condition
                .apply()
                .then(outcome => {
                  return subject.verifyPromise(contractFunction, condition, self, doctoredArgs).then(
                    () => {
                      outcome.should.be.ok() // otherwise, we get an exception
                    },
                    exc => {
                      // ConditionViolation
                      should(outcome).not.be.ok()
                      const extraProperty = doctoredArgs[args.length] // might not exist
                      that.expectProperties(
                        exc,
                        subject.constructor,
                        contractFunction,
                        condition,
                        self,
                        args,
                        extraProperty
                      )
                    }
                  )
                })
                .catch(() => {
                  return subject.verifyPromise(contractFunction, condition, self, doctoredArgs).then(
                    () => {
                      false.should.be.true() // should not happen
                    },
                    exc => {
                      // noinspection JSUnresolvedFunction
                      conditionMetaErrorCommon.expectProperties(
                        exc,
                        ConditionMetaError,
                        contractFunction,
                        condition,
                        self,
                        doctoredArgs
                      )
                    }
                  )
                })
                .then(() => {
                  should(condition.self).equal(self)
                  condition.args.should.be.ok()
                  isArguments(condition.args)
                  // doctoredArgs might be arguments, or Array
                  Array.prototype.slice.call(doctoredArgs).should.eql(Array.prototype.slice.call(condition.args))
                  that.expectInvariants(subject)
                })
            })
          })
        })
      })
    })
*/

    const verifyAllConditionsCases: Array<(this: void) => Array<GeneralConditionCase>> = [
      () => [],
      () => [
        function f(): false {
          return false;
        }
      ],
      () => [
        function f(): true {
          return true;
        }
      ],
      () => [
        function f(): object {
          return {};
        }
      ],
      () => [
        function f1(): true {
          return true;
        },
        function f2(): true {
          return true;
        }
      ],
      () => [
        function f1(): true {
          return true;
        },
        function f2(): false {
          return false;
        },
        function f3(): true {
          return true;
        }
      ],
      () => [
        function f1(): true {
          return true;
        },
        function f3(): never {
          throw new Error('This condition fails with an error');
        },
        function f3(): true {
          return true;
        }
      ]
    ].map(
      (g: (this: void) => Array<Precondition<any> & Postcondition<any> & ExceptionCondition<any>>) =>
        () => g().map((condition: Precondition<any> & Postcondition<any> & ExceptionCondition<any>) =>
          adorn(condition)));

    describe('#verifyAll()', function () {
      verifyAllConditionsCases.forEach((conditionsGenerator: (this: void) => Array<GeneralConditionCase>) => {
        selfVerifyCases.forEach((selfGenerator: (this:void) => any) => {
          argsVerifyCases.forEach((argGenerator: (this:void) => ArrayLike<any>) => {
            const conditions: Array<GeneralConditionCase> = conditionsGenerator();
            const self: any = selfGenerator();
            const args: ArrayLike<any> = argGenerator();
            const conditionsRepr: string = conditions.map(c => ('' + c).replace(/\s+/g, ' ')).join(', ');

            // noinspection FunctionTooLongJS
            it('works for [' + conditionsRepr + '] - ' + self + ' - ' + args, function () {
              const subject: ConditionViolation<any> = oneSubjectGenerator();
              const contractFunction = that.createCandidateContractFunction();
              const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self));

              let firstFailure: GeneralConditionCase | undefined;
              let firstFailureIndex: number = -1;
              let metaError: boolean = false;
              for (let i = 0; !firstFailure && i < conditions.length; i++) {
                try {
                  const outcome: any = conditions[i].apply(undefined);
                  if (!outcome) {
                    firstFailure = conditions[i];
                    firstFailureIndex = i;
                  }
                } catch (ignore) {
                  // ConditionMetaError
                  metaError = true;
                  firstFailure = conditions[i];
                  firstFailureIndex = i;
                }
              }

              try {
                // noinspection JSUnresolvedFunction
                subject.verifyAll(contractFunction, conditions, self, doctoredArgs);
                should(firstFailure).not.be.ok(); // any failure would give an exception
                should(metaError).not.be.ok();
              } catch (exc) {
                conditions.length.should.be.greaterThanOrEqual(1); // otherwise, there can be no failure
                should(firstFailure).be.ok(); // metaError or a false condition
                if (metaError) {
                  conditionMetaErrorCommon.expectProperties(
                    exc,
                    ConditionMetaError,
                    contractFunction,
                    firstFailure,
                    self,
                    doctoredArgs
                  );
                } else {
                  const extraProperty: any = doctoredArgs[args.length]; // might not exist
                  that.expectProperties(
                    exc,
                    subject.constructor,
                    contractFunction,
                    firstFailure,
                    self,
                    args,
                    extraProperty
                  );
                }
              } finally {
                // evaluates all conditions up until the first failure with the given self and arguments
                for (let j = 0; j <= firstFailureIndex; j++) {
                  should(conditions[j].self).equal(self);
                  const appliedArgs: ArrayLike<any> = conditions[j].args;
                  appliedArgs.should.be.ok();
                  isArguments(appliedArgs);
                  if (!args) {
                    appliedArgs.should.be.empty();
                  } else {
                    // doctoredArgs might be arguments, or Array
                    Array.prototype.slice.call(doctoredArgs).should.eql(Array.prototype.slice.call(appliedArgs));
                  }
                }
                // does not evaluate conditions after the first failure
                for (let j = firstFailureIndex + 1; j < conditions.length; j++) {
                  should(conditions[j].self).not.be.ok();
                  should(conditions[j].args).not.be.ok();
                }
                that.expectInvariants(subject);
              }
            });
          });
        });
      });
    });

    /* MUDO
    const verifyAllPromiseConditionsCases = verifyAllConditionsCases.concat([
      () => [
        function f() {
          f.self = this
          f.args = arguments
          return Promise.resolve(false)
        }
      ],
      () => [
        function f() {
          f.self = this
          f.args = arguments
          return Promise.resolve(true)
        }
      ],
      () => [
        function f1() {
          f1.self = this
          f1.args = arguments
          return Promise.resolve(true)
        },
        function f2() {
          f2.self = this
          f2.args = arguments
          return Promise.resolve(true)
        }
      ],
      () => [
        function f1() {
          f1.self = this
          f1.args = arguments
          return Promise.resolve(true)
        },
        function f2() {
          f2.self = this
          f2.args = arguments
          return Promise.resolve(false)
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          return Promise.resolve(true)
        }
      ],
      () => [
        function f1() {
          f1.self = this
          f1.args = arguments
          return Promise.resolve(true)
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          return Promise.reject(new Error('This condition fails with an error'))
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          return Promise.resolve(true)
        }
      ],
      // mixed
      () => [
        function f() {
          f.self = this
          f.args = arguments
          return {}
        }
      ],
      () => [
        function f1() {
          f1.self = this
          f1.args = arguments
          return true
        },
        function f2() {
          f2.self = this
          f2.args = arguments
          return Promise.resolve(true)
        }
      ],
      () => [
        function f1() {
          f1.self = this
          f1.args = arguments
          return true
        },
        function f2() {
          f2.self = this
          f2.args = arguments
          return false
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          return Promise.resolve(true)
        }
      ],
      () => [
        function f1() {
          f1.self = this
          f1.args = arguments
          return true
        },
        function f2() {
          f2.self = this
          f2.args = arguments
          return Promise.resolve(false)
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          return Promise.resolve(true)
        }
      ],
      () => [
        function f1() {
          f1.self = this
          f1.args = arguments
          return true
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          return Promise.reject(new Error('This condition fails with an error'))
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          return true
        }
      ],
      () => [
        function f1() {
          f1.self = this
          f1.args = arguments
          return Promise.resolve(true)
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          throw new Error('This condition fails with an error')
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          return true
        }
      ],
      () => [
        function f1() {
          f1.self = this
          f1.args = arguments
          return Promise.resolve(false)
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          throw new Error('This condition fails with an error')
        },
        function f3() {
          f3.self = this
          f3.args = arguments
          return true
        }
      ]
    ])

    describe('#verifyAllPromise()', function () {
      verifyAllPromiseConditionsCases.forEach(conditionsGenerator => {
        selfVerifyCases.forEach(selfGenerator => {
          argsVerifyCases.forEach(argGenerator => {
            const conditions = conditionsGenerator()
            const self = selfGenerator()
            const args = argGenerator()
            const conditionsRepr = conditions.map(c => ('' + c).replace(/\s+/g, ' ')).join(', ')
            it('works for [' + conditionsRepr + '] - ' + self + ' - ' + args, function () {
              const subject = oneSubjectGenerator()
              const contractFunction = common.createCandidateContractFunction()
              const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self))

              const failures = []
              let metaErrorCondition = null // only 1 meta error per test case

              function determineExpected(i) {
                if (i >= conditions.length) {
                  return Promise.resolve()
                }

                try {
                  const outcome = conditions[i].apply()
                  if (outcome instanceof Promise) {
                    return outcome
                      .then(result => {
                        if (!result) {
                          failures.push(conditions[i])
                        }
                      })
                      .catch(() => {
                        metaErrorCondition = conditions[i]
                        failures.push(conditions[i])
                      })
                      .then(() => determineExpected(i + 1))
                  }
                  if (!outcome) {
                    failures.push(conditions[i])
                  }
                } catch (ignore) {
                  // ConditionMetaError
                  metaErrorCondition = conditions[i]
                  failures.push(conditions[i])
                }
                return determineExpected(i + 1)
              }

              const expectedDetermined = determineExpected(0)

              // noinspection JSUnresolvedFunction
              return expectedDetermined.then(() =>
                subject
                  .verifyAllPromise(contractFunction, conditions, self, doctoredArgs)
                  .then(
                    () => {
                      failures.should.be.empty() // any failure would give an exception
                      should(metaErrorCondition).not.be.ok()
                    },
                    exc => {
                      conditions.length.should.be.greaterThanOrEqual(1) // otherwise, there can be no failure
                      failures.should.not.be.empty()
                      if (metaErrorCondition) {
                        conditionMetaErrorCommon.expectProperties(
                          exc,
                          ConditionMetaError,
                          contractFunction,
                          metaErrorCondition,
                          self,
                          doctoredArgs
                        )
                      } else {
                        const extraProperty = doctoredArgs[args.length] // might not exist
                        that.expectProperties(
                          exc,
                          subject.constructor,
                          contractFunction,
                          failures[0], // works in tests, but the order is really indeterminate
                          self,
                          args,
                          extraProperty
                        )
                      }
                    }
                  )
                  .then(() => {
                    // evaluates all conditions, also past first failure with, the given self and arguments
                    conditions.forEach(c => {
                      should(c.self).equal(self)
                      const appliedArgs = c.args
                      appliedArgs.should.be.ok()
                      isArguments(appliedArgs)
                      if (!args) {
                        appliedArgs.should.be.empty()
                      } else {
                        // doctoredArgs might be arguments, or Array
                        Array.prototype.slice.call(doctoredArgs).should.eql(Array.prototype.slice.call(appliedArgs))
                      }
                    })
                    that.expectInvariants(subject)
                  })
              )
            })
          })
        })
      })
    });
    */
  }
}


export default new ConditionViolationCommon();
