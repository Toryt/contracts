/*
  Copyright 2025 Jan Dockx

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

import { expectAssignable, expectNotAssignable, expectType } from 'tsd'
import type { NeverFunction, UnknownFunction } from '../../../src/index.ts'
import { ContractError } from '../../../src/ContractError.ts'
import { AbstractError, BaseFunctionContract, type FunctionContractKwargs } from '../../../src/BaseFunctionContract.ts'
import { location } from '../../../src/location.ts'
import { rawStack } from '../../../src/private/stack.ts'
import { aNeverFunction } from '../../../test2/util/SomeSignatures.ts'

class AFunctionContract<Signature extends (a: number, b: string) => boolean> extends BaseFunctionContract<
  Signature,
  string
> {
  constructor(kwargs: FunctionContractKwargs<Signature>) {
    super(kwargs, location(1))
  }
}
const aFunction = (a: number): boolean => true

expectAssignable<UnknownFunction>(aFunction)
expectAssignable<(a: number, b: string) => boolean>(aFunction)
expectAssignable<(a: number, b: string) => boolean>(aNeverFunction)
expectAssignable<(a: number, b: string) => boolean>(undefined as never)
expectNotAssignable<NeverFunction>(aFunction)
expectNotAssignable<never>(aFunction)

const afc = new AFunctionContract<typeof aFunction>({})

const abstractError = new AbstractError(afc, rawStack())

expectAssignable<ContractError>(abstractError)

expectType<AFunctionContract<typeof aFunction>>(abstractError.contract)

expectAssignable<BaseFunctionContract<UnknownFunction, string>>(abstractError.contract)
expectAssignable<BaseFunctionContract<(a: number, b: string) => boolean, string>>(abstractError.contract)
expectAssignable<AFunctionContract<(a: number, b: string) => boolean>>(abstractError.contract)
expectAssignable<BaseFunctionContract<typeof aFunction, string>>(abstractError.contract)
expectAssignable<AFunctionContract<typeof aFunction>>(abstractError.contract)
expectAssignable<unknown>(abstractError.contract)

expectAssignable<typeof aFunction>(undefined as unknown as (a: number) => never)
expectAssignable<AFunctionContract<typeof aFunction>>(undefined as unknown as AFunctionContract<(a: number) => never>)
expectAssignable<AFunctionContract<typeof aFunction>>(undefined as unknown as AFunctionContract<() => boolean>)
expectAssignable<AFunctionContract<typeof aFunction>>(undefined as unknown as AFunctionContract<() => never>)
expectAssignable<AFunctionContract<typeof aFunction>>(undefined as unknown as AFunctionContract<never>)

expectNotAssignable<AFunctionContract<() => boolean>>(abstractError.contract)
expectNotAssignable<AFunctionContract<(a: number) => never>>(abstractError.contract)
expectNotAssignable<BaseFunctionContract<NeverFunction, string>>(abstractError.contract)
expectNotAssignable<AFunctionContract<NeverFunction>>(abstractError.contract)
expectNotAssignable<BaseFunctionContract<never, string>>(abstractError.contract)
expectNotAssignable<AFunctionContract<never>>(abstractError.contract)
