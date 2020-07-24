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

import "should";
import {raw} from "../lib/_private/stack";
import ContractError from "../lib/ContractError";
import {frozenDerived} from "../lib/_private/property";
import {log} from "./_util/testUtil";
import common from "./ContractErrorCommon";

describe('ContractError', function () {
  describe('#ContractError()', function () {
    it('creates an instance with all toppings', function () {
      const rawStack = raw();
      const result = new ContractError(rawStack);
      log('result:\n%s', result);
      log('result.toString():\n%s', result.toString());
      common.expectContractErrorConstructorPost(result, ContractError.message, rawStack);
      common.expectInvariants(result);
      result.should.not.have.ownProperty('message');
      log('result.stack:\n%s', result.stack);
    });
    it('can get a message set', function () {
      const result = new ContractError(raw());
      const message = 'another message';
      frozenDerived(result, 'message', function () {
        return message;
      });
      result.should.have.ownProperty('message');
      result.message.should.equal(message);
      common.expectInvariants(result);
    });
  });

  common.generatePrototypeMethodsDescriptions(() => new ContractError(raw()), [
    {
      subject: () => new ContractError(raw()),
      description: 'a contract error'
    }
  ]);
});
