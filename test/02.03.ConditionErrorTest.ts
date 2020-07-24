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

import type AbstractContract from "../lib/AbstractContract";
import type {GeneralContractFunction} from "../lib/AbstractContract";
import common from "./ConditionErrorCommon";
import {raw} from "../lib/_private/stack";
import {log, x} from "./_util/testUtil";
import ConditionError from "../lib/ConditionError";

describe('ConditionError', function () {
  describe('#ConditionError()', function () {
    common.selfCaseGenerators.forEach((selfCaseGenerator: () => any) => {
      common.argsCases.forEach((args: Array<any>) => {
        const self: any = selfCaseGenerator();
        it('creates an instance with all toppings for ' + self + ' - ' + args, function () {
          const contractFunction: GeneralContractFunction<AbstractContract<any, any>> =
            common.createCandidateContractFunction();
          const rawStack = raw();
          const result: ConditionError<any> = new ConditionError(contractFunction, common.conditionCase, self, args, rawStack);
          common.expectConstructorPost(result, contractFunction, common.conditionCase, self, args, rawStack);
          common.expectInvariants(result);
          result.should.not.have.ownProperty('message');
          result.should.not.have.ownProperty('stack');
          log('result.stack:\n%s', result.stack);
        });
      });
    });
  });

  common.generatePrototypeMethodsDescriptions(
    () => new ConditionError(common.createCandidateContractFunction(), common.conditionCase, null, common.argsCases[0], raw()),
    x(common.conditionCases, common.selfCaseGenerators, common.argsCases).map(parameters => {
      const self = parameters[1]();
      return {
        subject: () =>
          new ConditionError(common.createCandidateContractFunction(), parameters[0], self, parameters[2], raw()),
        description: parameters[0] + ' — ' + self + ' – ' + parameters[2]
      };
    })
  );
});
