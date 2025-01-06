/*
  Copyright 2015–2025 Jan Dockx

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

import {
  configurableDerived,
  frozenDerived,
  frozenReadOnlyArray,
  setAndFreeze
} from '../../../../src/private/property.ts'
import {
  expectConfigurableDerivedPropertyOnAPrototype,
  expectFrozenDerivedPropertyOnAPrototype,
  expectFrozenReadOnlyArrayPropertyWithPrivateBackingField,
  expectOwnFrozenProperty
} from '../../../util/testUtil.ts'
import should from 'should'
import { testName } from '../../../util/testName.ts'

const propertyName = 'a new property'

describe(testName(import.meta), function () {
  describe('setAndFreeze', function () {
    it('sets a property, with a value, and freezes it', function () {
      const subject = { a: 4 }
      const propertyValue = 'a new value'
      const changed = setAndFreeze(subject, propertyName, propertyValue)
      changed.should.equal(subject)
      expectOwnFrozenProperty(changed, propertyName)
      changed[propertyName].should.equal(propertyValue)
    })
    it('sets a property, without a value, and freezes it', function () {
      const subject = { a: 4 }
      const changed = setAndFreeze(subject, propertyName)
      changed.should.equal(subject)
      expectOwnFrozenProperty(changed, propertyName)
      should(changed[propertyName]).be.undefined()
    })
  })

  describe('with prototype for simple derived property', function () {
    interface Subject {
      expectedOfGetter: object
      [key: string]: unknown
    }

    interface Fixture extends Mocha.Context {
      prototype: object
      subject: Subject
      getter: (this: Subject) => Subject['expectedOfGetter']
      shouldKeepPrototypeChainAndAddConfigurableDerivedProperty: (changedPrototype: object) => void
    }

    beforeEach(function () {
      const self = this as unknown as Fixture

      self.prototype = {}
      self.subject = {
        a: 4,
        expectedOfGetter: {}
      }
      Object.setPrototypeOf(self.subject, self.prototype)

      self.getter = function getter(this: { expectedOfGetter: object }): Subject['expectedOfGetter'] {
        return this.expectedOfGetter
      }

      self.shouldKeepPrototypeChainAndAddConfigurableDerivedProperty = function (changedPrototype: object): void {
        changedPrototype.should.equal(this.prototype)
        Object.getPrototypeOf(this.subject).should.equal(this.prototype)
        should(Object.getOwnPropertyDescriptor(changedPrototype, propertyName)).be.an.Object()
        should(Object.getOwnPropertyDescriptor(this.subject, propertyName)).be.undefined()
      }
    })

    describe('configurableDerived', function () {
      it('sets a read-only property, with a getter', function () {
        const self = this as unknown as Fixture

        const changedPrototype = configurableDerived(self.prototype, propertyName, self.getter)

        self.shouldKeepPrototypeChainAndAddConfigurableDerivedProperty(changedPrototype)
        const changedSubject = self.subject as typeof changedPrototype & typeof self.subject
        expectConfigurableDerivedPropertyOnAPrototype(changedSubject, propertyName)
        should(changedSubject[propertyName]).equal(changedSubject.expectedOfGetter)
      })
    })

    describe('frozenDerived', function () {
      it('sets a frozen read-only property, with a getter', function () {
        const self = this as unknown as Fixture

        const changedPrototype = frozenDerived(self.prototype, propertyName, self.getter)

        self.shouldKeepPrototypeChainAndAddConfigurableDerivedProperty(changedPrototype)
        const changedSubject = self.subject as typeof changedPrototype & typeof self.subject
        expectFrozenDerivedPropertyOnAPrototype(changedSubject, propertyName)
        changedSubject[propertyName].should.equal(changedSubject.expectedOfGetter)
      })
    })
  })

  describe('frozenReadOnlyArray', function () {
    it('sets a frozen read-only property, with a getter', function () {
      const subjectBase = { a: 4 }
      Object.setPrototypeOf(subjectBase, {})
      const privatePropertyName = '_' + propertyName
      const array = [1, 2, 3]
      const subject = setAndFreeze(subjectBase, privatePropertyName, array)

      const prototype = Object.getPrototypeOf(subject)

      const changedPrototype = frozenReadOnlyArray(prototype, propertyName, privatePropertyName)

      changedPrototype.should.equal(prototype)
      Object.getPrototypeOf(subject).should.equal(prototype)
      should(Object.getOwnPropertyDescriptor(changedPrototype, propertyName)).be.an.Object()
      should(Object.getOwnPropertyDescriptor(subject, propertyName)).be.undefined()
      expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, propertyName, privatePropertyName)
      const changedSubject = subject as typeof changedPrototype
      changedSubject[propertyName].should.not.equal(array)
      changedSubject[propertyName].should.eql(array)
    })
  })
})
