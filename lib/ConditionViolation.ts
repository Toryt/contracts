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

import ConditionError from "./ConditionError";
import {ok, strictEqual} from "assert";
import type {
  Condition,
  ConditionArguments,
  ConditionContract,
  ConditionThis,
  GeneralContractFunction
} from "./AbstractContract";
import {isAGeneralContractFunction} from "./AbstractContract";
import {raw, skipsForEach} from "./_private/stack";
import {functionArguments} from "./_private/is";
import ConditionMetaError from "./ConditionMetaError"

/* See https://fettblog.eu/typescript-interface-constructor-pattern/ for constructor interface pattern.
   See https://github.com/microsoft/TypeScript/issues/3841 for open issue.  */
export interface ConditionViolationConstructor<B extends Condition<any>, CV extends ConditionViolation<B>> {
  new (
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>
  ): CV;
}

/**
 * Super type for objects that are thrown to signal a condition violation.
 * This is intended to be abstract.
 *
 * @constructor
 * @param {Function} contractFunction - The contract function that reports this violation
 * @param {Function} condition        - The condition that was violated
 * @param            self             - The <code>this</code> that <code>contractFunction</code> was called on
 * @param {Array} args
 *                The arguments with which the contract function that failed, was called.
 */
export default class ConditionViolation<B extends Condition<any>> extends ConditionError<B> {
  /* See https://github.com/microsoft/TypeScript/issues/3841#issuecomment-502845949 */
  ['constructor']!: ConditionViolationConstructor<B, this>;
  constructor(
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>
  ) {
    ok(isAGeneralContractFunction(contractFunction), 'this is a general contract function');
    strictEqual(typeof condition, 'function');
    ok(functionArguments(args) || Array.isArray(args), 'args is arguments or array');

    super(contractFunction, condition, self, args, raw(/* istanbul ignore next: platform dependent */ skipsForEach ? 6 : 7));
  }

  /**
   * Dynamic conditional constructor and thrower of instances of this type. The intended usage is:
   *
   * <pre>
   *   <var>SpecificConditionViolationConstructor</var>.prototype.verifyAll(<var>...</var>, <var>conditions</var>, <var>self</var>, <var>args</var>)
   * </pre>
   *
   * Such a call will throw a ConditionViolation of type <var>SpecificConditionViolationConstructor</var>, with its
   * properties filled out appropriately if any of the supplied <var>conditions</var> returns falsy when
   * applied to <var>self</var> and <var>args</var>.
   *
   * When any of the supplied <var>conditions</var> fails to execute, a ConditionMetaError is thrown, with its
   * properties filled out appropriately.
   */
  verifyAll (
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    conditions: ReadonlyArray<B>,
    self: ConditionThis<B>,
    args: ConditionArguments<B>
  ): void {
    ok(
      isAGeneralContractFunction(contractFunction),
      'verifyAll: first argument is a contract function'
    );
    ok(conditions);
    ok(Array.isArray(conditions), 'verifyAll: conditions is an array');
    ok(
      conditions.every(c => typeof c === 'function'),
      'verifyAll: all conditions are functions'
    );
    ok(args);
    ok(functionArguments(args) || Array.isArray(args), 'verifyAll: args is arguments or array');

    conditions.forEach( (condition)  => {
      this.verify(contractFunction, condition, self, args);
    });
  }

  /**
   * Dynamic conditional constructor and thrower of instances of this type. The intended usage is:
   *
   * <pre>
   *   <var>SpecificConditionViolationConstructor</var>.prototype.verify(<var>...</var>, <var>condition</var>, <var>self</var>, <var>args</var>)
   * </pre>
   *
   * Such a call will throw a ConditionViolation of type <var>SpecificConditionViolationConstructor</var>, with its
   * properties filled out appropriately, if the supplied <var>condition</var> returns falsy when applied
   * to <var>self</var> and <var>args</var>.
   *
   * When the supplied <var>condition</var> fails to execute, a ConditionMetaError is thrown, with its
   * properties filled out appropriately.
   *
   * Mostly, this method is not used directly, but called via <code>verifyAll</code>.
   */
  verify (
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>
  ): void {
    ok(isAGeneralContractFunction(contractFunction), 'verify: first argument is a contract function');
    strictEqual(typeof condition, 'function', 'verify: condition is a function');
    ok(functionArguments(args) || Array.isArray(args), 'verify: args is arguments or array');

    let conditionResult;
    try {
      conditionResult = condition.apply(self, args);
    } catch (err: any) {
      const cme = new ConditionMetaError(
        contractFunction,
        condition,
        self,
        args,
        err,
        raw(/* istanbul ignore next: platform dependent */ skipsForEach ? 4 : 5)
      );
      Object.freeze(cme);
      throw cme;
    }
    if (!conditionResult) {
      const cv = new this.constructor(contractFunction, condition, self, args);
      Object.freeze(cv);
      throw cv;
    }
  }

/* MUDO
  /!**
   * Dynamic conditional constructor and thrower of instances of this type. Conditions may return a Promise.
   * The intended usage is:
   *
   * <pre>
   *   <var>return SpecificConditionViolationConstructor</var>.prototype.verifyAllPromise(<var>...</var>, <var>conditions</var>, <var>self</var>, <var>args</var>)
   * </pre>
   *
   * Such a call will reject with a ConditionViolation of type <var>SpecificConditionViolationConstructor</var>, with its
   * properties filled out appropriately, if any of the supplied <var>condition</var> returns falsy, or returns a
   * `Promise` that resolves to falsy, when applied to <var>self</var> and <var>args</var>.
   *
   * When any of the the supplied <var>condition</var> fails to execute, i.e., rejects with a ConditionMetaError, with
   * its properties filled out appropriately.
   *!/
  verifyAllPromise <B extends Condition<any>> (
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    conditions: ReadonlyArray<B>,
    self: ConditionThis<B>,
    args: ConditionArguments<B>
  ): Promise<void> {
    ok(
      isAGeneralContractFunction(contractFunction),
      'verifyAllPromise: first argument is a contract function'
    );
    ok(conditions);
    ok(Array.isArray(conditions), 'verifyAllPromise: conditions is an array');
    ok(
      conditions.every(c => typeof c === 'function'),
      'verifyAllPromise: all conditions are functions'
    );
    ok(args);
    ok(functionArguments(args) || Array.isArray(args), 'verifyAllPromise: args is arguments or array');

    return Promise.all(conditions.map(condition => this.verifyPromise(contractFunction, condition, self, args)));
  }

  /!**
   * Dynamic conditional constructor and thrower of instances of this type. Conditions may return a Promise.
   * The intended usage is:
   *
   * <pre>
   *   <var>return SpecificConditionViolationConstructor</var>.prototype.verifyPromise(<var>...</var>, <var>condition</var>, <var>self</var>, <var>args</var>)
   * </pre>
   *
   * Such a call will reject with a ConditionViolation of type <var>SpecificConditionViolationConstructor</var>, with its
   * properties filled out appropriately, if the supplied <var>condition</var> returns falsy, or returns a `Promise` that
   * resolves to falsy, when applied to <var>self</var> and <var>args</var>.
   *
   * When the supplied <var>condition</var> fails to execute, i.e., rejects with a ConditionMetaError, with its properties
   * filled out appropriately.
   *
   * Mostly, this method is not used directly, but called via <code>verifyAllPromise</code>.
   *!/
  verifyPromise <B extends Condition<any>> (
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>
  ): Promise<void> {
    ok(
      isAGeneralContractFunction(contractFunction),
      'verifyPromise: first argument is a contract function'
    );
    strictEqual(typeof condition, 'function', 'verifyPromise: condition is a function');
    ok(is.functionArguments(args) || Array.isArray(args), 'verifyPromise: args is arguments or array');

    function metaError (err: any) {
      const cme = new ConditionMetaError(
        contractFunction,
        condition,
        self,
        args,
        err,
        stack.raw(/!* istanbul ignore next: platform dependent *!/ stack.skipsForEach ? 5 : 6)
      );
      Object.freeze(cme);
      return cme;
    }

    let conditionResult;
    try {
      conditionResult = condition.apply(self, args);
    } catch (err) {
      return Promise.reject(metaError(err));
    }
    if (conditionResult instanceof Promise) {
      return conditionResult
        .catch(err => {
          throw metaError(err);
        })
        .then(result => {
          if (!result) {
            const cv = new this.constructor(contractFunction, condition, self, args);
            Object.freeze(cv);
            throw cv;
          }
        });
    }
    if (!conditionResult) {
      const cv = new this.constructor(contractFunction, condition, self, args);
      Object.freeze(cv);
      return Promise.reject(cv);
    }
    return Promise.resolve();
  }
*/
}
