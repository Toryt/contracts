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

import AnyAsyncFunction from "./AnyAsyncFunction";
import Precondition from "./Precondition";
import Postcondition from "./Postcondition";
import ExceptionCondition from "./ExceptionCondition";
import ArgumentsWithResult from "./ArgumentsWithResult";
import AnyFunction from "./AnyFunction";
import ContractFunction from "./ContractFunction";
import AbstractContract from "./AbstractContract";
import type {PromiseContractKwargs} from "./PromiseContract";

export as namespace contracts;

export = PromiseContract;

declare class PromiseContract<AF extends AnyAsyncFunction, E extends Error | undefined, FE extends Error | undefined> extends AbstractContract<AF, E, FE> {
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

declare namespace PromiseContract {
  export interface PromiseContractKwargs<AF extends AnyAsyncFunction, E extends Error | undefined, FE extends Error | undefined> {
    pre?: Array<Precondition<AF>>,
    post?: Array<Postcondition<AF, E, FE>>,
    exception?: E extends Error ? Array<ExceptionCondition<AF, E, FE, NonNullable<E>>> : typeof AbstractContract.mustNotHappen,
    fastException?: FE extends Error ? Array<ExceptionCondition<AF, E, FE, NonNullable<FE>>> : typeof AbstractContract.mustNotHappen
  }
  export type AbstractError = AbstractContract.AbstractError;
}



