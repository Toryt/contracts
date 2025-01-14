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
import { AbstractFunctionContract } from '../../../src/AbstractFunctionContract.ts'
import { location as stackLocation } from '../../../src/private/stack.ts'
import { setAndFreeze } from '../../../src/private/property.ts'
import { mustBeCallerLocation } from '../../util/testUtil.ts'

// type ConditionsGenerator = () => Condition<UnknownFunction>[]
//
// const someConditions: ConditionsGenerator[] = [
//   function (): Condition<UnknownFunction>[] {
//     return []
//   },
//   function (): Condition<UnknownFunction>[] {
//     return [
//       function () {
//         return false
//       },
//       function () {
//         return true
//       }
//     ]
//   }
// ]

// const preCases = [
//   function (): null {
//     return null
//   }
// ].concat(someConditions)

// const postCases: ConditionsGenerator[] = [
//   () => [
//     function (): null {
//       return null
//     }
//   ]
// ].concat(someConditions)
//
// const exceptionCases = [
//   function (): null {
//     return null
//   }
// ].concat(someConditions)

export const notAFunctionNorAContract: unknown[] = [
  undefined,
  null,
  '',
  'foo',
  0,
  -1,
  true,
  false,
  /lala/,
  {},
  new Date(),
  // eslint-disable-next-line no-new-wrappers
  new Number(42),
  // eslint-disable-next-line no-new-wrappers
  new Boolean(true),
  // eslint-disable-next-line no-new-wrappers
  new String('lalala')
]

// // noinspection JSCheckFunctionSignatures
// const constructorPreCases = [
//   function () {
//     return undefined
//   }
// ].concat(preCases)
// // noinspection JSCheckFunctionSignatures
// const constructorPostCases = [
//   function () {
//     return undefined
//   }
// ].concat(postCases)
// // noinspection JSCheckFunctionSignatures
// const constructorExceptionCases = [
//   function () {
//     return undefined
//   }
// ].concat(exceptionCases)
//
// export const location = eol.stack + '    at /'

export function expectInvariants<Signature extends UnknownFunction>(
  subject: unknown
): AbstractFunctionContract<Signature> {
  should(subject).be.an.instanceof(AbstractFunctionContract)
  // eslint-disable-next-line no-secrets/no-secrets
  // testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'pre', '_pre')
  // /* MUDO given a contract c, and contract function cf = c.implementation(…), cf.contract !== c, but
  //         Object.getPrototypeOf(cf.contract) === c
  //         -
  //         c.implementation(…) creates a new object with c as prototype in bless: Object.create(contract)
  //         -
  //         therefore, it is not true that for all contracts _pre, _post, _exceptions must be _own_ properties
  //         -
  //         we are missing a test for the invariants of cf.contract
  //         -
  //         either we relax the invariants, and move the "own" aspect to the postconditions of the constructor,
  //         or we slice the arrays in bless - the latter seems like not a good idea, since in this case we intend
  //         this to be semantically "the same contract" - what will happen here with extend? */
  // testUtil.expectToBeArrayOfFunctions(subject.pre)
  // eslint-disable-next-line no-secrets/no-secrets
  // testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'post', '_post')
  // testUtil.expectToBeArrayOfFunctions(subject.post)
  // eslint-disable-next-line no-secrets/no-secrets
  // testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, 'exception', '_exception')
  // testUtil.expectToBeArrayOfFunctions(subject.exception)
  // testUtil.expectOwnFrozenProperty(subject, 'location')
  // const location = subject.location
  // ;(location === AbstractFunctionContract.internalLocation || is.stackLocation(location)).should.be.true()
  // testUtil.expectOwnFrozenProperty(subject, 'abstract')
  // const abstract = subject.abstract
  // AbstractFunctionContract.isAGeneralContractFunction(abstract).should.be.true()
  // abstract.location.should.equal(location)
  // subject.isImplementedBy(abstract).should.be.true()
  // abstract.should.throw(AbstractFunctionContract.AbstractError, {
  //   message: AbstractFunctionContract.AbstractError.message
  // })
  // try {
  //   abstract()
  // } catch (err) {
  //   const stack = err.stack
  //   stack.should.containEql(AbstractFunctionContract.AbstractError.message)
  //   stack.should.containEql(AbstractFunctionContract.AbstractError.name)
  //   stack.split(eol.stack)[0].should.containEql('abstract')
  //   testUtil.log(stack)
  // }
  return subject as AbstractFunctionContract<Signature>
}

// function expectArrayPost(result, array, propName, privatePropName) {
//   result[propName].should.be.an.Array()
//   if (!array) {
//     if (propName === 'exception' || propName === 'fastException') {
//       result[propName].should.eql(AbstractFunctionContract.mustNotHappen)
//     } else {
//       result[propName].should.be.empty()
//     }
//   } else {
//     result[privatePropName].should.not.equal(array) // it must be a copy, don't share the array
//     result[privatePropName].should.eql(array)
//     Object.isFrozen(result[privatePropName])
//     result[propName].should.eql(array)
//     result[propName].should.not.equal(result[privatePropName]) // it must be a copy, don't share the array
//   }
// }

export function expectConstructorPost(/* pre, post, exception, */ location: string, result: unknown): void {
  const afcSubject = expectInvariants(result)
  // MUDO
  // expectArrayPost(result, pre, 'pre', '_pre')
  // expectArrayPost(result, post, 'post', '_post')
  // expectArrayPost(result, exception, 'exception', '_exception')
  mustBeCallerLocation(afcSubject.location, location)
  afcSubject.verify.should.be.true()
  afcSubject.verifyPostconditions.should.be.false()
}

type Constructor<T> = new (...args: unknown[]) => T

class AFC extends AbstractFunctionContract<UnknownFunction> {}

export function createCandidateContractFunction<FunctionContract extends AbstractFunctionContract<UnknownFunction>>(
  ContractConstructor?: Constructor<FunctionContract>,
  doNotFreezeProperty?: string,
  otherPropertyName?: string,
  otherPropertyValue?: unknown
): unknown {
  function candidate(): void {}

  function impl(): void {}

  let contract = otherPropertyName === 'contract' ? otherPropertyValue : new (ContractConstructor || AFC)({})
  if (typeof contract === 'object') {
    contract = Object.create(contract)
  }
  const implementation = otherPropertyName === 'implementation' ? otherPropertyValue : impl
  const location = otherPropertyName === 'location' ? otherPropertyValue : stackLocation()
  // MUDO
  // const bind = otherPropertyName === 'bind' ? otherPropertyValue : AbstractFunctionContract.bindContractFunction

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
    candidate.location = location
  } else {
    setAndFreeze(candidate, 'location', location)
  }
  // MUDO
  // if (doNotFreezeProperty === 'bind') {
  //   candidate.bind = bind
  // } else {
  //   setAndFreeze(candidate, 'bind', bind)
  // }
  // property.setAndFreeze(
  //   candidate,
  //   'name',
  //   otherPropertyName === 'name'
  //     ? otherPropertyValue
  //     : report.conciseRepresentation(AbstractFunctionContract.namePrefix, implementation)
  // )
  candidate.prototype = Object.create(impl.prototype, {
    constructor: { value: candidate }
  })
  return candidate
}

export function generateIAGCFTests<FunctionContract extends AbstractFunctionContract<UnknownFunction>>(
  isAXXXContractFunction: typeof AbstractFunctionContract.isAGeneralContractFunction,
  ContractConstructor?: Constructor<FunctionContract>
): void {
  it(
    'says yes if there is an implementation Function, an AbstractFunctionContract, and a location, and all 3 ' +
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

  const properties = ['contract', 'implementation', 'location'] /* MUDO , 'bind'] */

  properties.forEach(doNotFreezeProperty => {
    it(`says no if the ${doNotFreezeProperty} property is not frozen`, function () {
      const candidate = createCandidateContractFunction(ContractConstructor, doNotFreezeProperty)
      should(isAXXXContractFunction.call(ContractConstructor, candidate)).not.be.ok()
    })
  })

  const cases = [
    {
      propertyName: 'contract',
      expected: 'an AbstractFunctionContract',
      extra: [function (): void {}]
    },
    {
      propertyName: 'implementation',
      expected: 'a Function',
      extra: [new AFC({})]
    }
    // MUDO
    // {
    //   propertyName: 'bind',
    //   expected: 'AbstractFunctionContract.bindContractFunction',
    //   extra: []
    // },
    // {
    //   propertyName: 'name',
    //   expected: 'the contractFunction.name',
    //   extra: ['candidate', AbstractFunctionContract.namePrefix]
    // }
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

// // noinspection FunctionNamingConventionJS, ParameterNamingConventionJS
// function generateConstructorMethodsDescriptions(ContractConstructor) {
//   describe('@isAContractFunction', function () {
//     generateIAGCFTests(ContractConstructor, ContractConstructor.isAContractFunction)
//     notAFunctionNorAContract
//       .filter(t => !t || typeof t !== 'string' || t.indexOf(eol.n) >= 0 || t.indexOf(eol.rn) >= 0)
//       .concat([{}, AbstractFunctionContract.internalLocation])
//       .forEach(v => {
//         it(`says no if the location is not a location outside this library but ${v}`, function () {
//           const candidate = createCandidateContractFunction(null, 'location', v)
//           should(AbstractFunctionContract.isAContractFunction(candidate)).not.be.ok()
//         })
//       })
//     notAFunctionNorAContract
//       .filter(v => !v)
//       .forEach(v => {
//         it(`says no if the location is not truthy but ${v}`, function () {
//           const candidate = createCandidateContractFunction(ContractConstructor, null, 'location', v)
//           should(ContractConstructor.isAContractFunction(candidate)).not.be.ok()
//         })
//       })
//   })
// }
//
// // noinspection FunctionNamingConventionJS,JSUnusedLocalSymbols
// function generatePrototypeMethodsDescriptions(oneSubjectGenerator, allSubjectGenerators) {
//   const self = this
//
//   describe('#isImplementedBy()', function () {
//     it('says yes if the argument is a general contract function for the contract', function () {
//       const subject = oneSubjectGenerator()
//       const f = createCandidateContractFunction(subject.constructor, null, 'contract', subject)
//       subject.isImplementedBy(f).should.be.ok()
//       self.expectInvariants(subject)
//     })
//     it('says yes to abstract', function () {
//       const subject = oneSubjectGenerator()
//       subject.isImplementedBy(subject.abstract).should.be.ok()
//       self.expectInvariants(subject)
//     })
//     it('says yes to abstract with its own contract', function () {
//       const subject = oneSubjectGenerator()
//       subject.abstract.contract.isImplementedBy(subject.abstract).should.be.ok()
//       // MUDO shows a bug elsewhere; see expectInvariants
//       // self.expectInvariants(subject.abstract.contract)
//     })
//     notAFunctionNorAContract.concat(['function() {}']).forEach(function (thing) {
//       it(`says no if the argument is not a general contract function but ${thing}`, function () {
//         const subject = oneSubjectGenerator()
//         subject.isImplementedBy(thing).should.not.be.ok()
//         self.expectInvariants(subject)
//       })
//     })
//     it('says no if the argument is a contract function for another contract', function () {
//       const subject = oneSubjectGenerator()
//       const otherContract = oneSubjectGenerator()
//       const f = createCandidateContractFunction(null, null, 'contract', otherContract)
//       subject.isImplementedBy(f).should.not.be.ok()
//       self.expectInvariants(subject)
//     })
//   })
// }
//
// module.exports = {
//   preCases,
//   postCases,
//   exceptionCases,
//   thingsThatAreNotAFunctionNorAContract: notAFunctionNorAContract,
//   constructorPreCases,
//   constructorPostCases,
//   constructorExceptionCases,
//   location,
//   expectInvariants,
//   expectArrayPost,
//   expectConstructorPost,
//   createCandidateContractFunction,
//   generateIAGCFTests,
//   generateConstructorMethodsDescriptions,
//   generatePrototypeMethodsDescriptions
// }
