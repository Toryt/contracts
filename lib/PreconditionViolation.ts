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
  GeneralContractFunction,
  Precondition,
} from "./AbstractContract";
import {ok, strictEqual} from "assert";
import {isAGeneralContractFunction} from "./AbstractContract";
import {functionArguments} from "./_private/is";
import ConditionViolation, {ConditionViolationConstructor} from "./ConditionViolation";

/* See https://fettblog.eu/typescript-interface-constructor-pattern/ for constructor interface pattern.
   See https://github.com/microsoft/TypeScript/issues/3841 for open issue.  */
export type PreconditionViolationConstructor<
  Pre extends Precondition<any>,
  PreCV extends PreconditionViolation<Pre>
> = ConditionViolationConstructor<Pre, PreCV>;

/**
 * A PreconditionViolation is the means by which Toryt Contracts tells developers that it detected that a
 * precondition was violated when a contract function was called. The implementation of the contract function
 * that was called, was not executed.
 *
 * If the precondition itself is correct, this is a programming error on the part of the calling function.
 * One should assume the system is now in an undefined state.
 *
 * The developer wants to know
 * <ul>
 *   <li>where the contract function was called in source code,</li>
 *   <li>what the arguments were of the instance of the call, and</li>
 *   <li>which precondition was violated in source code (which implies knowing which contract it is a part of).</li>
 * </ul>
 *
 * @constructor
 * @param {Function} contractFunction - The contract function that reports this violation
 * @param {Function} condition        - The condition that was violated
 * @param            self             - The <code>this</code> that <code>contractFunction</code> was called on
 * @param {Array} args
 *                The arguments with which the contract function that failed, was called
 */
export default class PreconditionViolation<Pre extends Precondition<any>> extends ConditionViolation<Pre> {
  /* See https://github.com/microsoft/TypeScript/issues/3841#issuecomment-502845949 */
  ['constructor']!: PreconditionViolationConstructor<Pre, this>;
  constructor (
    contractFunction: GeneralContractFunction<ConditionContract<Pre>>,
    condition: Pre,
    self: ConditionThis<Pre>,
    // compiler cannot deal with PreconditionArguments<B>, but ConditionArguments<Pre> is functionally the same
    args: ConditionArguments<Pre>
  ) {
    ok(isAGeneralContractFunction(contractFunction), 'this is a general contract function');
    strictEqual(typeof condition, 'function');
    ok(functionArguments(args) || Array.isArray(args), 'args is arguments or array');

    super(contractFunction, condition, self, args);
  }
}
