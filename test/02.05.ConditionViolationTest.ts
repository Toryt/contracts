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

import common from "./ConditionViolationCommon";
import type {
  Condition,
  ConditionContract,
  ConditionThis,
  ContractResult,
  GeneralContractFunction
} from "../lib/AbstractContract";
import {log, x} from "./_util/testUtil";
import ConditionViolation from "../lib/ConditionViolation";

describe('ConditionViolation', function () {
/* MUDO tests are irrelevant - remove
  describe('#prototype', function () {
    it('has a condition', function () {
      // noinspection JSUnresolvedVariable
      ConditionViolation.prototype.condition.should.be.a.Function();
      // noinspection JSUnresolvedVariable
      ConditionViolation.prototype.condition.should.not.throw();
    });
  });
*/
  describe('#ConditionViolation()', function () {
    // noinspection JSUnresolvedVariable
    common.selfCaseGenerators.forEach(selfCaseGenerator => {
      // noinspection JSUnresolvedVariable
      common.argsCases.forEach(args => {
        const self: ConditionThis<Condition<any>> = selfCaseGenerator();
        it('creates an instance with all toppings for ' + self + ' - ' + args, function () {
          const contractFunction: GeneralContractFunction<ConditionContract<Condition<any>>> =
            common.createCandidateContractFunction();
          const result: ContractResult<ConditionContract<Condition<any>>> =
            new ConditionViolation(contractFunction, common.conditionCase, self, args);
          common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args);
          common.expectInvariants(result);
          result.should.not.have.ownProperty('message');
          result.should.not.have.ownProperty('stack');
          log('result.stack:\n%s', result.stack);
        });
      });
    });
  });

  // noinspection JSUnresolvedVariable
  common.generatePrototypeMethodsDescriptions(
    () =>
      new ConditionViolation(common.createCandidateContractFunction(), common.conditionCase, null, common.argsCases[0]),
    x(common.conditionCases, common.selfCaseGenerators, common.argsCases).map(parameters => {
      const self = parameters[1]();
      // noinspection JSUnresolvedFunction
      return {
        subject: () =>
          new ConditionViolation(common.createCandidateContractFunction(), parameters[0], self, parameters[2]),
        description: parameters[0] + ' — ' + self + ' – ' + parameters[2]
      };
    })
  );
});
