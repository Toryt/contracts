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

import type {StackLocation, Stack} from "./_private/is";
import type {ContractFunction} from "./ContractFunction";

import {ok, strictEqual} from "assert";
import {frozenOwnProperty, stackLocation, stack} from "./_private/is";
import {setAndFreeze, frozenDerived} from "./_private/property";
import {raw, location as getStackLocation} from "./_private/stack";
import {namePrefix, conciseCondition} from './_private/report';
import ContractError from "./ContractError";

export type AnyFunction = (this: any, ...args: any) => any;

export interface GeneralContractFunctionProps<C extends AbstractContract<any, any>> extends Function {
  readonly contract: C;
  readonly implementation: ContractSignature<C>;
  readonly location: StackLocation;

  bind(thisArg: ThisParameterType<ContractThis<C>>, ...argArray: ContractParameters<C>): GeneralContractFunction<C>
}

export type GeneralContractFunction<C extends AbstractContract<any, any>> =
  ContractSignature<C> & GeneralContractFunctionProps<C>;

export type Precondition<C extends AbstractContract<any, any>> =
  (this: ContractThis<C>, ...args: ContractParameters<C>) => boolean;

export type Postcondition<C extends AbstractContract<any, any>> =
  (this: ContractThis<C>, ...args: [...ContractParameters<C>, ContractResult<C>, GeneralContractFunction<C>]) => boolean;

export type ExceptionCondition<C extends AbstractContract<any, any>> =
  (this: ContractThis<C>, ...args: [...ContractParameters<C>, ContractExceptions<C>, GeneralContractFunction<C>]) => boolean;

export type PECondition<C extends AbstractContract<any, any>> =
  Postcondition<C> | ExceptionCondition<C>;

export type Condition<C extends AbstractContract<any, any>> =
  Precondition<C> | PECondition<C>;

export type ConditionContract<B extends Condition<any>> = B extends Condition<infer C> ? C : never;
export type ConditionThis<B extends Condition<any>> = ContractThis<ConditionContract<B>>;
export type PreconditionArguments<B extends Condition<any>> = ContractParameters<ConditionContract<B>>;
export type PostconditionArguments<B extends Condition<any>> = [
  ...ContractParameters<ConditionContract<B>>,
  ContractResult<ConditionContract<B>>,
  GeneralContractFunction<ConditionContract<B>>
];
export type ExceptionConditionArguments<B extends Condition<any>> = [
  ...ContractParameters<ConditionContract<B>>,
  ContractExceptions<ConditionContract<B>>,
  GeneralContractFunction<ConditionContract<B>>
];
export type PEConditionArguments<B extends PECondition<any>> =
  B extends Postcondition<any>
    ? PostconditionArguments<B>
    : B extends ExceptionCondition<any>
      ? ExceptionConditionArguments<B>
      : never;
export type PEConditionOutcome<B extends PECondition<any>> =
  B extends Postcondition<any>
    ? ContractResult<ConditionContract<B>>
    : B extends ExceptionCondition<any>
      ? ContractExceptions<ConditionContract<B>>
      : never;
export type ConditionArguments<B extends Condition<any>> =
  B extends Precondition<any>
    ? PreconditionArguments<B>
    : B extends Postcondition<any>
      ? PostconditionArguments<B>
      : B extends ExceptionCondition<any>
        ? ExceptionConditionArguments<B>
        : never;

/**
 * Function that always returns <code>false</code>.
 */
export const falseCondition: Condition<any> = function falseCondition (): false {
  return false;
};

/**
 * Singleton array of {@linkplain AbstractContract#falseCondition}. Can be used the clearly signal
 * that a function should never throw exceptions, or never end nominally, or should never be called,
 * because the conditions will always fail.
 */
export const mustNotHappen: ReadonlyArray<Condition<any>> = Object.freeze([falseCondition]);

/**
 * Thrown when an abstract method is called. You shouldn't.
 */
export class AbstractError extends ContractError {
  static readonly message: string = 'an abstract function cannot be executed';

  readonly contract: AbstractContract<any, any>;

  constructor (contract: AbstractContract<any, any>, rawStack: Stack) {
    super(rawStack);

    // noinspection SuspiciousTypeOfGuard
    ok(contract instanceof AbstractContract, 'contract is an AbstractContract');
    ok(stack(rawStack), 'rawStack is a stack');

    setAndFreeze(this, 'name', AbstractError.name);
    setAndFreeze(this, 'message', AbstractError.message);
    this.contract = contract;
  }
}

setAndFreeze(AbstractError.prototype, 'name', AbstractError.name);
setAndFreeze(AbstractError.prototype, 'message', AbstractError.message);

export interface AbstractContractKwargs<F extends AnyFunction, Exceptions> {
  pre?: ReadonlyArray<Precondition<AbstractContract<F, Exceptions>>>,
  post?: ReadonlyArray<Postcondition<AbstractContract<F, Exceptions>>>,
  exception?: ReadonlyArray<ExceptionCondition<AbstractContract<F, Exceptions>>>
}

function isOrHasAsPrototype (obj: {}, proto: {}): boolean {
  return obj === proto || (obj !== Object.prototype && isOrHasAsPrototype(Object.getPrototypeOf(obj), proto));
}

/**
 * Abstract definition of a function contract.
 *
 * An AbstractContract consists of an array of preconditions, an array of nominal postconditions,
 * and an array of exceptional postconditions.
 *
 * The conditions are functions whose result is interpreted as a booleany value.
 * The conditions are called with the same `this` and arguments as the functional call in which they are
 * verified. When verifying nominal postconditions, the result of the function call is added as extra argument.
 * When verifying exceptional postconditions, the exception thrown by the function call is added as extra argument.
 * Finally, a version of the contract function bound to `this` is supplied as final parameter when verifying
 * nominal and exceptional postconditions. This function reference can be used in contracts that use recursion.
 * `.outcome`, and `.callee` can be used to extract the result or exception (outcome) or bound function for recursive
 * definitions inside conditions from `arguments`.
 *
 * The default preconditions and postconditions are the empty array (anything goes). For exceptions, the default
 * condition is `AbstractContract.mustNotHappen` (any exception is a violation).
 *
 * Furthermore, an instance contains a `location` property, which is a line of text
 * that refers to the source code where the contract was created. For internal contracts, this is
 * `AbstractContract.internalLocation.
 *
 * If `verify` and `verifyPostconditions` are both truthy, contract function verification will verify preconditions,
 * postconditions and exception conditions. If `verify` is truthy, but `verifyPostconditions` is falsy, contract
 * function verification will verify preconditions, but not postconditions and exception conditions. This is the
 * default. If `verify` is falsy, contract function executions will not be verified.
 *
 * The `contract` of a contract function is a separate object that has the contract it is an implementation of as a
 * prototype. Therefor, the `verify` and `verifyPostconditions` properties can be overridden for all
 * `AbstractContracts` by changing the properties of `AbstractContracts.prototype`, for one contract by changing its
 * properties, or for a particular contract function `cf` by changing the properties of `cf.contract`. The values
 * the properties hold at the moment of the call are used (this is relevant for asynchronous functions).
 *
 * With well-tested code, the default settings should be used in production. When the code is extremely stable,
 * `verify` can be set to `false` to gain additional speed. In tests, `verify` should be truthy and
 * `verifyPostconditions` should be `true`, at least for the function under test.
 *
 * The `_location` argument is for internal use, and might be removed.
 */
export default class AbstractContract<F extends AnyFunction, Exceptions> {
  /**
   * Object to be used as location for contracts and implementations that are generated inside this library.
   */
  static readonly internalLocation: object = Object.freeze({
    toString: function () {
      return 'INTERNAL';
    }
  });

  static readonly namePrefix: string = namePrefix;

  readonly _pre: ReadonlyArray<Precondition<AbstractContract<F, Exceptions>>>;
  readonly _post: ReadonlyArray<Postcondition<AbstractContract<F, Exceptions>>>;
  readonly _exception: ReadonlyArray<ExceptionCondition<AbstractContract<F, Exceptions>>>;
  readonly location: StackLocation | typeof AbstractContract.internalLocation;
  readonly abstract: GeneralContractFunction<AbstractContract<F, Exceptions>>;

  verify: boolean = true;
  verifyPostconditions: boolean = false;

  constructor(
    kwargs: AbstractContractKwargs<F, Exceptions>,
    _location?: StackLocation | typeof AbstractContract.internalLocation
  ) {
    ok(kwargs);
    ok(!kwargs.pre || Array.isArray(kwargs.pre), 'optional kwargs.pre is an array');
    ok(!kwargs.post || Array.isArray(kwargs.post), 'optional kwargs.post is an array');
    ok(!kwargs.exception || Array.isArray(kwargs.exception), 'optional kwargs.exception is an array');
    ok(
      !_location || _location === AbstractContract.internalLocation || typeof _location === 'string',
      'optional private _location is internal or a string'
    );

    const self: AbstractContract<F, Exceptions> = this;

    /* This cannot be defined in the prototype. The `self` is the contract, not the `this`. When this function is called
       as a method of a random object, that random object is the `this`, not this contract. */
    const abstract: F = function abstract(): ReturnType<F> {
      throw new AbstractError(self, raw());
    } as F;

    const location = _location || getStackLocation(1);
    this._pre = Object.freeze(kwargs.pre ? kwargs.pre.slice() : []);
    this._post = Object.freeze(kwargs.post ? kwargs.post.slice() : []);
    this._exception = Object.freeze(kwargs.exception ? kwargs.exception.slice() : mustNotHappen);
    this.location = Object.freeze(location);
    this.abstract = bless<AbstractContract<F, Exceptions>>(abstract, self, abstract, location);
  }

  isImplementedBy (f: any): f is GeneralContractFunction<AbstractContract<F, Exceptions>> {
    return isAGeneralContractFunction<AbstractContract<F, Exceptions>>(f) && isOrHasAsPrototype(f.contract, this);
  }

  get pre(): Array<Precondition<AbstractContract<F, Exceptions>>> { // not ReadonlyArray: we have sliced
    return this._pre.slice();
  }

  get post(): Array<Postcondition<AbstractContract<F, Exceptions>>> { // not ReadonlyArray: we have sliced
    return this._post.slice();
  }

  get exception(): Array<ExceptionCondition<AbstractContract<F, Exceptions>>> { // not ReadonlyArray: we have sliced
    return this._exception.slice();
  }
}

AbstractContract.prototype.verify = true;
AbstractContract.prototype.verifyPostconditions = false;

export type ContractSignature<C extends AbstractContract<any, any>> =
  C extends AbstractContract<infer F, any> ? F : never;
export type ContractThis<C extends AbstractContract<any, any>> = ThisParameterType<ContractSignature<C>>;
export type ContractParameters<C extends AbstractContract<any, any>> = Parameters<ContractSignature<C>>;
export type ContractResult<C extends AbstractContract<any, any>> = ReturnType<ContractSignature<C>>;
export type ContractExceptions<C extends AbstractContract<any, any>> =
  C extends AbstractContract<any, infer Exceptions> ? Exceptions : never;

/**
 * This function is intended to be used as the bind function of contract functions. It makes sure
 * that, when applied to a contract function, the result
 * [is also a contract function]{@linkplain isAGeneralContractFunction}.
 * The bind aspect of the functionality is the same as {@link Function#prototype#bind}.
 * The implementation of the resulting contract function is also bound in the same
 * way as the resulting contract function itself.
 */
const bindContractFunction = function bind<C extends AbstractContract<any, any>> (
  this: GeneralContractFunction<C>,
  thisArg: ContractThis<C>,
  ...argArray: ContractParameters<C>
): GeneralContractFunction<C> {
  ok(isAGeneralContractFunction(this), 'this is a general contract function');

  const bound: ContractSignature<C> = Function.prototype.bind.apply(this, [thisArg, ...argArray]);
  const boundImplementation: ContractSignature<C> =
    Function.prototype.bind.apply(this.implementation, [thisArg, ...argArray]);
  frozenDerived(boundImplementation, 'name', () => conciseCondition('bound', this.implementation));
  return bless<C>(bound, this.contract, boundImplementation, this.location);
};

/**
 * A General Contract Function is an implementation of an AbstractContract. This function verifies whether a function
 * given as a parameter is a General Contract Function.
 *
 * To be a General Contract Function, the subject must
 * <ul>
 *   <li>be a function,</li>
 *   <li>have a frozen `contract` property that refers to a AbstractContract,</li>
 *   <li>have a frozen `implementation` property that refers to a function (which realizes the contract),</li>
 *   <li>have a frozen `location` property, that has a value,</li>
 *   <li>have a frozen `bind` property, which is {@link bindContractFunction}, and</li>
 *   <li>have a `name`, which is a string that gives information for a programmer to understand which contract
 *     function this is, and</li>
 *   <li>if the `implementation` function has a `prototype`, have a `prototype` property,
 *     <ul>
 *       <li>that is an object,</li>
 *       <li>that has a `constructor` property that is the contract function, and</li>
 *       <li>that has `f.implementation.prototype` in its prototype chain, or is equal to it.
 *     </ul>
 *   </li>
 */
export function isAGeneralContractFunction <C extends AbstractContract<any, any>> (
  this: void,
  f: ContractSignature<C>
): f is GeneralContractFunction<C> {
  // Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot
  // freeze it, and not guaranteed in all engines.
  return (
    typeof f === 'function' &&
      frozenOwnProperty(f, 'contract') &&
      (f as any).contract instanceof AbstractContract &&
      frozenOwnProperty(f, 'implementation') &&
      typeof (f as any).implementation === 'function' &&
      frozenOwnProperty(f, 'location') &&
      (f as any).location &&
      (f === (f as any).implementation ||
        f.name === conciseCondition(AbstractContract.namePrefix, (f as any).implementation)) &&
      frozenOwnProperty(f, 'bind') &&
      f.bind === bindContractFunction &&
      (!Object.prototype.hasOwnProperty.call((f as any).implementation, 'prototype') ||
        (typeof f.prototype === 'object' &&
          f.prototype.constructor === f &&
          (f.prototype === (f as any).implementation.prototype || f.prototype instanceof (f as any).implementation)))
  );
}

/**
 * Helper function that transforms any function given as <code>contractFunction</code>
 * into a [contract function]{@linkplain AbstractContract#isAContractFunction}
 * for the given parameters.
 * If {@code implFunction.prototype} exists, the {@code contractFunction.prototype} is changed to
 * an object that refers to {@code contractFunction} as {@code contractFunction.prototype.constructor},
 * is otherwise empty, and has {@code implFunction.prototype} as prototype.
 *
 * @param contractFunction {Function} the regular {Function} to be transformed into a contract function
 * @param contract {AbstractContract} the contract <code>contractFunction</code> is a realisation of
 * @param implFunction {Function} the function that is used in <code>contractFunction</code>
 *                     to realize the postconditions of <code>contract</code> under its preconditions
 * @param location {String} the location outside this library that the resulting
 *                          [contract function]{@linkplain AbstractContract#isAContractFunction} will carry,
 *                          that says where it is defined.
 */
export function bless <C extends AbstractContract<any, any>> (
  this: void,
  contractFunction: ContractSignature<C>,
  contract: C,
  implFunction: ContractSignature<C>,
  location: StackLocation | typeof AbstractContract.internalLocation
): GeneralContractFunction<C> {
  strictEqual(typeof contractFunction, 'function');
  ok(!(contractFunction as any).contract);
  ok(!(contractFunction as any).implementation);
  ok(!(contractFunction as any).location);
  strictEqual(contractFunction.bind, Function.prototype.bind);
  ok(contract instanceof AbstractContract, 'contract is an AbstractContract');
  strictEqual(typeof implFunction, 'function');
  ok(
    location === AbstractContract.internalLocation || stackLocation(location),
    'location is internal, or a stack location'
  );

  setAndFreeze(contractFunction, 'contract', Object.create(contract));
  setAndFreeze(contractFunction, 'implementation', implFunction);
  setAndFreeze(contractFunction, 'location', location);
  setAndFreeze(contractFunction, 'bind', bindContractFunction);
  if (contractFunction !== implFunction) {
    /* `abstract` refers to itself as implementation; we do not change its name (it would create a circular name
       definition) */
    // IDEA defend code against more complex circular structure
    /* NOTE: This test should be implFunction.hasOwnProperty('prototype'). However, in Safari on iOS, tests show that
             'most of the time' this prototype is not set in our tests, as it should be. It seems to depend on the
             complexity of the function, and to be set 'late' (because it is there in isAGeneralContractFunction). If a
             log command is added, the prototype is set early enough. To work around this, this test is replaced with
             !!implFunction.prototype. This defaults to the prototype set in Function.prototype, which is an Object.
             This means we now replace the contractFunction prototype more often than needed, but that is not a
             functional problem. */
    if (implFunction.prototype && typeof implFunction.prototype === 'object') {
      contractFunction.prototype = Object.create(implFunction.prototype);
      setAndFreeze(contractFunction.prototype, 'constructor', contractFunction);
      // the following line is added to work around an issue in Safari on iOS. See 4ed9879c6b5544b174ae0825d7f7055fd5e147d8
      ok(
        Object.getPrototypeOf(contractFunction.prototype) === implFunction.prototype,
        'contractFunction prototype is set to extend implFunction.prototype'
      );
    }
    /* The name of the contract function will always be 'contractFunction', because we need to define it in
      `Contract.implementation`, because we need to refer to the contract function internally. We would like the result
      of `Contract.implementation` to get a name inferred from its syntactic position, but cannot happen: before
      we reach the 'syntactic position' (a.k.a, we assign the contract function to a variable or property with
      a name), it will already have the name `contractFunction` we need internally. Therefor, we will explicitly set
      the name, based on the name of implementation function.
      The Firefox feature `displayName` will not be used.
      This is a real property, and not a derived property. Earlier, it was, but this was changed in response to
      https://github.com/sinonjs/sinon/issues/2203 */
    // IDEA we might also add a name property to a Contract, and combine it with that
    const implNamePropertyDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(implFunction, 'name');
    ok(implNamePropertyDescriptor);
    Object.defineProperty(contractFunction, 'name', {
      configurable: implNamePropertyDescriptor.configurable,
      enumerable: implNamePropertyDescriptor.enumerable,
      writable: implNamePropertyDescriptor.writable,
      value: conciseCondition(namePrefix, implFunction)
    });
  }
  return contractFunction;
}

/**
 * Returns the second-to-last element of an Array-like argument. In post- and exception conditions,
 * this is the function call result, respectively, the thrown exception.
 */
export function outcome<B extends Condition<any>> (this: any, ...args: ConditionArguments<B>): PEConditionOutcome<B> {
  ok(args);
  ok(Array.isArray(args) || typeof (args as any).length === 'number', 'args is Array or arguments');
  // NOTE: it is not possible to fully test for an arguments object in strict mode
  ok(args.length >= 2, 'args has at least 2 elements');

  return args[args.length - 2];
}

/**
 * Returns the last element of an Array-like argument. In post- and exception conditions,
 * this is the called contract function, bound to this. This can be used in recursive definitions.
 */
export function callee<B extends Condition<any>> (
  this: void,
  ...args: ConditionArguments<B>
): GeneralContractFunction<ConditionContract<B>> {
  ok(args);
  ok(Array.isArray(args) || typeof (args as any).length === 'number', 'args is Array or arguments');
  // NOTE: it is not possible to fully test for an arguments object in strict mode
  ok(args.length >= 2, 'args has at least 2 elements'); // stronger than absolutely necessary

  return args[args.length - 1];
}

/**
 * The most general function AbstractContract. This has the most strict preconditions (nothing is allowed), which can
 * be weakened by specializations, and the most general nominal and exceptional postconditions (anything goes),
 * which can be strengthened by specializations.
 */
export const root: AbstractContract<AnyFunction, any> = new AbstractContract(
  {
    pre: mustNotHappen,
    post: [],
    exception: []
  },
  AbstractContract.internalLocation
);

/**
 * A Contract Function is an implementation of a Contract. This function verifies whether a function
 * given as a parameter is a Contract Function.
 *
 * To be a Contract Function, the subject must
 * <ul>
 *   <li>be a [general contract function]{@linkplain #isAGeneralContractFunction()},</li>
 *   <li>have a frozen `location` property, which is a string that represents a location in source code,
 *     outside this library.</li>
 * </ul>
 */
export function isAContractFunction<F extends AnyFunction, Exceptions, C extends Function> (this: C, f: any): f is ContractFunction<F, Exceptions> {
  return isAGeneralContractFunction(f) && f.contract instanceof this && stackLocation(f.location);
}

