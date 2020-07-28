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
  ConditionThis,
  GeneralContractFunction,
} from "../lib/AbstractContract";

import {ConditionErrorCommon} from "./ConditionErrorCommon";
import {expectFrozenPropertyOnAPrototype} from "./_util/testUtil";
import ConditionViolation from "../lib/ConditionViolation";
import {functionArguments} from "../lib/_private/is";
import * as should from "should";
import conditionMetaErrorCommon from "./ConditionMetaErrorCommon";
import ConditionMetaError from "../lib/ConditionMetaError";
import {ok} from "assert";

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

// noinspection ParameterNamingConventionJS
function args (..._args: any): IArguments {
  return arguments;
}

const argsVerifyCases: Array<(this: void) => ConditionArguments<Condition<any>>> = [
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


export class ConditionViolationCommon<B extends Condition<any>, S extends ConditionViolation<B>> extends ConditionErrorCommon<B, S> {
  // noinspection ParameterNamingConventionJS
  doctorArgs (
    args: ConditionArguments<B>,
    _boundContractFunction: GeneralContractFunction<ConditionContract<B>>
  ): ConditionArguments<B> { // MUDO
    return args;
  }

  expectInvariants(subject: S): void {
    subject.should.be.an.instanceof(ConditionViolation);
    super.expectInvariants(subject);
    expectFrozenPropertyOnAPrototype(subject, 'verify');
    subject.verify.should.be.a.Function();
    expectFrozenPropertyOnAPrototype(subject, 'verifyAll');
    subject.verifyAll.should.be.a.Function();
  }

  // noinspection ParameterNamingConventionJS
  expectProperties(
    exception: S,
    type: Function,
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>,
    _extraProperty?: any
  ): void {
    super.expectProperties(exception, type, contractFunction, condition, self, args);
  }

  expectConstructorPost(
    result: S,
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
    oneSubjectGenerator: () => S,
    allSubjectGenerators: Array<{ subject: () => S, description: string }>
  ): void {
    super.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);

    const that = this;

    type ConditionExtension = {self?: any, args?: IArguments};

    type ExtendedB = B & ConditionExtension;

    function adorn(f: Condition<any>): ExtendedB {
      const result: ExtendedB = function adorned() {
        (adorned as ExtendedB).self = this;
        (adorned as ExtendedB).args = arguments;
        return f.call(this, ...arguments);
      } as ExtendedB;
      result.toString = function (this: ExtendedB): string {
        return f.toString();
      };
      return result;
    }

    const verifyConditionCases: Array<(this: void) => ExtendedB> =
      [
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
      ].map((g: (this: void) => Condition<any>) => () => adorn(g()));

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
      verifyConditionCases.forEach((conditionGenerator: (this: void) => ExtendedB) => {
        selfVerifyCases.forEach((selfGenerator: (this:void) => ConditionThis<B>) => {
          argsVerifyCases.forEach((argGenerator: (this: void) => ConditionArguments<B>) => {
            const condition: ExtendedB = conditionGenerator();
            const self: ConditionThis<B> = selfGenerator();
            const args: ConditionArguments<B> = argGenerator();
            it('works for ' + condition + ' - ' + self + ' - ' + args, function () {
              const subject: S = oneSubjectGenerator();
              const contractFunction: GeneralContractFunction<ConditionContract<ExtendedB>> = that.createCandidateContractFunction();
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
                  Object.isFrozen(exc).should.be.true();
                }
              } finally {
                should(condition.self).equal(self);
                should(condition.args).be.ok();
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
                      Object.isFrozen(exc).should.be.true()
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
                      Object.isFrozen(exc).should.be.true()
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

    const verifyAllConditionsCases: Array<(this: void) => Array<ExtendedB>> = [
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
      (g: (this: void) => Array<Condition<any>>) => () => g().map((condition: Condition<any>) => adorn(condition)));

    describe('#verifyAll()', function () {
      verifyAllConditionsCases.forEach((conditionsGenerator: (this: void) => Array<ExtendedB>) => {
        selfVerifyCases.forEach((selfGenerator: (this:void) => ConditionThis<B>) => {
          argsVerifyCases.forEach((argGenerator: (this:void) => ConditionArguments<B>) => {
            const conditions: Array<ExtendedB> = conditionsGenerator();
            const self: ConditionThis<B> = selfGenerator();
            const args: ConditionArguments<B> = argGenerator();
            const conditionsRepr: string = conditions.map(c => ('' + c).replace(/\s+/g, ' ')).join(', ');

            // noinspection FunctionTooLongJS
            it('works for [' + conditionsRepr + '] - ' + self + ' - ' + args, function () {
              const subject: S = oneSubjectGenerator();
              const contractFunction = that.createCandidateContractFunction();
              const doctoredArgs = that.doctorArgs(args, contractFunction.bind(self));

              let firstFailure: ExtendedB | undefined;
              let firstFailureIndex: number = conditions.length - 1;
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
                ok(firstFailure);
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
                  Object.isFrozen(exc).should.be.true();
                }
              } finally {
                // evaluates all conditions up until the first failure with the given self and arguments
                for (let j = 0; j <= firstFailureIndex; j++) {
                  should(conditions[j].self).equal(self);
                  const appliedArgs: ArrayLike<any> | undefined = conditions[j].args;
                  should(appliedArgs).be.ok();
                  isArguments(appliedArgs);
                  if (!args) {
                    should(appliedArgs).be.empty();
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
                        Object.isFrozen(exc).should.be.true()
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
