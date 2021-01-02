/*
 Copyright 2021 - 2021 by Jan Dockx

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

import { ConditionError } from '../lib/ConditionError'
import { expectAssignable, expectError, expectType } from 'tsd'
import { ContractError } from '../lib/ContractError'
import { aB, aCallableGeneralContractFunction, anA } from './subjects'
import { GeneralContractFunction } from '../lib/GeneralContractFunction'
import { AnyFunction } from '../lib/AnyFunction'
import { Condition } from '../lib/Condition'

const aConditionError = new ConditionError(
  aCallableGeneralContractFunction,
  args => 0,
  undefined,
  [1, anA, {}, [aB]],
  'a raw stack'
)

expectType<ConditionError>(aConditionError)
expectAssignable<ContractError>(aConditionError)
expectAssignable<Error>(aConditionError)

expectType<GeneralContractFunction<AnyFunction, unknown>>(aConditionError.contractFunction)

expectType<string>(aConditionError.name)
expectType<string>(aConditionError.message)
expectType<string>(aConditionError.stack)
expectError(aConditionError.name = 'another name')
expectError(aConditionError.message = 'another message')
expectError(aConditionError._rawStack = 'another raw stack')
expectError(aConditionError.stack = 'another stack')

expectType<GeneralContractFunction<AnyFunction, unknown>>(aConditionError.contractFunction)
expectType<Condition>(aConditionError.condition)
expectType<object | undefined>(aConditionError.self)
expectType<ReadonlyArray<unknown>>(aConditionError._args)
expectType<Array<unknown>>(aConditionError.args)
expectError(aConditionError.contractFunction = anotherContractFunction)
expectError(aConditionError.condition = () => false)
expectError(aConditionError.self = {})
expectError(aConditionError._args = [1, 4])
expectError(aConditionError.args = [1, 4])

expectType<string>(aConditionError.getDetails())
