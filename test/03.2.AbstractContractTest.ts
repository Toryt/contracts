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

import * as should from "should";
import {location as stackLocation} from "../lib/_private/stack";
import AbstractContract, {
  bindContractFunction,
  bless, callee, ExceptionCondition,
  falseCondition, GeneralContractFunction,
  isAGeneralContractFunction, mustNotHappen, outcome, PECondition, Postcondition, Precondition,
  root
} from "../lib/AbstractContract";
import {
  common, constructorExceptionCases, constructorPostCases, constructorPreCases,
  notAFunctionNorAContract as thingsThatAreNotAFunctionNorAContract
} from "./AbstractContractCommon";
import {expectOwnFrozenProperty, x} from "./_util/testUtil";
import {conciseCondition} from "../lib/_private/report";
import type {StackLocation} from "../lib/_private/is";
import {ok} from "assert";

describe('AbstractContract', function () {
  describe('falseCondition', function () {
    it('is a function', function () {
      falseCondition.should.be.a.Function();
    });
    it('returns false', function () {
      falseCondition().should.be.false();
    });
  });

  describe('mustNotHappen', function () {
    it('is an array of falseCondition', function () {
      mustNotHappen.should.be.an.Array();
      mustNotHappen.should.have.length(1);
      mustNotHappen[0].should.equal(falseCondition);
    });
  });

  // AbstractError has separate test

  describe('AbstractContract', function () {
    it('has the expected properties', function () {
      AbstractContract.should.have.ownProperty('namePrefix');
      AbstractContract.namePrefix.should.be.a.String();
      AbstractContract.should.have.ownProperty('isAContractFunction');
      AbstractContract.isAContractFunction.should.be.a.Function();
      AbstractContract.should.have.ownProperty('internalLocation');
      AbstractContract.internalLocation.should.be.an.Object();
      ;('' + AbstractContract.internalLocation).should.be.equal('INTERNAL');
      const prototype = AbstractContract.prototype;
/* MUDO
      should(prototype._pre).be.null();
      should(prototype._post).be.null();
      should(prototype._exception).be.null();
      // noinspection JSUnresolvedVariable;
      prototype.location.should.equal(AbstractContract.internalLocation);
      // noinspection JSUnresolvedVariable;
      should(prototype.abstract).be.null();
*/
      prototype.isImplementedBy.should.be.a.Function();
    });
  });

  describe('bindContractFunction', function () {
    it('is a function', function() {
      bindContractFunction.should.be.a.Function();
    });
    it('behaves as expected', function () {
      const subject: GeneralContractFunction<any> = common.createCandidateContractFunction(AbstractContract);
      const result: GeneralContractFunction<any> = bindContractFunction.apply(subject);
      isAGeneralContractFunction(result).should.be.true();
      Object.getPrototypeOf(result.contract).should.equal(subject.contract);
      result.location.should.equal(subject.location);
      AbstractContract.isAContractFunction(result).should.be.true();
      subject.contract.isImplementedBy(result).should.be.true();
    });
  });

  describe('isAGeneralizedContractFunction', function () {
    common.generateIAGCFTests(AbstractContract, isAGeneralContractFunction);
    thingsThatAreNotAFunctionNorAContract
      .filter((v: any): boolean => !!v)
      .concat(['    at', 'at /', {}, AbstractContract.internalLocation])
      .forEach((v: any): void => {
        it(
          'says yes if there is an implementation Function, an AbstractContract, and a location that is ' +
            v +
            ', and all 3 properties are frozen, and it has the expected name',
          function () {
            const candidate: GeneralContractFunction<any> = common.createCandidateContractFunction(AbstractContract, undefined, 'location', v);
            isAGeneralContractFunction(candidate).should.be.ok();
          }
        );
      });
  });

  common.generateConstructorMethodsDescriptions(AbstractContract);

  describe('bless', function () {
    it('is a function', function() {
      bless.should.be.a.Function();
    });
    it('behaves as expected', function () {
      const contractFunctionBase = function () {};
      type F = typeof contractFunctionBase;
      type C = AbstractContract<F, any>;
      const contract: C = new AbstractContract<F, any>({});
      const implFunction: F = function () {};
      const location: StackLocation = stackLocation();
      should(implFunction.prototype).be.an.Object() ;// this is here because Safari on iOS doesn't do this always!; by doing this test, the prototype is forced in Safari on iOS
      const contractFunction: GeneralContractFunction<C> =
        bless<C>(contractFunctionBase, contract, implFunction, location);
      AbstractContract.isAContractFunction(contractFunction).should.be.true();
      expectOwnFrozenProperty(contractFunction, 'contract');
      Object.getPrototypeOf(contractFunction.contract).should.equal(contract);
      expectOwnFrozenProperty(contractFunction, 'implementation');
      contractFunction.implementation.should.equal(implFunction);
      expectOwnFrozenProperty(contractFunction, 'location');
      contractFunction.location.should.equal(location);
      expectOwnFrozenProperty(contractFunction, 'bind');
      contractFunction.bind.should.equal(bindContractFunction);
      contractFunction.should.have.ownProperty('name');
      contractFunction.name.should.equal(
        conciseCondition(AbstractContract.namePrefix, contractFunction.implementation)
      );
      const implFunctionNamePropDesc: PropertyDescriptor | undefined =
        Object.getOwnPropertyDescriptor(implFunction, 'name');
      should(implFunctionNamePropDesc).be.ok();
      ok(implFunctionNamePropDesc);
      delete implFunctionNamePropDesc.value;
      const contractFunctionNamePropDesc: PropertyDescriptor | undefined =
        Object.getOwnPropertyDescriptor(contractFunction, 'name');
      should(contractFunctionNamePropDesc).be.ok();
      ok(contractFunctionNamePropDesc);
      contractFunctionNamePropDesc.value.should.equal(
        conciseCondition(AbstractContract.namePrefix, contractFunction.implementation)
      );
      delete contractFunctionNamePropDesc.value;
      contractFunctionNamePropDesc.should.deepEqual(implFunctionNamePropDesc);
    });
  });

  type R = string;
  const argsResult: R = 'a result';
  type P = [string, string, number];
  type F = (this: void, ...args: P) => R;
  type C = AbstractContract<F, any>;
  const contract = new AbstractContract<F, any>({});
  type GCF = GeneralContractFunction<C>;
  const argsCallee: GCF = bless<C>(
    function (this: void, _a: string, _b: string, _c: number) { return 'something'; },
      contract,
    function(this: void, _a: string, _b?: string) { return 'something else'; },
    'a stack location'
    );
  type ConditionArgs = [...P, R, GCF];
  const argsCase: ConditionArgs = ['lala', 'lulu', 4, argsResult, argsCallee];
  function args (..._args: ConditionArgs): IArguments & ConditionArgs {
    return arguments as IArguments & ConditionArgs;
  }
  type ArgsCase = {a: ConditionArgs, d: string};
  const argsCases: Array<ArgsCase> = [
    { a: argsCase, d: 'array' },
    { a: args.apply(null, argsCase), d: 'arguments' }
  ];

  describe('outcome', function () {
    it('is a function', function () {
      outcome.should.be.a.Function();
    });
    argsCases.forEach((c: ArgsCase) => {
      it(`returns the expected element for an ${c.d} argument`, function () {
        const result: R = outcome<PECondition<C>>(c.a);
        result.should.equal(argsResult);
      });
    });
  });

  describe('callee', function () {
    it('is a function', function () {
      callee.should.be.a.Function();
    });
    argsCases.forEach((c: ArgsCase) => {
      it(`returns the expected element for an ${c.d} argument`, function () {
        const result: GCF = callee<PECondition<C>>(c.a);
        result.should.equal(argsCallee);
      });
    });
  });

  describe('root', function () {
    it('is an AbstractContract', function () {
      root.should.be.an.instanceof(AbstractContract);
      common.expectInvariants(root);
      root.pre.should.have.length(1);
      root.pre[0].should.equal(falseCondition);
      root.post.should.be.empty();
      root.exception.should.be.empty();
      root.location.should.equal(AbstractContract.internalLocation);
    });
  });

  describe('#AbstractContract()', function () {
    constructorPreCases.forEach((pre: (this: void) => Array<Precondition<any>> | null | undefined): void => {
      constructorPostCases.forEach((post: (this: void) => Array<Postcondition<any>> | null | undefined): void => {
        constructorExceptionCases.forEach((exception: (this: void) => Array<ExceptionCondition<any>> | null | undefined): void => {
          it('works for pre: ' + pre + ', post: ' + post + ', exception: ' + exception, function () {
            const preConditions: Array<Precondition<any>> | null | undefined = pre();
            const postConditions: Array<Postcondition<any>> | null | undefined = post();
            const exceptionConditions: Array<ExceptionCondition<any>> | null | undefined  = exception();
            const result = new AbstractContract({
              pre: preConditions,
              post: postConditions,
              exception: exceptionConditions
            });
            common.expectAbstractContractConstructorPost(
              preConditions,
              postConditions,
              exceptionConditions,
              stackLocation(),
              result
            );
          });
        });
      });
    });
  });

  common.generateAbstractContractPrototypeMethodsDescriptions(
    () => new AbstractContract({}),
    x(constructorPreCases, constructorPostCases, constructorExceptionCases)
      .map((parameters) => ({
        subject: () =>
          new AbstractContract({
            pre: parameters[0](),
            post: parameters[1](),
            exception: parameters[2]()
          }),
        description: parameters.join(' - ')
      }))
  );
});
