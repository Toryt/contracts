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
import type ContractError from "../lib/ContractError";
import {ContractErrorCommon} from "./ContractErrorCommon";
import AbstractContract, {AbstractError} from "../lib/AbstractContract";
import {expectOwnFrozenProperty} from "./_util/testUtil";

export class AbstractErrorCommon extends ContractErrorCommon {
  expectInvariants(subject: ContractError): void {
    super.expectInvariants(subject);
    subject.should.be.an.instanceof(AbstractError);
    expectOwnFrozenProperty(subject, 'name');
    subject.name.should.equal(AbstractError.name);
    expectOwnFrozenProperty(Object.getPrototypeOf(subject), 'name');
    Object.getPrototypeOf(subject).name.should.equal(AbstractError.name);
    expectOwnFrozenProperty(subject, 'message');
    subject.message.should.equal(AbstractError.message);
    expectOwnFrozenProperty(AbstractError.prototype, 'message');
    Object.getPrototypeOf(subject).message.should.equal(AbstractError.message);
  }

  expectAbstractErrorConstructorPost(result: AbstractError, message:string, contract:AbstractContract<any, any>, rawStack: Stack): void {
    this.expectContractErrorConstructorPost(result, message, rawStack);
    result.contract.should.equal(contract);
  }

  // noinspection FunctionNamingConventionJS
  generateAbstractErrorPrototypeMethodsDescriptions(
    oneSubjectGenerator: () => AbstractError,
    allSubjectGenerators: Array<{ subject: () => AbstractError, description: string }>
  ): void {
    this.generateContractErrorPrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);

    // NOP: no methods here
  }
}

export default new AbstractErrorCommon();
