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

import type {Stack} from "./_private/is";
import type {
  Condition,
  ConditionArguments,
  ConditionContract,
  ConditionThis,
  GeneralContractFunction
} from "./AbstractContract";

import {ok, strictEqual} from "assert";
import {functionArguments, stack} from "./_private/is";
import {stack as stackEOL} from "./_private/eol";
import {setAndFreeze} from "./_private/property";
import {conciseCondition, extensiveThrown} from "./_private/report";
import {isAGeneralContractFunction} from "./AbstractContract";
import ConditionError from "./ConditionError";

/**
 * The condition could not be evaluated. There is probably a programming error in the condition itself.
 *
 * error must be optional
 * - to make it possible to use this as the prototype for more special types
 * - because in JavaScript, also undefined and null can be thrown
 * Therefor, a ConditionMetaError is also civilized if the error is falsy.
 */
export default class ConditionMetaError<B extends Condition<any>> extends ConditionError<B> {
  readonly error: any;

  constructor(
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>,
    error: any,
    rawStack: Stack
  ) {
    ok(isAGeneralContractFunction(contractFunction), 'this is a general contract function');
    strictEqual(typeof condition, 'function');
    ok(functionArguments(args) || Array.isArray(args), 'args is arguments or array');
    ok(stack(rawStack), 'rawStack is a stack');

    super(contractFunction, condition, self, args, rawStack);
    if (error) {
      Object.freeze(error);
    }
    setAndFreeze(this, 'error', error);
  }

  get message(): string {
    return (
      `error occurred while evaluating ${conciseCondition('condition', this.condition)} ` +
      `while contract function ${this.contractFunction.name} was called (${this.error})`
    );
  }

  getDetails(): string {
    return (
      super.getDetails() +
      stackEOL + 'caused by:' +
      stackEOL + extensiveThrown(this.error)
    );
  }
}
