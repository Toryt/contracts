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

import {anyCasesGenerators, expectOwnFrozenProperty} from "./_util/testUtil";
import type {ExceptionCondition} from "../lib/AbstractContract";
import {ConditionViolationCommon} from "./ConditionViolationCommon";
import ExceptionConditionViolation from "../lib/ExceptionConditionViolation";
import {extensiveThrown} from "../lib/_private/report";
import type {
  ConditionArguments,
  ConditionContract,
  ConditionThis,
  GeneralContractFunction
} from "../lib/AbstractContract";

export const exceptionCaseGenerators = anyCasesGenerators('exception');

// noinspection JSClassNamingConvention
export class ExceptionConditionViolationCommon<
  ExcC extends ExceptionCondition<any>
> extends ConditionViolationCommon<ExcC, 'exception', any, ExceptionConditionViolation<ExcC>> {
  readonly extraPropertyName: 'exception' = 'exception';
  readonly types: Array<Function> = super.types.concat([ExceptionConditionViolation]);

  constructor() {
    super('exception', [ExceptionConditionViolation]);
  }

  expectInvariants(subject: ExceptionConditionViolation<ExcC>) {
    super.expectInvariants(subject);
    subject.should.be.an.instanceof(ExceptionConditionViolation);
    expectOwnFrozenProperty(subject, 'exception');
    subject.stack.should.containEql(extensiveThrown(subject.exception));
  }

  // noinspection FunctionNamingConventionJS
  expectExceptionConditionViolationConstructorPost(
    executionResult: ExceptionConditionViolation<ExcC>,
    contractFunction: GeneralContractFunction<ConditionContract<ExcC>>,
    condition: ExcC,
    self: ConditionThis<ExcC>,
    args: ConditionArguments<ExcC>,
    exception: any
  ): void {
    this.expectConditionViolationConstructorPost(executionResult, contractFunction, condition, self, args, exception);
  }

  expectDetailsPost(subject: ExceptionConditionViolation<ExcC>, result: string): void {
    super.expectDetailsPost(subject, result);
    result.should.containEql(subject.exception);
  }

  doctorArgs(
    args: ConditionArguments<any>,
    boundContractFunction: GeneralContractFunction<ConditionContract<ExcC>>
  ): ConditionArguments<ExcC> {
    const doctored: ConditionArguments<ExcC> = Array.prototype.slice.call(args) as ConditionArguments<ExcC>;
    doctored.push(new Error('Dummy exception for ExceptionConditionViolation')); // an exception
    doctored.push(boundContractFunction);
    return doctored;
  }
}

export default new ExceptionConditionViolationCommon<ExceptionCondition<any>>();
