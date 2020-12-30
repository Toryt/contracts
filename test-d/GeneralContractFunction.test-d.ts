/*
 Copyright 2020 - 2020 by Jan Dockx

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

import { AbstractContract, GeneralContractFunction, InternalLocation, StackLocation } from '../types'
import { SomeObject, AFunction1, SomeError, aFunction1 } from './subjects'
import { expectAssignable, expectType } from 'tsd'

function aGeneralContractFunction (this: SomeObject, a: string, b: number): string { return this.aProperty + a + b }
aGeneralContractFunction.contract = new AbstractContract({})
aGeneralContractFunction.implementation = aFunction1
aGeneralContractFunction.location = AbstractContract.internalLocation
Object.defineProperty(aGeneralContractFunction, 'name', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: 'a general contract function name'
})

expectAssignable<GeneralContractFunction<AFunction1, SomeError>>(aGeneralContractFunction)
expectAssignable<AFunction1>(aGeneralContractFunction)
expectType<AbstractContract<AFunction1, SomeError>>(aGeneralContractFunction.contract)
expectType<AFunction1>(aGeneralContractFunction.implementation)
expectType<InternalLocation>(aGeneralContractFunction.location)
expectAssignable<StackLocation | InternalLocation>(aGeneralContractFunction.location)
expectType<string>(aGeneralContractFunction.name)

let aGeneralContractFunctionB: GeneralContractFunction<AFunction1, SomeError> = aGeneralContractFunction
expectType<GeneralContractFunction<AFunction1, SomeError>>(aGeneralContractFunctionB)
expectAssignable<AFunction1>(aGeneralContractFunctionB)
expectType<AbstractContract<AFunction1, SomeError>>(aGeneralContractFunctionB.contract)
expectType<AFunction1>(aGeneralContractFunctionB.implementation)
expectType<StackLocation | InternalLocation>(aGeneralContractFunctionB.location)
expectType<string>(aGeneralContractFunctionB.name)
