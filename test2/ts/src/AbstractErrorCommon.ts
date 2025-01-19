/*
  Copyright 2016–2025 Jan Dockx

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

import should from 'should'
import type { UnknownFunction } from '../../../src/index.ts'
import type { GeneralLocation } from '../../../src/location.ts'
import { expectOwnFrozenProperty } from '../../util/expectProperty.ts'
import {
  expectContractErrorInvariants,
  expectContractErrorConstructorPost,
  generateContractErrorMethodsDescriptions
} from './ContractErrorCommon.ts'
import { AbstractError, abstractErrorMessage, BaseFunctionContract } from '../../../src/BaseFunctionContract.ts'

export function expectAbstractErrorInvariants(subject: unknown): void {
  should(subject).be.an.instanceof(AbstractError)
  expectContractErrorInvariants(subject)

  const aeSubject = subject as AbstractError<
    UnknownFunction,
    GeneralLocation,
    BaseFunctionContract<UnknownFunction, GeneralLocation>
  >

  const name = expectOwnFrozenProperty(aeSubject, 'name')
  should(name).equal(AbstractError.name)

  const message = expectOwnFrozenProperty(aeSubject, 'message')
  should(message).equal(abstractErrorMessage)

  const contract = expectOwnFrozenProperty(aeSubject, 'contract')
  should(contract).be.instanceof(BaseFunctionContract)
}

/**
 * Precondition: `expectAbstractErrorInvariants` has been called
 */
export function expectAbstractErrorConstructorPost(
  result: AbstractError<UnknownFunction, GeneralLocation, BaseFunctionContract<UnknownFunction, GeneralLocation>>,
  message: string,
  contract: BaseFunctionContract<UnknownFunction, GeneralLocation>,
  rawStack: string
): void {
  expectContractErrorConstructorPost(result, message, rawStack)
  result.should.have.property('contract', contract)
}

export function generateAbstractErrorMethodsDescriptions<
  AE extends AbstractError<UnknownFunction, GeneralLocation, BaseFunctionContract<UnknownFunction, GeneralLocation>>
>(oneSubjectGenerator: () => AE, allSubjectGenerators: { subject: () => AE; description: string }[]): void {
  generateContractErrorMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators)

  // NOP: no methods here
}
