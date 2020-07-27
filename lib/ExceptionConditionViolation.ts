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

import type {
  ConditionArguments,
  ConditionContract,
  ConditionThis,
  ContractExceptions,
  ExceptionCondition, ExceptionConditionArguments,
  GeneralContractFunction
} from "./AbstractContract";
import {ok, strictEqual} from "assert";
import {isAGeneralContractFunction} from "./AbstractContract";
import {functionArguments} from "./_private/is";
import ConditionViolation, {ConditionViolationConstructor} from "./ConditionViolation";
import {stack as stackEOL} from "./_private/eol";
import {extensiveThrown, type} from "./_private/report";

/* See https://fettblog.eu/typescript-interface-constructor-pattern/ for constructor interface pattern.
   See https://github.com/microsoft/TypeScript/issues/3841 for open issue.  */
// noinspection JSClassNamingConvention
export type ExceptionConditionViolationConstructor<
  EC extends ExceptionCondition<any>,
  ECV extends ExceptionConditionViolation<EC>
  > = ConditionViolationConstructor<EC, ECV>;

/**
 * <p>An ExceptionConditionViolation is the means by which Toryt Contracts tells developers that it detected that an
 *   exception condition was violated when a contract function was called. The implementation of the contract function
 *   that was called, was executed and threw an exception, but the exception or the resulting state did not
 *   conform.</p>
 *
 * <p>If the exception condition itself is correct, this is a programming error on the part of the implementation.
 *   One should assume the system is now in an undefined state.</p>
 *
 * <p>The developer wants to know</p>
 * <ul>
 *   <li>where the contract function was called in source code,</li>
 *   <li>what the arguments were of the instance of the call, at the time of the call (old),</li>
 *   <li>what the result of the call is, and what the state is of all relevant objects is, after the call, and</li>
 *   <li>which exception condition was violated in source code (which implies knowing which contract it is a
 *     part of).</li>
 * </ul>
 *
 * <p>The state of the relevant objects after the call is a difficult subject, since we should assume the system
 *   is in an undefined state. Retrieving the state might not be possible, because invariants and preconditions
 *   will no longer be guaranteed.</p>
 *
 * @constructor
 * @param {Function} contractFunction - The contract function that reports this violation
 * @param {Function} condition        - The condition that was violated
 * @param            self             - The <code>this</code> that <code>contractFunction</code> was called on
 * @param {Array} args
 *                The arguments with which the contract function that failed, was called, extended with the
 *                thrown exception, and the contract function, bound to the <code>this</code>
 *                it was called on. The bound contract function is always the last entry. The thrown exception
 *                is always the second-to-last entry.
 */
export default class ExceptionConditionViolation <EC extends ExceptionCondition<any>> extends ConditionViolation<EC> {
  readonly exception: ContractExceptions<ConditionContract<EC>>;

  /* See https://github.com/microsoft/TypeScript/issues/3841#issuecomment-502845949 */
  ['constructor']!: ExceptionConditionViolationConstructor<EC, this>;
  constructor(
    contractFunction: GeneralContractFunction<ConditionContract<EC>>,
    condition: EC,
    self: ConditionThis<EC>,
    args: ExceptionConditionArguments<EC>
  ) {
    ok(isAGeneralContractFunction(contractFunction), 'this is a general contract function');
    strictEqual(typeof condition, 'function');
    ok(functionArguments(args) || Array.isArray(args), 'args is arguments or array');

    // compiler cannot deal with PostconditionArguments<B>, but ConditionArguments<Pre> is functionally the same
    const actualArgs: ConditionArguments<EC> = Array.prototype.slice.call(args) as ConditionArguments<EC>;
    actualArgs.pop(); // the bound contract function
    const exception: ContractExceptions<ConditionContract<EC>> = actualArgs.pop();
    super(contractFunction, condition, self, actualArgs);
    this.exception = exception;
  }

  getDetails(): string {
    return super.getDetails() +
      stackEOL + `exception (${type(this.exception)}):` +
      stackEOL + extensiveThrown(this.exception);
  }
}
