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
  ConditionThis,
  ExceptionCondition, ExceptionConditionArguments,
  GeneralContractFunction
} from "../lib/AbstractContract";
import ExceptionConditionViolation from "../lib/ExceptionConditionViolation";
import common, {exceptionCaseGenerators} from "./ExceptionConditionViolationCommon";
import {log, x} from "./_util/testUtil";

const argsCases: ReadonlyArray<ReadonlyArray<unknown>> = common.argsCases.filter(a => Array.isArray(a));

describe('ExceptionConditionViolation', function () {
  describe('#prototype', function () {
    it('has a condition', function () {
      ExceptionConditionViolation.prototype.condition.should.be.a.Function();
      ExceptionConditionViolation.prototype.condition.should.not.throw();
    });
  });

  describe('#ExceptionConditionViolation()', function () {
    common.selfCaseGenerators.forEach((selfCaseGenerator: () => ConditionThis<ExceptionCondition<any>>) => {
      argsCases.forEach((args: ReadonlyArray<unknown>) => {
        exceptionCaseGenerators.forEach(exceptionCaseGenerator => {
          const self: ConditionThis<ExceptionCondition<any>> = selfCaseGenerator();
          const exception: unknown = exceptionCaseGenerator();
          it('creates an instance with all toppings for ' + self + ' - ' + args + ' - ' + exception, function () {
            const contractFunction: GeneralContractFunction<ConditionContract<ExceptionCondition<any>>> =
              common.createCandidateContractFunction();
            const doctoredArgs: ExceptionConditionArguments<ExceptionCondition<any>> = args.slice();
            doctoredArgs.push(exception);
            doctoredArgs.push(contractFunction.bind(self));
            const creationResult: ExceptionConditionViolation<any> = new ExceptionConditionViolation(
              contractFunction,
              common.conditionCase,
              self,
              doctoredArgs
            );
            common.expectExceptionConditionViolationConstructorPost(creationResult, contractFunction, common.conditionCase, self, args, exception);
            common.expectInvariants(creationResult);
            log('result.stack:\n%s', creationResult.stack);
          });
        });
      });
    });
  });

  type Params = [ExceptionCondition<any>, ConditionThis<ExceptionCondition<any>>, Array<any>, () => unknown];

  const cases: Array<Params> =
    x(common.conditionCases, [() => common.oneSelfCase], [() => common.oneArgsCase], exceptionCaseGenerators)
      .concat(
        x(
          [common.conditionCase],
          common.selfCaseGenerators,
          [() => common.oneArgsCase],
          [() => new Error('test error')]
        )
      )
      .concat(x([common.conditionCase], [() => common.oneSelfCase], argsCases, [() => new Error('test error')]));

  common.generatePrototypeMethodsDescriptions(
    () => {
      const contractFunction = common.createCandidateContractFunction();
      const self = null;
      const doctoredArgs = common.doctorArgs(common.argsCases[0], contractFunction.bind(self));
      return new ExceptionConditionViolation(contractFunction, common.conditionCase, self, doctoredArgs);
    },
    cases.map((parameters: Params) => {
      const self: ConditionThis<ExceptionCondition<any>> = parameters[1]();
      return {
        subject: () => {
          const contractFunction: GeneralContractFunction<ConditionContract<ExceptionCondition<any>>> =
            common.createCandidateContractFunction();
          const doctoredArgs = common.doctorArgs(parameters[2], contractFunction.bind(self), parameters[3]());
          return new ExceptionConditionViolation(contractFunction, parameters[0], self, doctoredArgs);
        },
        description: parameters[0] + ' — ' + self + ' – ' + parameters[2] + ' – ' + parameters[3]
      };
    })
  );
});
