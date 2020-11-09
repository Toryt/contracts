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

import type {ConditionThis, Precondition, ConditionContract, GeneralContractFunction} from "../lib/AbstractContract";
import PreconditionViolation from "../lib/PreconditionViolation";
import common from "./PreconditionViolationCommon";
import {log, x} from "./_util/testUtil";

describe('PreconditionViolation', function () {
/* MUDO tests are irrelevant - remove
  describe('#prototype', function () {
    it('has a condition', function () {
      PreconditionViolation.prototype.condition.should.be.a.Function();
      PreconditionViolation.prototype.condition.should.not.throw();
    });
  });
*/

  describe('#PreconditionViolation()', function () {
    common.selfCaseGenerators.forEach((selfCaseGenerator: () => ConditionThis<Precondition<any>>) => {
      common.argsCases.forEach((args: Array<unknown>) => {
        const self: ConditionThis<Precondition<any>> = selfCaseGenerator();
        it('creates an instance with all toppings for ' + self + ' - ' + args, function () {
          const contractFunction: GeneralContractFunction<ConditionContract<Precondition<any>>> =
            common.createCandidateContractFunction();
          const result: PreconditionViolation<any> = new PreconditionViolation(contractFunction, common.conditionCase, self, args);
          common.expectPreconditionViolationConstructorPost(result, contractFunction, common.conditionCase, self, args);
          common.expectInvariants(result);
          log('result.stack:\n%s', result.stack);
        });
      });
    });
  });

  common.generatePrototypeMethodsDescriptions(
    () =>
      new PreconditionViolation(
        common.createCandidateContractFunction(),
        common.conditionCase,
        null,
        common.argsCases[0]
      ),
    x(common.conditionCases, common.selfCaseGenerators, common.argsCases).map((parameters: [Precondition<any>, () => unknown, ReadonlyArray<unknown>]) => {
      const self: ConditionThis<Precondition<any>> = parameters[1]();
      // noinspection JSUnresolvedFunction
      return {
        subject: () =>
          new PreconditionViolation(common.createCandidateContractFunction(), parameters[0], self, parameters[2]),
        description: parameters[0] + ' — ' + self + ' – ' + parameters[2]
      };
    })
  );
});
