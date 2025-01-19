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

import { inspect } from 'node:util'
import should from 'should'
import { type UnknownFunction } from '../../../src/index.ts'
import {
  BaseFunctionContract,
  contractFunctionBind,
  isAGeneralContractFunction,
  type ContractFunction
} from '../../../src/BaseFunctionContract.ts'
import { type GeneralLocation, location } from '../../../src/location.ts'
import { setAndFreeze } from '../../../src/private/property.ts'
import { conciseRepresentation, namePrefix } from '../../../src/private/representation.ts'
import { notAFunctionNorAContract } from './BaseFunctionContractCommon.ts'

type Constructor<T> = new (...args: unknown[]) => T

/**
 * Mock contract function. Mimics the structure of a {@link BaseContractFunction}, but does nothing when you call
 * it. Can be any type you like with generics.
 */
export function createCandidateContractFunction<
  ReturnType extends ContractFunction<UnknownFunction, GeneralLocation, UnknownFunction> | unknown = unknown
>(
  ContractConstructor?: new (kwargs: {}) => BaseFunctionContract<UnknownFunction, GeneralLocation>,
  doNotFreezeProperty?: string,
  otherPropertyName?: string,
  otherPropertyValue?: unknown
): ReturnType {
  function candidate(): void {}

  function impl(): void {}

  let contract =
    otherPropertyName === 'contract' ? otherPropertyValue : new (ContractConstructor || BaseFunctionContract)({})
  if (typeof contract === 'object') {
    contract = Object.create(contract)
  }
  const implementation = otherPropertyName === 'implementation' ? otherPropertyValue : impl
  const theLocation = otherPropertyName === 'location' ? otherPropertyValue : location()
  const bind = otherPropertyName === 'bind' ? otherPropertyValue : contractFunctionBind

  if (doNotFreezeProperty === 'contract') {
    candidate.contract = contract
  } else {
    setAndFreeze(candidate, 'contract', contract)
  }
  if (doNotFreezeProperty === 'implementation') {
    candidate.implementation = implementation
  } else {
    setAndFreeze(candidate, 'implementation', implementation)
  }
  if (doNotFreezeProperty === 'location') {
    candidate.location = theLocation
  } else {
    setAndFreeze(candidate, 'location', theLocation)
  }
  if (doNotFreezeProperty === 'bind') {
    candidate.bind = bind
  } else {
    setAndFreeze(candidate, 'bind', bind)
  }
  setAndFreeze(
    candidate,
    'name',
    otherPropertyName === 'name' ? otherPropertyValue : conciseRepresentation(namePrefix, implementation)
  )
  candidate.prototype = Object.create(impl.prototype, {
    constructor: { value: candidate }
  })

  return candidate as ReturnType
}

export function generateIAGCFTests<FunctionContract extends BaseFunctionContract<UnknownFunction, GeneralLocation>>(
  isAXXXContractFunction: typeof isAGeneralContractFunction,
  ContractConstructor?: Constructor<FunctionContract>
): void {
  it(
    'says yes if there is an implementation Function, an BaseFunctionContract, and a location, and all 3 ' +
      'properties are frozen, and it has the expected name',
    function () {
      const candidate = createCandidateContractFunction(ContractConstructor)
      isAXXXContractFunction.call(ContractConstructor, candidate).should.be.ok()
    }
  )

  notAFunctionNorAContract.forEach(thing => {
    it('says no if the argument is not a function, but ' + thing, function () {
      should(isAXXXContractFunction.call(ContractConstructor, thing)).not.be.ok()
    })
  })

  const properties = ['contract', 'implementation', 'location', 'bind']

  properties.forEach(doNotFreezeProperty => {
    it(`says no if the ${doNotFreezeProperty} property is not frozen`, function () {
      const candidate = createCandidateContractFunction(ContractConstructor, doNotFreezeProperty)
      should(isAXXXContractFunction.call(ContractConstructor, candidate)).not.be.ok()
    })
  })

  const cases = [
    {
      propertyName: 'contract',
      expected: 'an BaseFunctionContract',
      extra: [function (): void {}]
    },
    {
      propertyName: 'implementation',
      expected: 'a Function',
      extra: [new BaseFunctionContract({})]
    },
    {
      propertyName: 'bind',
      expected: 'contractFunctionBind',
      extra: []
    },
    {
      propertyName: 'name',
      expected: 'the contractFunction.name',
      extra: ['candidate', namePrefix]
    }
  ]

  cases.forEach(aCase => {
    notAFunctionNorAContract.concat(aCase.extra).forEach(v => {
      it(`says no if the ${aCase.propertyName} is not ${aCase.expected} but ${inspect(v)}`, function () {
        const candidate = createCandidateContractFunction(ContractConstructor, undefined, aCase.propertyName, v)
        should(isAXXXContractFunction.call(ContractConstructor, candidate)).not.be.ok()
      })
    })
  })
}
