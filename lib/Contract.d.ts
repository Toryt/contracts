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
import ContractFunction from "./ContractFunction";
import AbstractContract, {AbstractContractKwargs as ContractKwargs} from "./AbstractContract";
import PromiseContract from "./PromiseContract";

export = Contract;

declare class Contract<F extends AnyFunction, E extends Error | undefined> extends AbstractContract<F, E, undefined> {
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

declare namespace Contract {
  export type AbstractError = AbstractContract.AbstractError;
}
