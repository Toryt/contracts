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

import { isFrozenOwnProperty } from '../../../../src/private/is.ts'
import {
  configurableDerived,
  frozenDerived,
  frozenReadOnlyArray,
  setAndFreeze
} from '../../../../src/private/property.ts'
import { booleanStuff } from '../../../util/_stuff.ts'
import { x } from '../../../util/cartesian.ts'
import {
  expectConfigurableDerivedPropertyOnAPrototype,
  expectFrozenDerivedPropertyOnAPrototype,
  expectFrozenReadOnlyArrayPropertyWithPrivateBackingField,
  expectOwnFrozenProperty
} from '../../../util/expectProperty.ts'
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

  describe('isFrozenOwnProperty()', function () {
    const propName = 'test prop name'
    const propValue = 'dummy value'
    const truths = booleanStuff.map(({ subject }) => subject)
    x(truths, truths, truths).forEach(([configurable, enumerable, writable]) => {
      const subject = {}
      Object.defineProperty(subject, propName, {
        configurable,
        enumerable,
        writable,
        value: propValue
      })
      if (!configurable && enumerable && !writable && Object.prototype.hasOwnProperty.call(subject, propName)) {
        it('reports true if the property is an own property, and it is enumerable, not configurable and not writable', function () {
          const result = isFrozenOwnProperty(subject, propName)
          should(result).be.ok()
        })
      } else {
        it(`reports false if the property is an own property, and enumerable === ${enumerable} configurable === ${configurable} writable === ${writable}`, function () {
          const result = isFrozenOwnProperty(subject, propName)
          should(result).not.be.ok()
        })
      }

      it('reports false if the property does not exist', function () {
        const result = isFrozenOwnProperty(subject, 'some other, non-existing property name')
        should(result).not.be.ok()
      })

      const specialized: Record<string, string> = {}
      Object.setPrototypeOf(specialized, subject)
      should(specialized[propName]).equal(propValue) // check inheritance — test code validity

      it(`reports false if the property is not an own property, and enumerable === ${enumerable} configurable === ${configurable} writable === ${writable}`, function () {
        const specializedResult = isFrozenOwnProperty(specialized, propName)
        should(specializedResult).not.be.ok()
      })
    })

    const notObjects = [0, false, '', 'lala']
    notObjects.forEach(notAnObject => {
      // cannot set a property on primitives
      it(`reports false if the first parameter is a primitive (${typeof notAnObject})`, function () {
        const result = isFrozenOwnProperty(notAnObject, propName)
        should(result).not.be.ok()
      })
    })

    const fCandidates = [undefined, function (): void {}]
    x(truths, truths, fCandidates, fCandidates).forEach(([configurable, enumerable, get, set]) => {
      const subject = {}
      Object.defineProperty(subject, propName, {
        configurable,
        enumerable,
        ...(get && { get }),
        ...(set && { set })
      })
      if (
        !configurable &&
        enumerable &&
        ((typeof get === 'function' && set === undefined) ||
          (get === undefined && set === undefined)) /* writable is false by default, so it is frozen */ &&
        Object.prototype.hasOwnProperty.call(subject, propName)
      ) {
        it('reports true if the property is an own property, and it is enumerable, and not configurable, has a getter, but not a setter', function () {
          const result = isFrozenOwnProperty(subject, propName)
          should(result).be.ok()
        })
      } else {
        it(`reports false if the property is an own property, enumerable === ${enumerable} configurable === ${configurable} get === ${get} set === ${set}`, function () {
          const result = isFrozenOwnProperty(subject, propName)
          should(result).not.be.ok()
        })
      }
    })
  })
})
