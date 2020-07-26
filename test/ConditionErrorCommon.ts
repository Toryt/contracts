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
import {ContractErrorCommon} from "./ContractErrorCommon";
import ConditionError from "../lib/ConditionError";
import {
  anyCasesGenerators,
  expectFrozenDerivedPropertyOnAPrototype,
  expectFrozenReadOnlyArrayPropertyWithPrivateBackingField,
  expectOwnFrozenProperty, log
} from "./_util/testUtil";
import {
  Condition, ConditionArguments, ConditionContract, ConditionThis, ExceptionCondition,
  GeneralContractFunction,
  isAGeneralContractFunction, Postcondition, Precondition
} from "../lib/AbstractContract";
import {conciseCondition, value} from "../lib/_private/report";
import {stack as stackEOL} from "../lib/_private/eol";
import {setAndFreeze} from "../lib/_private/property";
import should = require('should');
import abstractContractCommon from "./AbstractContractCommon";

const conditionCase: Condition<any> = function (this: any): string {
  return 'This simulates a condition';
};

function generateMultiLineAnonFunction (this: void): (this: any) => string {
  return function (this: any): string {
    let x = 'This is a multi-line function';
    x += 'The intention of this test';
    x += 'is to verify';
    x += 'whether we get an acceptable';
    x += 'is to shortened version of this';
    x += 'as a concise representation';
    x += 'this function should have no name';
    return x;
  };
}

const conditionCases: Array<Condition<any>> =
  [conditionCase, generateMultiLineAnonFunction()];

function functionWithAName (this: any): void {}
setAndFreeze(functionWithAName, 'name', '  This is a name  '); // trim
conditionCases.push(functionWithAName);

const other: (this: any) => any = generateMultiLineAnonFunction();
setAndFreeze(
  other,
  'name',
  `   This is a multi-line name
The intention of this test
is to verify

whether we get an acceptable
is to shortened version of this
as a concise representation
this function should have a name   ` // trim
);
conditionCases.push(other);

const selfCaseGenerators: Array<() => any> = anyCasesGenerators('self');

let argsCases: Array<any> = [[], anyCasesGenerators('arguments element').map(g => g())];
argsCases = argsCases.concat(
  argsCases.map((c: Array<any>) => {
    // noinspection ParameterNamingConventionJS
    function asArgs (..._args: Array<any>): IArguments {
      return arguments;
    }

    return asArgs.apply(undefined, c);
  })
);

export class ConditionErrorCommon<B extends Condition<any>, S extends ConditionError<B>> extends ContractErrorCommon<S> {
  readonly selfCaseGenerators: Array<() => any> = selfCaseGenerators;
  readonly oneSelfCase: any = selfCaseGenerators[selfCaseGenerators.length - 1]();
  readonly oneArgsCase: any = argsCases[argsCases.length - 1];
  readonly argsCases: Array<any> = argsCases;
  readonly conditionCases: Array<Condition<any>> = conditionCases;
  readonly conditionCase: Precondition<any> & Postcondition<any> & ExceptionCondition<any> = conditionCase;

  expectInvariants(subject: S): void {
    super.expectInvariants(subject);
    subject.should.be.an.instanceof(ConditionError);
    const subjectConditionError: S = subject as S;
    expectOwnFrozenProperty(subjectConditionError, 'contractFunction');
    // noinspection JSUnresolvedVariable
    isAGeneralContractFunction(subjectConditionError.contractFunction).should.be.true();
    // noinspection JSUnresolvedVariable
    subjectConditionError.condition.should.be.a.Function();
    expectOwnFrozenProperty(subjectConditionError, 'condition');
    expectOwnFrozenProperty(subjectConditionError, 'self');
    expectOwnFrozenProperty(subjectConditionError, '_args');
    expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subjectConditionError, 'args', '_args');
    expectFrozenDerivedPropertyOnAPrototype(subjectConditionError, 'message');
    expectFrozenDerivedPropertyOnAPrototype(subjectConditionError, 'stack');
    // noinspection JSUnresolvedVariable
    subject.message.should.containEql(subjectConditionError.contractFunction.name);
    // noinspection JSUnresolvedVariable
    subject.message.should.containEql(conciseCondition('condition', subjectConditionError.condition));
  }

  expectProperties(
    exception: S,
    type: Function,
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>
  ): void {
    exception.should.be.an.Error();
    exception.should.be.instanceof(type);
    exception.contractFunction.should.equal(contractFunction);
    exception.condition.should.equal(condition);
    should(exception.self).equal(self);
    exception.args.should.eql(Array.prototype.slice.call(args));
  }

  expectConstructorPost(
    result: S,
    contractFunction: GeneralContractFunction<ConditionContract<B>>,
    condition: B,
    self: ConditionThis<B>,
    args: ConditionArguments<B>,
    rawStack: Stack
  ): void {
    this.expectContractErrorConstructorPost(result, result.message, rawStack);
    this.expectProperties(result, ConditionError, contractFunction, condition, self, args);
    Object.isExtensible(result).should.be.true();
  }

  expectDetailsPost(subject: S, result: string): void {
    result.should.be.a.String();
    result.should.containEql(conciseCondition('', subject.condition));
    result.should.containEql(stackEOL + subject.contractFunction.contract.location);
    result.should.containEql(value(subject.self));
    Array.prototype.forEach.call(subject.args, arg => {
      result.should.containEql(value(arg));
    });
  }

  // noinspection FunctionNamingConventionJS
  generatePrototypeMethodsDescriptions(
    oneSubjectGenerator: () => S,
    allSubjectGenerators: Array<{ subject: () => S, description: string }>
  ): void {
    super.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators);

    const self = this;

    describe('#getDetails()', function () {
      allSubjectGenerators.forEach((generator: { subject: () => S, description: string }) => {
        it('returns the details as expected for ' + generator.description, function () {
          const subject = generator.subject();
          // noinspection JSUnresolvedFunction
          const result = subject.getDetails();
          log(result);
          self.expectDetailsPost(subject, result);
          self.expectInvariants(subject);
        });
      });
    });
  }

  readonly createCandidateContractFunction = abstractContractCommon.createCandidateContractFunction;
}

export default new ConditionErrorCommon<Condition<any>, ConditionError<Condition<any>>>();
