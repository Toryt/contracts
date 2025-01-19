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
import { type UnknownFunction } from '../../../src/index.ts'
import { BaseFunctionContract } from '../../../src/BaseFunctionContract.ts'
import { type GeneralLocation, internalLocation, isLocation } from '../../../src/location.ts'
import { expectOwnFrozenProperty } from '../../util/expectProperty.ts'
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

export function expectInvariants<Signature extends UnknownFunction, Location extends GeneralLocation>(
  subject: unknown
): BaseFunctionContract<Signature, GeneralLocation> {
  should(subject).be.an.instanceof(BaseFunctionContract)
  const bfc: BaseFunctionContract<Signature, Location> = subject as BaseFunctionContract<Signature, Location>
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
  const location = expectOwnFrozenProperty(bfc, 'location')
  ;(location === internalLocation || isLocation(location)).should.be.true()
  // testUtil.expectOwnFrozenProperty(subject, 'abstract')
  // const abstract = subject.abstract
  // BaseFunctionContract.isAGeneralContractFunction(abstract).should.be.true()
  // abstract.location.should.equal(location)
  // subject.isImplementedBy(abstract).should.be.true()
  // abstract.should.throw(BaseFunctionContract.AbstractError, {
  //   message: BaseFunctionContract.AbstractError.message
  // })
  // try {
  //   abstract()
  // } catch (err) {
  //   const stack = err.stack
  //   stack.should.containEql(BaseFunctionContract.AbstractError.message)
  //   stack.should.containEql(BaseFunctionContract.AbstractError.name)
  //   stack.split(eol.stack)[0].should.containEql('abstract')
  //   testUtil.log(stack)
  // }
  return bfc
}

// function expectArrayPost(result, array, propName, privatePropName) {
//   result[propName].should.be.an.Array()
//   if (!array) {
//     if (propName === 'exception' || propName === 'fastException') {
//       result[propName].should.eql(BaseFunctionContract.mustNotHappen)
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

// // noinspection FunctionNamingConventionJS, ParameterNamingConventionJS
// function generateConstructorMethodsDescriptions(ContractConstructor) {
//   describe('@isAContractFunction', function () {
//     generateIAGCFTests(ContractConstructor, ContractConstructor.isAContractFunction)
//     notAFunctionNorAContract
//       .filter(t => !t || typeof t !== 'string' || t.indexOf(eol.n) >= 0 || t.indexOf(eol.rn) >= 0)
//       .concat([{}, BaseFunctionContract.internalLocation])
//       .forEach(v => {
//         it(`says no if the location is not a location outside this library but ${v}`, function () {
//           const candidate = createCandidateContractFunction(null, 'location', v)
//           should(BaseFunctionContract.isAContractFunction(candidate)).not.be.ok()
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
