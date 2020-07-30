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
import {stack as stackEOL} from "../lib/_private/eol";
import {stack as isStack} from "../lib/_private/is";
import ContractError from "../lib/ContractError";
import {expectOwnFrozenProperty, regExpEscape} from "./_util/testUtil";


export class ContractErrorCommon<S extends ContractError> {
  expectStackInvariants(subject: S): void {
    const stack: Stack = subject.stack;
    stack.should.be.a.String();
    const startOfStack = subject.name + ': ' + subject.message + stackEOL;
    stack.should.match(new RegExp('^' + regExpEscape(startOfStack)));
    const restOfStack: Stack = stack
      .replace(startOfStack, '')
      .split(stackEOL)
      // remove empty lines that may occur in 'caused by' in Safari when used via Web Driver
      .filter(l => !!l)
      .join(stackEOL);
    isStack(restOfStack).should.be.true();
    restOfStack.should.containEql(subject['_rawStack']);
  }

  expectInvariants(subject: S): void {
    subject.should.be.an.instanceof(ContractError);
    expectOwnFrozenProperty(Object.getPrototypeOf(subject), 'name');
    subject.name.should.be.a.String();
    subject.name.should.equal(subject.constructor.name);
    expectOwnFrozenProperty(ContractError.prototype, 'message');
    subject.message.should.be.a.String();
    // @ts-ignore
    expectOwnFrozenProperty(subject, '_rawStack');
    isStack(subject['_rawStack']).should.be.true();
    this.expectStackInvariants(subject);
  }

  // noinspection FunctionNamingConventionJS
  expectContractErrorConstructorPost(result: S, message: string, rawStack: Stack): void {
    Object.isExtensible(result).should.be.true();
    result.name.should.equal(result.constructor.name);
    result.message.should.equal(message);
    result['_rawStack'].should.equal(rawStack);
    this.expectInvariants(result);
  }

  // noinspection FunctionNamingConventionJS,ParameterNamingConventionJS
  generatePrototypeMethodsDescriptions(
    _oneSubjectGenerator: () => S,
    _allSubjectGenerators: Array<{ subject: () => S, description: string }>
  ): void {
    // NOP: no methods here
  }
}

export default new ContractErrorCommon<ContractError>();
