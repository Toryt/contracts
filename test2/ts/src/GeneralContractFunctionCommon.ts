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

import assert from 'assert'
import { inspect } from 'node:util'
import should from 'should'
import {
  BaseFunctionContract,
  type ContractFunction,
  contractFunctionBind,
  isAGeneralContractFunction
} from '../../../src/BaseFunctionContract.ts'
import { type UnknownFunction } from '../../../src/index.ts'
import { type GeneralLocation, internalLocation, isLocation, location } from '../../../src/location.ts'
import { setAndFreeze } from '../../../src/private/property.ts'
import { conciseRepresentation, namePrefix } from '../../../src/private/representation.ts'
import { stuffGenerators } from '../../util/_stuff.ts'
import { notAFunctionNorAContract } from './BaseFunctionContractCommon.ts'

type Constructor<T> = new (...args: unknown[]) => T

/**
 * Mock contract function. Mimics the structure of a {@link BaseContractFunction}, but does nothing when you call
 * it. Can be any type you like with generics.
 */
export function createCandidateContractFunction<
  ReturnType extends
    | ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, GeneralLocation>, UnknownFunction>
    | unknown = unknown
>(
  ContractConstructor?: new (kwargs: {}) => BaseFunctionContract<UnknownFunction, GeneralLocation>,
  doNotFreezeProperty?: string,
  otherPropertyName?: string,
  otherPropertyValue?: unknown,
  noPrototype?: boolean
): ReturnType {
  function candidateContractFunction(): void {} // has a prototype that cannot be deleted
  function impl(): void {} // has a prototype that cannot be deleted

  /* Arrow function has no prototype
     See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype#description */
  const candidate = (noPrototype ? (): void => {} : candidateContractFunction) as UnknownFunction & {
    contract: unknown
    implementation: unknown
    location: unknown
    bind: unknown
  }

  let contract =
    otherPropertyName === 'contract' ? otherPropertyValue : new (ContractConstructor || BaseFunctionContract)({})
  if (typeof contract === 'object') {
    contract = Object.create(contract)
  }
  const implementation =
    /* Arrow function has no prototype
       See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype#description */
    otherPropertyName === 'implementation'
      ? otherPropertyValue === 'self'
        ? candidate
        : otherPropertyValue
      : noPrototype
        ? (): void => {}
        : impl
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

  if (otherPropertyName !== 'implementation') {
    assert(typeof implementation === 'function')
    if (!noPrototype) {
      // the default setup for non-arrow, non-async, non-generator functions
      implementation.prototype.should.be.an.Object()
      implementation.prototype.constructor.should.equal(implementation)
      candidate.prototype = Object.create(implementation.prototype, {
        constructor: { value: candidate }
      })
    } else {
      implementation.should.not.have.property('prototype')
      candidate.should.not.have.property('prototype')
    }
  }

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
      isAXXXContractFunction.call(ContractConstructor, candidate).should.be.true()
    }
  )

  notAFunctionNorAContract.forEach(thing => {
    it('says no if the argument is not a function, but ' + thing, function () {
      should(isAXXXContractFunction.call(ContractConstructor, thing)).be.false()
    })
  })

  it('says no if the implementation function is the contract function', function () {
    const candidate = createCandidateContractFunction(ContractConstructor, undefined, 'implementation', 'self')
    isAXXXContractFunction.call(ContractConstructor, candidate).should.be.false()
  })

  const validLocations = ['    at', 'at /']
  validLocations.forEach(v => {
    it(`says yes if there is an implementation Function, a BaseFunctionContract, and a location that is \`'${v}'\`, and all 3 properties are frozen, and it has the expected name`, function () {
      const candidate = createCandidateContractFunction(undefined, undefined, 'location', v)
      isAGeneralContractFunction(candidate).should.be.true()
    })
  })

  const properties = ['contract', 'implementation', 'location', 'bind']

  properties.forEach(doNotFreezeProperty => {
    it(`says no if the ${doNotFreezeProperty} property is not frozen`, function () {
      const candidate = createCandidateContractFunction(ContractConstructor, doNotFreezeProperty)
      should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
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
      propertyName: 'location',
      expected: 'a location',
      extra: [internalLocation]
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
      if (aCase.propertyName !== 'location' || !isLocation(v)) {
        it(`says no if the ${aCase.propertyName} is not ${aCase.expected} but ${inspect(v)}`, function () {
          const candidate = createCandidateContractFunction(ContractConstructor, undefined, aCase.propertyName, v)
          should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
        })
      }
    })
  })

  describe('prototype', function () {
    it('says yes if the implementation function has an object as a prototype, with a constructor that is the implementation function, and the contract function has a prototype with the implementation prototype as prototype, with a constructor that is the contract function', function () {
      const candidate = createCandidateContractFunction(ContractConstructor)
      should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.true()
    })
    it('says no if the implementation function has an object as a prototype, with a constructor that is the implementation function, and the contract function has a prototype without the implementation prototype as prototype, with a constructor that is the contract function', function () {
      const candidate = createCandidateContractFunction<
        ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
      >(ContractConstructor, undefined, undefined, undefined, true)
      candidate.implementation.prototype = { constructor: candidate.implementation }
      candidate.prototype = { constructor: candidate }

      should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
    })
    it('says yes if the implementation function has an object as a prototype, without a constructor, and the contract function has a prototype with the implementation prototype as prototype, without a constructor', function () {
      const candidate = createCandidateContractFunction<
        ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
      >(ContractConstructor, undefined, undefined, undefined, true)
      candidate.implementation.prototype = { notAConstructor: true }
      candidate.prototype = Object.create(candidate.implementation.prototype)

      should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.true()
    })
    it('says no if the implementation function has an object as a prototype, without a constructor, and the contract function has a prototype without the implementation prototype as prototype, without a constructor', function () {
      const candidate = createCandidateContractFunction<
        ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
      >(ContractConstructor, undefined, undefined, undefined, true)
      candidate.implementation.prototype = { notAConstructor: true }
      candidate.prototype = candidate.implementation.prototype

      should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
    })
    it('says yes if the implementation function does not have a prototype, and the contract function has not either', function () {
      const candidate = createCandidateContractFunction<
        ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
      >(ContractConstructor, undefined, undefined, undefined, true)
      candidate.implementation.should.not.have.property('prototype')
      candidate.should.not.have.property('prototype')

      should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.true()
    })

    stuffGenerators.forEach(({ generate, description, primitive }) => {
      it(`says no if the implementation function has an object as a prototype, with a constructor that is the implementation function, and the contract function has a prototype with the implementation prototype as prototype, with a constructor that is ${description}`, function () {
        const candidate = createCandidateContractFunction<
          ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
        >(ContractConstructor, undefined, undefined, undefined, true)
        candidate.implementation.prototype = { constructor: candidate.implementation }
        candidate.prototype = Object.create(candidate.implementation.prototype, {
          constructor: {
            value: generate(),
            enumerable: false,
            writable: false,
            configurable: false
          }
        })

        should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
      })
      it(`says no if the implementation function has an object as a prototype, with a constructor that is the implementation function, and the contract function has a prototype without the implementation prototype as prototype, with a constructor that is ${description}`, function () {
        const candidate = createCandidateContractFunction<
          ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
        >(ContractConstructor, undefined, undefined, undefined, true)
        candidate.implementation.prototype = { constructor: candidate.implementation }
        candidate.prototype = { constructor: generate() }

        should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
      })
      it(`says yes if the implementation function has an object as a prototype, with a constructor that is a ${description}, and the contract function has a prototype with the implementation prototype as prototype, with a constructor that is the same value`, function () {
        const candidate = createCandidateContractFunction<
          ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
        >(ContractConstructor, undefined, undefined, undefined, true)
        const constructor = generate()
        candidate.implementation.prototype = { constructor }
        candidate.prototype = Object.create(candidate.implementation.prototype)

        should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.true()
      })
      it(`says no if the implementation function has an object as a prototype, with a constructor that is ${description}, and the contract function has a prototype with the implementation prototype as prototype, with a constructor that is not ${description}`, function () {
        const candidate = createCandidateContractFunction<
          ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
        >(ContractConstructor, undefined, undefined, undefined, true)
        const constructor = generate()
        const somethingElse = Symbol('not stuff')
        candidate.implementation.prototype = { constructor }
        candidate.prototype = Object.create(candidate.implementation.prototype, {
          constructor: {
            value: somethingElse,
            enumerable: false,
            writable: false,
            configurable: false
          }
        })

        should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
      })
      it(`says no if the implementation function has an object as a prototype, with a constructor that is ${description}, and the contract function has a prototype without the implementation prototype as prototype, with a constructor that is ${description}`, function () {
        const candidate = createCandidateContractFunction<
          ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
        >(ContractConstructor, undefined, undefined, undefined, true)
        const constructor = generate()
        candidate.implementation.prototype = { constructor }
        candidate.prototype = { constructor }

        should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
      })
      if (primitive || description === 'null') {
        it(`says yes if the implementation function has ${primitive ? `primitive ${description}` : 'null'} as a prototype, and the contract function has too`, function () {
          const candidate = createCandidateContractFunction<
            ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
          >(ContractConstructor, undefined, undefined, undefined, true)
          const primitivePrototype = generate()
          candidate.implementation.prototype = primitivePrototype
          candidate.prototype = primitivePrototype

          should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.true()
        })
      } else {
        it(`says yes if the implementation function has an object ${description} as a prototype, and the contract has a prototype with the implementation prototype as prototype`, function () {
          const candidate = createCandidateContractFunction<
            ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
          >(ContractConstructor, undefined, undefined, undefined, true)
          const prototype = generate()
          assert((typeof prototype === 'object' && prototype !== null) || typeof prototype === 'function')
          candidate.implementation.prototype = prototype
          candidate.prototype = Object.create(prototype)

          should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.true()
        })
        it(`says yes no the implementation function has an object ${description} as a prototype, and the contract has a prototype that is the implementation prototype`, function () {
          const candidate = createCandidateContractFunction<
            ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
          >(ContractConstructor, undefined, undefined, undefined, true)
          const prototype = generate()
          candidate.implementation.prototype = prototype
          candidate.prototype = prototype

          should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
        })
      }
      it(`says no if the implementation function has ${description} as a prototype, and the contract function has not`, function () {
        const candidate = createCandidateContractFunction<
          ContractFunction<UnknownFunction, BaseFunctionContract<UnknownFunction, string>, UnknownFunction>
        >(ContractConstructor, undefined, undefined, undefined, true)
        const prototype = generate()
        const somethingElse = Symbol('not stuff again')
        candidate.implementation.prototype = prototype
        candidate.prototype = somethingElse

        should(isAXXXContractFunction.call(ContractConstructor, candidate)).be.false()
      })
    })
  })
}
