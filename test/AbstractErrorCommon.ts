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
import {ContractErrorCommon} from "./ContractErrorCommon";
import AbstractContract, {AbstractError} from "../lib/AbstractContract";
import {expectOwnFrozenProperty} from "./_util/testUtil";
import type {Stack} from "../lib/_private/is";

export class AbstractErrorCommon extends ContractErrorCommon {
  expectInvariants(subject: AbstractError): void {
    subject.should.be.an.instanceof(AbstractError);
    super.expectInvariants(subject);
    expectOwnFrozenProperty(subject, 'name');
    subject.name.should.equal(AbstractError.name);
    expectOwnFrozenProperty(Object.getPrototypeOf(subject), 'name');
    Object.getPrototypeOf(subject).name.should.equal(AbstractError.name);
    expectOwnFrozenProperty(subject, 'message');
    subject.message.should.equal(AbstractError.message);
    expectOwnFrozenProperty(AbstractError.prototype, 'message');
    Object.getPrototypeOf(subject).message.should.equal(AbstractError.message);
  }

  expectAbstactErrorConstructorPost(result: AbstractError, message:string, contract:AbstractContract<any, any>, rawStack: Stack): void {
    super.expectContractErrorConstructorPost(result, message, rawStack);
    result.contract.should.equal(contract);
  }

  // noinspection FunctionNamingConventionJS
  generatePrototypeMethodsDescriptions(
    oneSubjectGenerator: () => AbstractError,
    allSubjectGenerators: Array<{ subject: () => AbstractError, description: string }>
  ): void {
    super.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);

    // NOP: no methods here
  }
}

export const common = new AbstractErrorCommon();
