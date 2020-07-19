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

import AnyFunction from "./AnyFunction";
import GeneralContractFunction from "./GeneralContractFunction";
import ContractFunction from "./ContractFunction";
import ArgumentsWithResult from "./ArgumentsWithResult";
import ArgumentsWithException from "./ArgumentsWithException";
import Precondition from "./Precondition";
import Postcondition from "./Postcondition";
import ExceptionCondition from "./ExceptionCondition";
import ContractError from "./ContractError";
import type {AbstractContractKwargs} from "./AbstractContract";

export as namespace contracts;

export = AbstractContract;

declare abstract class AbstractContract<F extends AnyFunction, E extends Error | undefined, FE extends Error | undefined> {
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

  protected constructor(kwargs: AbstractContractKwargs<F, E>, location: string);

  isImplementedBy(f: GeneralContractFunction<F, E, FE>): boolean;
  abstract implementation(implFunction: F): ContractFunction<F, E, FE>;
}

declare namespace AbstractContract {
  export class AbstractError extends ContractError {
    static readonly message: string;

    constructor(contract: AbstractContract<AnyFunction, Error, Error>, rawStack: string);
  }

  export interface AbstractContractKwargs<F extends AnyFunction, E extends Error | undefined> {
    pre?: Array<Precondition<F>>,
    post?: Array<Postcondition<F, E, undefined>>,
    exception?: E extends Error ? Array<ExceptionCondition<F, E, undefined, NonNullable<E>>> : typeof AbstractContract.mustNotHappen
  }
}
