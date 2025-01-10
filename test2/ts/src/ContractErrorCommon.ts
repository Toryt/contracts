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
import { ContractError } from '../../../src/ContractError.ts'
import { expectOwnFrozenProperty } from '../../util/testUtil.ts'
import { stack as isStack } from '../../../src/private/is.ts'
import { stack as stackEOL } from '../../../src/private/eol.ts'

export function expectStackInvariants(subject: ContractError): void {
  const stack = subject.stack
  should(stack).be.a.String()
  const startOfStack = `${subject.name}: ${subject.message}${stackEOL}`
  stack!.startsWith(startOfStack).should.be.true()
  const restOfStack = stack!
    .replace(startOfStack, '')
    .split(stackEOL)
    // remove empty lines that may occur in 'caused by' in Safari when used via Web Driver
    .filter(l => !!l)
    .join(stackEOL)
  isStack(restOfStack).should.be.true()
  restOfStack.should.containEql(subject.rawStack)
}

export function expectInvariants(subject: unknown): void {
  should(subject).be.an.instanceof(ContractError)
  const ceSubject = subject as ContractError

  ceSubject.name.should.be.a.String()
  ceSubject.name.should.equal(ceSubject.constructor.name)

  ceSubject.message.should.be.a.String()

  expectOwnFrozenProperty(ceSubject, 'rawStack')
  isStack(ceSubject.rawStack).should.be.true()

  expectStackInvariants(ceSubject)
}

export function expectConstructorPost(result: unknown, message: string, rawStack: string): void {
  should(result).be.an.instanceof(ContractError)
  Object.isExtensible(result).should.be.true()
  const ceResult = result as ContractError
  ceResult.should.have.property('name', ceResult.constructor.name)
  ceResult.should.have.property('message', message)
  ceResult.should.have.property('rawStack', rawStack)
}

export function generatePrototypeMethodsDescriptions<CE extends ContractError>(
  oneSubjectGenerator: () => CE,
  allSubjectGenerators: { subject: () => CE; description: string }[]
): void {
  // NOP: no methods here
}
