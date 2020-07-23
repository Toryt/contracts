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
  Condition,
  ContractSignature,
  ExceptionCondition, GeneralContractFunction,
  Postcondition,
  Precondition
} from "../lib/AbstractContract";
import type {Stack, StackLocation} from "../lib/_private/is";
import {stack as stackEOL, n, rn} from "../lib/_private/eol";
import {
  expectFrozenReadOnlyArrayPropertyWithPrivateBackingField,
  expectOwnFrozenProperty,
  expectToBeArrayOfFunctions, log, mustBeCallerLocation
} from "./_util/testUtil";
import {stackLocation} from "../lib/_private/is";
import {location as getStackLocation} from "../lib/_private/stack";
import AbstractContract, {
  AbstractError,
  bindContractFunction,
  isAGeneralContractFunction,
  mustNotHappen
} from "../lib/AbstractContract";
import should = require('should');
import {setAndFreeze} from "../lib/_private/property";
import {conciseCondition} from "../lib/_private/report";

const someConditions: Array<Condition<any>> = [
  function (this: any): Array<never> {
    return [];
  },
  function (this: any): Array<() => boolean> {
    return [
      function (this: any): false {
        return false;
      },
      function (this: any): true {
        return true;
      }
    ];
  }
];
export const preCases: Array<Precondition<any>> = [
  function (this: any): null {
    return null;
  }
].concat(someConditions);
export const postCases: Array<Postcondition<any>> = [
  function (this: any): null {
    return null;
  }
].concat(someConditions);
export const exceptionCases: Array<ExceptionCondition<any>> = [
  function (this: any): null {
    return null;
  }
].concat(someConditions);

// noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS
export const notAFunctionNorAContract: Array<any> = [
  undefined,
  null,
  '',
  'foo',
  0,
  -1,
  true,
  false,
  /lala/,
  {},
  new Date(),
  // eslint-disable-next-line
  new Number(42),
  // eslint-disable-next-line
  new Boolean(true),
  // eslint-disable-next-line
  new String('lalala')
];

export const constructorPreCases: Array<Precondition<any>> = [
  function (this: void): undefined {
    return undefined;
  }
].concat(preCases);
export const constructorPostCases: Array<Postcondition<any>> = [
  function (this: void): undefined {
    return undefined;
  }
].concat(postCases);
export const constructorExceptionCases: Array<ExceptionCondition<any>> = [
  function (this: void): undefined {
    return undefined;
  }
].concat(exceptionCases);

export const location: StackLocation = stackEOL + '    at /';

export const contractFunctionPropertyNames = ['contract', 'implementation', 'location', 'bind'];

export default class AbstractContractCommon {
  expectInvariants<C extends AbstractContract<any, any>>(subject: C): void {
    subject.should.be.an.instanceof(AbstractContract);
    expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'pre', '_pre');
    /* MUDO given a contract c, and contract function cf = c.implementation(…), cf.contract !== c, but
            Object.getPrototypeOf(cf.contract) === c
            -
            c.implementation(…) creates a new object with c as prototype in bless: Object.create(contract)
            -
            therefor, it is not true that for all contracts _pre, _post, _exceptions must be _own_ properties
            -
            we are missing a test for the invariants of cf.contract
            -
            either we relax the invariants, and move the "own" aspect to the postconditions of the constructor,
            or we slice the arrays in bless - the latter seems like not a good idea, since in this case we intend
            this to be semantically "the same contract" - what will happen here with extend? */
    // noinspection JSUnresolvedVariable
    expectToBeArrayOfFunctions(subject.pre);
    expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'post', '_post');
    // noinspection JSUnresolvedVariable
    expectToBeArrayOfFunctions(subject.post);
    expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'exception', '_exception');
    // noinspection JSUnresolvedVariable
    expectToBeArrayOfFunctions(subject.exception);
    expectOwnFrozenProperty(subject, 'location');
    // noinspection JSUnresolvedVariable
    const location: StackLocation | typeof AbstractContract.internalLocation = subject.location;
    ;(location === AbstractContract.internalLocation || stackLocation(location)).should.be.true();
    expectOwnFrozenProperty(subject, 'abstract');
    // noinspection JSUnresolvedVariable
    const abstractImplementation: ContractSignature<C> = subject.abstract;
    isAGeneralContractFunction(abstractImplementation).should.be.true();
    abstractImplementation.location.should.equal(location);
    subject.isImplementedBy(abstractImplementation).should.be.true();
    abstractImplementation.should.throw(AbstractError, {message: AbstractError.message});
    try {
      abstractImplementation();
    } catch (err: any) {
      const stack: Stack = err.stack;
      stack.should.containEql(AbstractError.message);
      stack.should.containEql(AbstractError.name);
      stack.split(stackEOL)[0].should.containEql('abstract');
      log(stack);
    }
  }

  expectArrayPost<C extends AbstractContract<any, any>, P extends 'pre' | 'post' | 'exception'>(
    result: C,
    array: Array<P extends 'pre'
      ? Precondition<C>
      : P extends 'post'
        ? Postcondition<C>
        : P extends 'exception'
          ? ExceptionCondition<C>
          : never>,
    propName: P,
    privatePropName: P extends 'pre'
      ? '_pre'
      : P extends 'post'
        ? '_post'
        : P extends 'exception'
          ? '_exception'
          : never
  ) {
    result[propName].should.be.an.Array();
    if (!array) {
      if (propName === 'exception'/* MUDO || propName === 'fastException'*/) {
        result[propName].should.eql(mustNotHappen);
      } else {
        result[propName].should.be.empty();
      }
    } else {
      result[privatePropName].should.not.equal(array); // it must be copy, don't share the array
      result[privatePropName].should.eql(array);
      Object.isFrozen(result[privatePropName]);
      result[propName].should.eql(array);
      result[propName].should.not.equal(result[privatePropName]); // it must be copy, don't share the array
    }
  }

  expectAbstractContractConstructorPost<C extends AbstractContract<any, any>>(
    pre: Array<Precondition<C>>,
    post: Array<Postcondition<C>>,
    exception: Array<ExceptionCondition<C>>,
    location: StackLocation,
    result: C
  ): void {
    this.expectArrayPost(result, pre, 'pre', '_pre');
    this.expectArrayPost(result, post, 'post', '_post');
    this.expectArrayPost(result, exception, 'exception', '_exception');
    result.location.should.be.a.String();
    mustBeCallerLocation(result.location as StackLocation, location);
    this.expectInvariants(result);
  }

  // noinspection OverlyComplexFunctionJS, ParameterNamingConventionJS
  createCandidateContractFunction<C extends AbstractContract<any, any>>(
    ContractConstructor?: typeof AbstractContract,
    doNotFreezeProperty?: typeof contractFunctionPropertyNames[number],
    otherPropertyName?: typeof contractFunctionPropertyNames[number] | 'name',
    otherPropertyValue?: any
  ): GeneralContractFunction<C> {
    function candidate(): void {
    }

    function impl(): void {
    }

    let contract =
      otherPropertyName === 'contract' ? otherPropertyValue : new (ContractConstructor || AbstractContract)({});
    if (typeof contract === 'object') {
      contract = Object.create(contract);
    }
    const implementation: any = otherPropertyName === 'implementation' ? otherPropertyValue : impl;
    const location: any = otherPropertyName === 'location' ? otherPropertyValue : getStackLocation();
    const bind: any = otherPropertyName === 'bind' ? otherPropertyValue : bindContractFunction;

    if (doNotFreezeProperty === 'contract') {
      candidate.contract = contract;
    } else {
      setAndFreeze(candidate, 'contract', contract);
    }
    if (doNotFreezeProperty === 'implementation') {
      candidate.implementation = implementation;
    } else {
      setAndFreeze(candidate, 'implementation', implementation);
    }
    if (doNotFreezeProperty === 'location') {
      candidate.location = location;
    } else {
      setAndFreeze(candidate, 'location', location);
    }
    if (doNotFreezeProperty === 'bind') {
      candidate.bind = bind;
    } else {
      setAndFreeze(candidate, 'bind', bind);
    }
    setAndFreeze(
      candidate,
      'name',
      otherPropertyName === 'name'
        ? otherPropertyValue
        : conciseCondition(AbstractContract.namePrefix, implementation)
    );
    // noinspection JSPotentiallyInvalidConstructorUsage
    candidate.prototype = Object.create(impl.prototype, {
      constructor: {value: candidate}
    });
    return candidate as GeneralContractFunction<C>;
  }

  // noinspection ParameterNamingConventionJS
  generateIAGCFTests<ContractC extends typeof AbstractContract, C extends AbstractContract<any, any>>(
    ContractConstructor: ContractC,
    isAXXXContractFunction: (this: ContractC, f: GeneralContractFunction<C>) => boolean
  ) {
    const self = this;

    it(
      'says yes if there is an implementation Function, an AbstractContract, and a location, and all 3 ' +
      'properties are frozen, and it has the expected name',
      function () {
        const candidate: GeneralContractFunction<C> = self.createCandidateContractFunction(ContractConstructor);
        isAXXXContractFunction.call(ContractConstructor, candidate).should.be.ok();
      }
    );

    notAFunctionNorAContract.forEach((thing: any) => {
      it('says no if the argument is not a function, but ' + thing, function () {
        should(isAXXXContractFunction.call(ContractConstructor, thing)).not.be.ok();
      });
    });
    contractFunctionPropertyNames.forEach(doNotFreezeProperty => {
      it(`says no if the ${doNotFreezeProperty} property is not frozen`, function () {
        const candidate: GeneralContractFunction<C> =
          self.createCandidateContractFunction(ContractConstructor, doNotFreezeProperty);
        should(isAXXXContractFunction.call(ContractConstructor, candidate)).not.be.ok();
      });
    });
    ;[
      {
        propertyName: 'contract',
        expected: 'an AbstractContract',
        extra: [function () {
        }]
      },
      {
        propertyName: 'implementation',
        expected: 'a Function',
        extra: [new AbstractContract({})]
      },
      {
        propertyName: 'bind',
        expected: 'AbstractContract.bindContractFunction',
        extra: []
      },
      {
        propertyName: 'name',
        expected: 'the contractFunction.name',
        extra: ['candidate', AbstractContract.namePrefix]
      }
    ].forEach((aCase: {propertyName: typeof contractFunctionPropertyNames[number], expected: string, extra: Array<any>}) => {
      notAFunctionNorAContract.concat(aCase.extra).forEach((v: any) => {
        it('says no if the ' + aCase.propertyName + ' is not ' + aCase.expected + ' but ' + v, function () {
          const candidate = self.createCandidateContractFunction(ContractConstructor, undefined, aCase.propertyName, v);
          should(isAXXXContractFunction.call(ContractConstructor, candidate)).not.be.ok();
        });
      });
    });
  }

  // noinspection FunctionNamingConventionJS, ParameterNamingConventionJS
  generateConstructorMethodsDescriptions(ContractConstructor: typeof AbstractContract) {
    const self = this;

    describe('@isAContractFunction', function () {
      self.generateIAGCFTests(ContractConstructor, ContractConstructor.isAContractFunction);
      notAFunctionNorAContract
        .filter(t => !t || typeof t !== 'string' || t.indexOf(n) >= 0 || t.indexOf(rn) >= 0)
        .concat([{}, AbstractContract.internalLocation])
        .forEach(v => {
          it(`says no if the location is not a location outside this library but ${v}`, function () {
            const candidate = self.createCandidateContractFunction(undefined, 'location', v);
            should(AbstractContract.isAContractFunction(candidate)).not.be.ok();
          });
        });
      notAFunctionNorAContract
        .filter(v => !v)
        .forEach(v => {
          it(`says no if the location is not truthy but ${v}`, function () {
            const candidate = self.createCandidateContractFunction(ContractConstructor, undefined, 'location', v);
            should(ContractConstructor.isAContractFunction(candidate)).not.be.ok();
          });
        });
    });
  }

  // noinspection FunctionNamingConventionJS,JSUnusedLocalSymbols
  generateAbstractContractPrototypeMethodsDescriptions<C extends AbstractContract<any, any>>(
    oneSubjectGenerator: () => C,
    _allSubjectGenerators: Array<() => AbstractContract<any, any>>
  ) {
    const self = this;

    describe('#isImplementedBy()', function () {
      it('says yes if the argument is a general contract function for the contract', function () {
        const subject: C = oneSubjectGenerator();
        const f: GeneralContractFunction<C> =
          self.createCandidateContractFunction(subject.constructor, undefined, 'contract', subject);
        subject.isImplementedBy(f).should.be.ok();
        self.expectInvariants(subject);
      });
      it('says yes to abstract', function () {
        const subject: C = oneSubjectGenerator();
        subject.isImplementedBy(subject.abstract).should.be.ok();
        self.expectInvariants(subject);
      });
      it('says yes to abstract with its own contract', function () {
        const subject: C = oneSubjectGenerator();
        subject.abstract.contract.isImplementedBy(subject.abstract).should.be.ok();
        // MUDO shows a bug elsewhere; see expectInvariants
        // self.expectInvariants(subject.abstract.contract)
      });
      notAFunctionNorAContract.concat(['function() {}']).forEach(function (thing) {
        it(`says no if the argument is not a general contract function but ${thing}`, function () {
          const subject: C = oneSubjectGenerator();
          subject.isImplementedBy(thing).should.not.be.ok();
          self.expectInvariants(subject);
        });
      });
      it('says no if the argument is a contract function for another contract', function () {
        const subject: C = oneSubjectGenerator();
        const otherContract: C = oneSubjectGenerator();
        const f: GeneralContractFunction<C> =
          self.createCandidateContractFunction(undefined, undefined, 'contract', otherContract);
        subject.isImplementedBy(f).should.not.be.ok();
        self.expectInvariants(subject);
      });
    });
  }
}
