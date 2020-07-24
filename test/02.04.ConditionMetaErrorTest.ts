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

import ConditionMetaError from "../lib/ConditionMetaError";
import common from "./ConditionMetaErrorCommon";
import {raw} from "../lib/_private/stack";
import {log} from "./_util/testUtil";

describe('ConditionMetaError', function () {
/* MUDO tests are irrelevant - remove
  describe('#prototype', function () {
    it('has a condition', function () {
      // noinspection JSUnresolvedVariable
      ConditionMetaError.prototype.condition.should.be.a.Function();
      // noinspection JSUnresolvedVariable
      ConditionMetaError.prototype.condition.should.not.throw();
    });
  });
*/

  describe('#ConditionMetaError()', function () {
    common.errorCases.forEach((error: any) => {
      it(
        'creates an instance with all toppings for ' + common.oneSelfCase + ' - ' + common.oneArgsCase + ' - ' + error,
        function () {
          // noinspection JSUnresolvedFunction
          const contractFunction = common.createCandidateContractFunction();
          const rawStack = raw();
          // noinspection JSUnresolvedVariable
          const result = new ConditionMetaError(
            contractFunction,
            common.conditionCase,
            common.oneSelfCase,
            common.oneArgsCase,
            error,
            rawStack
          );
          // noinspection JSUnresolvedVariable
          common.expectConditionMetaErrorConstructorPost(
            result,
            contractFunction,
            common.conditionCase,
            common.oneSelfCase,
            common.oneArgsCase,
            error,
            rawStack
          );
          common.expectInvariants(result);
          result.should.not.have.ownProperty('message');
          result.should.not.have.ownProperty('stack');
          // noinspection JSUnresolvedVariable
          log('result.stack:\n%s', result.stack);
        }
      );
    });
  });

  // noinspection JSUnresolvedVariable, JSUnresolvedFunction
  common.generateConditionErrorPrototypeMethodsDescriptions(
    () => new ConditionMetaError(
      common.createCandidateContractFunction(),
      common.conditionCase,
      null,
      common.oneArgsCase,
      common.errorCases[0],
      raw()
    ),
    common.errorCases.map(errorCase => {
      // noinspection JSUnresolvedFunction, JSUnresolvedVariable
      return {
        subject: () =>
          new ConditionMetaError(
            common.createCandidateContractFunction(),
            common.conditionCase,
            common.oneSelfCase,
            common.oneArgsCase,
            errorCase,
            raw()
          ),
        description: common.conditionCase + ' — ' + common.oneSelfCase + ' – ' + common.oneArgsCase + ' – ' + errorCase
      };
    })
  );
});
