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
import {raw} from "../lib/_private/stack";
import {AbstractError, root} from "../lib/AbstractContract";
import common from "./AbstractErrorCommon";
import {log} from "./_util/testUtil";

describe('AbstractError', function () {
  describe('#AbstractError()', function () {
    it('creates an instance with all toppings for AbstractContract.root', function () {
      const rawStack: Stack = raw();
      const result: AbstractError = new AbstractError(root, rawStack);
      common.expectAbstractErrorConstructorPost(result, AbstractError.message, root, rawStack);
      log('result.stack:\n%s', result.stack);
    });
  });

  common.generateAbstractErrorPrototypeMethodsDescriptions(() => new AbstractError(root, raw()), [
    {
      subject: () => new AbstractError(root, raw()),
      description: 'AbstractContract.root'
    }
  ]);
});
