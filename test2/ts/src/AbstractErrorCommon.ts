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
import { expectOwnFrozenProperty } from '../../util/testUtil.ts'
import {
  expectInvariants as expectAbstractErrorInvariants,
  expectConstructorPost as expectAbstractErrorConstructorPost
} from './ContractErrorCommon.ts'
import { AbstractError, abstractErrorMessage, AbstractFunctionContract } from '../../../src/AbstractFunctionContract.ts'

export { generatePrototypeMethodsDescriptions } from './ContractErrorCommon.ts'

export function expectInvariants(subject: unknown): void {
  should(subject).be.an.instanceof(AbstractError)
  expectAbstractErrorInvariants(subject)
  const aeSubject = subject as AbstractError<AbstractFunctionContract<UnknownFunction>>

  expectOwnFrozenProperty(Object.getPrototypeOf(aeSubject), 'name')
  Object.getPrototypeOf(aeSubject).name.should.equal(AbstractError.name)
  expectOwnFrozenProperty(aeSubject, 'name')
  aeSubject.name.should.equal(AbstractError.name)

  expectOwnFrozenProperty(AbstractError.prototype, 'message')
  Object.getPrototypeOf(subject).message.should.equal(abstractErrorMessage)
  expectOwnFrozenProperty(aeSubject, 'message')
  aeSubject.message.should.equal(abstractErrorMessage)
}

/**
 * Precondition: `expectInvariants` has been called
 */
export function expectConstructorPost(
  result: AbstractError<AbstractFunctionContract<UnknownFunction>>,
  message: string,
  contract: AbstractFunctionContract<UnknownFunction>,
  rawStack: string
): void {
  expectContractErrorConstructorPost(result, message, rawStack)
  result.should.have.property('contract', contract)
}

// MUDO
// export function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
//   common.generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators)
//
//   // NOP: no methods here
// }

// MUDO remove
// Object.setPrototypeOf(test, common)
