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
  ConditionArguments,
  ConditionResult,
  ConditionThis,
  Postcondition
} from "../lib/AbstractContract";
import type {ConditionContract, GeneralContractFunction} from "../lib/AbstractContract";
import { ConditionViolationCommon } from './ConditionViolationCommon'
import {anyCasesGenerators, expectOwnFrozenProperty} from "./_util/testUtil";
import PostconditionViolation from "../lib/PostconditionViolation";
import {value} from "../lib/_private/report";

export const resultCaseGenerators = anyCasesGenerators('result');

export class PostconditionViolationCommon<
  Post extends Postcondition<any>
> extends ConditionViolationCommon<Post, 'result', ConditionResult<Post>, PostconditionViolation<Post>> {
  readonly extraPropertyName: 'result' = 'result';
  readonly types: Array<Function> = super.types.concat([PostconditionViolation]);

  constructor() {
    super('result', [PostconditionViolation]);
  }

  expectInvariants (subject: PostconditionViolation<Post>): void {
    super.expectInvariants(subject);
    subject.should.be.an.instanceof(PostconditionViolation);
    expectOwnFrozenProperty(subject, 'result');
    // noinspection JSUnresolvedVariable
    subject.stack.should.containEql(value(subject.result));
  }

  // noinspection FunctionNamingConventionJS
  expectPostconditionViolationConstructorPost (
    executionResult: PostconditionViolation<Post>,
    contractFunction: GeneralContractFunction<ConditionContract<Post>>,
    condition: Post,
    self: ConditionThis<Post>,
    args: ConditionArguments<Post>,
    result: ConditionResult<Post>
  ): void {
    this.expectConditionViolationConstructorPost(executionResult, contractFunction, condition, self, args, result);
  }

  expectDetailsPost (subject:PostconditionViolation<Post>, result: string): void {
    // noinspection JSUnresolvedFunction
    super.expectDetailsPost(subject, result);
    // noinspection JSUnresolvedVariable
    result.should.containEql(subject.result);
  }

  doctorArgs (
    args: ConditionArguments<any>,
    boundContractFunction: GeneralContractFunction<ConditionContract<Post>>,
    extra?: ConditionResult<Post>
  ): ConditionArguments<Post> {
    const doctored: ConditionArguments<Post> = Array.prototype.slice.call(args) as ConditionArguments<Post>;
    // noinspection MagicNumberJS
    doctored.push(extra || 42); // a result
    doctored.push(boundContractFunction);
    return doctored;
  }

}

export default new PostconditionViolationCommon<Postcondition<any>>();
