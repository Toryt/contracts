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
  ConditionContract,
  ConditionResult,
  ConditionThis,
  GeneralContractFunction,
  Postcondition, PostconditionArguments
} from "../lib/AbstractContract";
import PostconditionViolation from "../lib/PostconditionViolation";
import common, {resultCaseGenerators} from "./PostconditionViolationCommon";
import {log, x} from "./_util/testUtil";

const argsCases: ReadonlyArray<Array<unknown>> = common.argsCases.filter(a => Array.isArray(a));

describe('PostconditionViolation', function () {
  describe('#prototype', function () {
    it('has a condition', function () {
      PostconditionViolation.prototype.condition.should.be.a.Function();
      PostconditionViolation.prototype.condition.should.not.throw();
    });
  });

  describe('#PostconditionViolation()', function () {
    common.selfCaseGenerators.forEach((selfCaseGenerator: () => ConditionThis<Postcondition<any>>) => {
      argsCases.forEach((args: Array<unknown>) => {
        resultCaseGenerators.forEach(resultCaseGenerator => {
          const self: ConditionThis<Postcondition<any>> = selfCaseGenerator();
          const result: ConditionResult<Postcondition<any>> = resultCaseGenerator();
          it('creates an instance with all toppings for ' + self + ' - ' + args + ' - ' + result, function () {
            const contractFunction: GeneralContractFunction<ConditionContract<Postcondition<any>>> =
              common.createCandidateContractFunction();
            const doctoredArgs: PostconditionArguments<Postcondition<any>> = args.slice();
            doctoredArgs.push(result);
            doctoredArgs.push(contractFunction.bind(self));
            // noinspection JSUnresolvedVariable
            const creationResult:PostconditionViolation<any> = new PostconditionViolation(
              contractFunction,
              common.conditionCase,
              self,
              doctoredArgs
            );
            common.expectPostconditionViolationConstructorPost(creationResult, contractFunction, common.conditionCase, self, args, result);
            common.expectInvariants(creationResult);
            log('result.stack:\n%s', creationResult.stack);
          });
        });
      });
    });
  });

  type Params = [Postcondition<any>, () => ConditionThis<Postcondition<any>>, ReadonlyArray<unknown>, () => ConditionResult<Postcondition<any>>];

  const cases: Array<Params> =
    x<Postcondition<any>, () => ConditionThis<Postcondition<any>>, ReadonlyArray<any>, () => ConditionResult<Postcondition<any>>>(common.conditionCases, [() => common.oneSelfCase], [() => common.oneArgsCase], resultCaseGenerators);
      // .concat(x([common.conditionCase], common.selfCaseGenerators, [() => common.oneArgsCase], [() => null]))
      // .concat(x([common.conditionCase], [() => common.oneSelfCase], argsCases, [() => null]));

  common.generatePrototypeMethodsDescriptions(
    () => {
      const contractFunction = common.createCandidateContractFunction();
      const self = null;
      const doctoredArgs = common.doctorArgs(common.argsCases[0], contractFunction.bind(self));
      return new PostconditionViolation(contractFunction, common.conditionCase, self, doctoredArgs);
    },
    cases.map((parameters: Params) => {
      // noinspection JSUnresolvedFunction
      const self: ConditionThis<Postcondition<any>> = parameters[1]();
      return {
        subject: () => {
          const contractFunction: GeneralContractFunction<ConditionContract<Postcondition<any>>> =
            common.createCandidateContractFunction();
          const doctoredArgs: PostconditionArguments<Postcondition<any>> =
            common.doctorArgs(parameters[2], contractFunction.bind(self), parameters[3]());
          return new PostconditionViolation(contractFunction, parameters[0], self, doctoredArgs);
        },
        description: parameters[0] + ' — ' + self + ' – ' + parameters[2] + ' – ' + parameters[3]
      };
    })
  );
});
