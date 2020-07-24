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

import type {Stack} from "../lib/_private/is";
import type ContractError from "../lib/ContractError";
import type ConditionError from "../lib/ConditionError";
import type {
  Condition,
  ConditionArguments,
  ConditionContract,
  ConditionThis,
  GeneralContractFunction
} from "../lib/AbstractContract";

import {ConditionErrorCommon} from "./ConditionErrorCommon";
import ConditionMetaError from "../lib/ConditionMetaError";
import {ok} from "assert";
import {expectOwnFrozenProperty} from "./_util/testUtil";
import {extensiveThrown} from "../lib/_private/report";
import * as should from "should";

export class ConditionMetaErrorCommon extends ConditionErrorCommon {
  expectInvariants(subject: ContractError): void {
    super.expectInvariants(subject);
    subject.should.be.an.instanceof(ConditionMetaError);
    ok(subject instanceof ConditionMetaError);
    if (subject.error) {
      Object.isFrozen(subject.error).should.be.true();
    }
    expectOwnFrozenProperty(subject, 'error');
    subject.stack.should.containEql('' + subject.error);
    if (subject.error && subject.error.stack) {
      subject.stack.should.containEql(subject.error.stack);
    }
    subject.message.should.containEql('(' + subject.error + ')');
  }

  expectDetailsPost (subject: ConditionError<any>, result: string): void {
    super.expectDetailsPost(subject, result);
    subject.should.be.an.instanceof(ConditionMetaError);
    ok(subject instanceof ConditionMetaError);
    result.should.containEql(extensiveThrown(subject.error));
    if (subject.error && subject.error.stack) {
      result.should.containEql(subject.error.stack);
    }
  }

  expectConditionMetaErrorConstructorPost <B extends Condition<any>> (
    result: ConditionMetaError<ConditionContract<B>>,
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>,
    error: any,
    rawStack: Stack
  ): void {
    this.expectConditionErrorConstructorPost(result, contractFunction, condition, self, args, rawStack);
    should(result.error).equal(error);
  }
}
// noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS,JSHint
 export const errorCases: Array<any> = [
  new Error('This is an error case'),
  undefined,
  null,
  1,
  0,
  'a string that is used as an error',
  '',
  true,
  false,
  new Date(),
  /foo/,
  function () {},
  // eslint-disable-next-line no-new-wrappers
  new Number(42),
  // eslint-disable-next-line no-new-wrappers
  new Boolean(false),
  // eslint-disable-next-line no-new-wrappers
  new String('lalala'),
  (function () {
    return arguments;
  })(),
  {},
  { a: 1, b: 'b', c: {}, d: { d1: undefined, d2: 'd2', d3: { d31: 31 } } }
];

export const common = new ConditionMetaErrorCommon();
