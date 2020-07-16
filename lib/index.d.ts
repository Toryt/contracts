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


/* TODO: Parameters<F> includes the this parameter at position 0, it seems. But not sure. */

export type AnyFunction = (this: any, ...args: any) => any;

type ArgumentsWithResult<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> = [...Parameters<F>, ReturnType<F>, ContractFunction<F, E, FE>]
type ArgumentsWithException<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined, EXC extends E | FE> = [...Parameters<F>, EXC, ContractFunction<F, E, FE>]

export type Precondition<F extends AnyFunction> = (...args: Parameters<F>) => boolean;
export type Postcondition<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> = (...args: ArgumentsWithResult<F, E, FE>) => boolean;
export type ExceptionCondition<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined, EXC extends NonNullable<E | FE>> = (...args: ArgumentsWithException<F, E, FE, EXC>) => boolean;
export type Condition<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> = Precondition<F> | Postcondition<F, E, FE> | ExceptionCondition<F, E, FE, NonNullable<E | FE>>;

export type AnyAsyncFunction = (this: any, ...args: any) => Promise<any>;

export type GeneralContractFunction<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> = F & {
  readonly name: string;
  readonly contract: AbstractContract<F, E, FE>;
  readonly implementation: F;
  readonly location: string;

 bind(...args: Parameters<F>): GeneralContractFunction<F, E, FE>
}

export type ContractFunction<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> = GeneralContractFunction<F, E, FE> & {
  readonly contract: F extends AnyAsyncFunction ? PromiseContract<F, E, FE> : Contract<F, E>;

  bind(...args: Parameters<F>): ContractFunction<F, E, FE>
}

export class ContractError extends Error {
  static readonly message: string;

  readonly name: string;
  readonly message: string;
  readonly stack: string;

  constructor(rawStack: string);
}

export class ConditionError<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined, C extends Condition<F, E, FE>> extends  ContractError {
  readonly contractFunction: ContractFunction<F, E, FE>;
  readonly condition: C;
  readonly self: Readonly<ThisParameterType<F>>;
  readonly args: Readonly<Parameters<F>>;

  constructor(contractFunction: ContractFunction<F, E, FE>, condition: C, self: ThisParameterType<F>, args: Parameters<F>, rawStack: string);

  getDetails(): string;
}

export class ConditionMetaError<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined, C extends Condition<F, E, FE>> extends ConditionError<F, E, FE, C> {
  readonly error: any;

  constructor(contractFunction: ContractFunction<F, E, FE>, condition: C, self: ThisParameterType<F>, args: Parameters<F>, error: any, rawStack: string);
}

export class ConditionViolation<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined, C extends Condition<F, E ,FE>, A extends Parameters<F> | ArgumentsWithResult<F, E, FE> | ArgumentsWithException<F, E, FE, E | FE>> extends ConditionError<F, E, FE, C> {
  constructor(contractFunction: ContractFunction<F, E, FE>, condition: C, self: ThisParameterType<F>, args: Parameters<F>);

  verifyAll(contractFunction: ContractFunction<F, E, FE>, conditions: ReadonlyArray<C>, self: ThisParameterType<F>, args: A): void;
  verify(contractFunction: ContractFunction<F, E, FE>, condition: C, self: ThisParameterType<F>, args: A): void;
  verifyAllPromise(contractFunction: ContractFunction<F extends AnyAsyncFunction ? F : never, E, FE>, conditions: ReadonlyArray<C>, self: ThisParameterType<F>, args: A): void;
  verifyPromise(contractFunction: ContractFunction<F extends AnyAsyncFunction ? F : never, E, FE>, condition: C, self: ThisParameterType<F>, args: A): void;
}

export class PreconditionViolation<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> extends ConditionViolation<F, E, FE, Precondition<F>, Parameters<F>> {
  constructor(contractFunction: ContractFunction<F, E, FE>, condition: Precondition<F>, self: ThisParameterType<F>, args: Parameters<F>);
}

export class PostconditionViolation<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> extends ConditionViolation<F, E, FE, Postcondition<F, E, FE>, ArgumentsWithResult<F, E, FE>> {
  constructor(contractFunction: ContractFunction<F, E, FE>, condition: Postcondition<F, E, FE>, self: ThisParameterType<F>, args: ArgumentsWithResult<F, E, FE>);

  readonly result: Readonly<ReturnType<F>>;
}

export class ExceptionConditionViolation<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined, EXC extends NonNullable<E | FE>> extends ConditionViolation<F, E, FE, ExceptionCondition<F, E, FE, EXC>, ArgumentsWithException<F, E, FE, EXC>> {
  constructor(contractFunction: ContractFunction<F, E, FE>, condition: ExceptionCondition<F, E, FE, EXC>, self: ThisParameterType<F>, args: ArgumentsWithException<F, E, FE, EXC>);

  readonly exception: Readonly<EXC>;
}

export abstract class AbstractContract<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> {
  static readonly internalLocation: object;
  static readonly namePrefix: string;
  static readonly falseCondition: (this: any, ...args:any) => false;
  static readonly mustNotHappen: ReadonlyArray<(this: any, ...args:any) => false>;
  static readonly root: AbstractContract<AnyFunction, undefined, undefined>;

  static bindContractFunction<CF extends GeneralContractFunction<AnyFunction, Error, Error>>(this: CF): CF;
  static isAGeneralContractFunction(this:void, f: AnyFunction): f is GeneralContractFunction<(...args: Parameters<typeof f>) => ReturnType<typeof f>, Error, Error>;
  static isAContractFunction(f: AnyFunction): f is ContractFunction<(...args: Parameters<typeof f>) => ReturnType<typeof f>, Error, Error>;
  static bless<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined>(this:void, contactFunction: ContractFunction<F, E, FE>, contract: AbstractContract<F, E, FE>, implFunction: F, location: string): void;
  static outcome<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined>(this: any, ...args: ArgumentsWithResult<F, E, FE>): ReturnType<F>;
  static callee<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined>(this: any, ...args: ArgumentsWithResult<F, E, FE> | ArgumentsWithException<F, E, FE, E | FE>): ContractFunction<F, E, FE>;

  readonly pre: ReadonlyArray<Precondition<F>>;
  readonly post: ReadonlyArray<Postcondition<F, E, FE>>;
  readonly exception: ReadonlyArray<ExceptionCondition<F, E, FE, NonNullable<E>>>;
  readonly location: string;
  readonly abstract: ContractFunction<(...args: Parameters<F>) => never , undefined, undefined>;
  verify: boolean;
  verifyPostconditions: boolean;

  protected constructor(kwargs: ContractKwargs<F, E>, location: string);

  isImplementedBy(f: GeneralContractFunction<F, E, FE>): boolean;
  abstract implementation(implFunction: F): ContractFunction<F, E, FE>;
}

export class AbstractError extends ContractError {
  static readonly message: string;

  constructor(contract: AbstractContract<AnyFunction, Error, Error>, rawStack: string);
}

export interface ContractKwargs<F extends AnyFunction, E extends Error | undefined> {
  pre?: Array<Precondition<F>>,
  post?: Array<Postcondition<F, E, undefined>>,
  exception?: E extends Error ? Array<ExceptionCondition<F, E, undefined, NonNullable<E>>> : typeof AbstractContract.mustNotHappen
}

export class Contract<F extends AnyFunction, E extends Error | undefined> extends AbstractContract<F, E, undefined> {
  static readonly falseCondition: typeof AbstractContract.falseCondition;
  static readonly mustNotHappen: typeof AbstractContract.mustNotHappen;
  static readonly root: typeof AbstractContract.root;

  /**
   * @deprecated
   */
  static readonly Promise: typeof PromiseContract['constructor'];

  static readonly isAContractFunction: typeof AbstractContract.isAContractFunction;
  static readonly outcome: typeof AbstractContract.outcome;
  static readonly callee: typeof AbstractContract.callee;

  constructor(kwArgs: ContractKwargs<F, E>);

  implementation (implFunction: F): ContractFunction<F, E, undefined>;
}

export interface PromiseContractKwargs<AF extends AnyAsyncFunction, E extends Error | undefined, FE extends Error | undefined> {
  pre?: Array<Precondition<AF>>,
  post?: Array<Postcondition<AF, E, FE>>,
  exception?: E extends Error ? Array<ExceptionCondition<AF, E, FE, NonNullable<E>>> : typeof AbstractContract.mustNotHappen,
  fastException?: FE extends Error ? Array<ExceptionCondition<AF, E, FE, NonNullable<FE>>> : typeof AbstractContract.mustNotHappen
}

export class PromiseContract<AF extends AnyAsyncFunction, E extends Error | undefined, FE extends Error | undefined> extends AbstractContract<AF, E, FE> {
  static readonly falseCondition: typeof AbstractContract.falseCondition;
  static readonly mustNotHappen: typeof AbstractContract.mustNotHappen;
  static readonly root: typeof AbstractContract.root;

  static resultIsAPromiseCondition<F extends AnyAsyncFunction, E extends Error, FE extends Error>(this: ThisParameterType<F>, ...args: ArgumentsWithResult<F, E, FE>): boolean;
  static isAContractFunction(f: AnyFunction): f is ContractFunction<(...args: Parameters<typeof f>) => ReturnType<typeof f>, any, any>;
  static readonly outcome: typeof AbstractContract.outcome;
  static readonly callee: typeof AbstractContract.callee;

  readonly fastException: ReadonlyArray<ExceptionCondition<AF, E, FE, NonNullable<FE>>>;

  constructor(kwArgs: PromiseContractKwargs<AF, E, FE>);

  implementation (implFunction: AF): ContractFunction<AF, E, FE>;
}



