/*
 Copyright 2015 - 2017 by Jan Dockx

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

/* eslint-env mocha */

'use strict'

const property = require('../../lib/_private/property')
const testUtil = require('../_util/testUtil')
const must = require('must')

describe('_private/property', function () {
  describe('#setAndFreezeProperty()', function () {
    it('sets a property, with a value, and freezes it', function () {
      const subject = {a: 4}
      const propertyName = 'a new property'
      const propertyValue = 'a new value'
      property.setAndFreeze(subject, propertyName, propertyValue)
      testUtil.expectOwnFrozenProperty(subject, propertyName)
      subject[propertyName].must.equal(propertyValue)
    })
    it('sets a property, without a value, and freezes it', function () {
      const subject = {a: 4}
      const propertyName = 'a new property'
      property.setAndFreeze(subject, propertyName)
      testUtil.expectOwnFrozenProperty(subject, propertyName)
      must(subject[propertyName]).be.undefined()
    })
  })

  describe('#defineConfigurableDerivedProperty', function () {
    it('sets a read-only property, with a getter', function () {
      const subject = {
        a: 4,
        expectedOfGetter: {}
      }
      Object.setPrototypeOf(subject, {})
      const propertyName = 'a new property'

      function getter () { return this.expectedOfGetter }

      property.configurableDerived(Object.getPrototypeOf(subject), propertyName, getter)
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyName).must.be.an.object()
      must(Object.getOwnPropertyDescriptor(subject, propertyName)).be.undefined()
      testUtil.expectConfigurableDerivedPropertyOnAPrototype(subject, propertyName)
      subject[propertyName].must.equal(subject.expectedOfGetter)
    })
  })

  describe('#defineFrozenDerivedProperty', function () {
    it('sets a frozen read-only property, with a getter', function () {
      const subject = {
        a: 4,
        expectedOfGetter: {}
      }
      Object.setPrototypeOf(subject, {})
      const propertyName = 'a new property'

      function getter () { return this.expectedOfGetter }

      property.frozenDerived(Object.getPrototypeOf(subject), propertyName, getter)
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyName).must.be.an.object()
      must(Object.getOwnPropertyDescriptor(subject, propertyName)).be.undefined()
      testUtil.expectFrozenDerivedPropertyOnAPrototype(subject, propertyName)
      subject[propertyName].must.equal(subject.expectedOfGetter)
    })
  })

  describe('#drozenReadOnlyArray', function () {
    it('sets a frozen read-only property, with a getter', function () {
      const subject = {a: 4}
      Object.setPrototypeOf(subject, {})
      const propertyName = 'a new property'
      const privatePropertyName = '_' + propertyName
      const array = [1, 2, 3]
      property.setAndFreeze(subject, privatePropertyName, array)
      property.frozenReadOnlyArray(Object.getPrototypeOf(subject), propertyName, privatePropertyName)
      testUtil.expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(subject, propertyName, privatePropertyName)
      subject[propertyName].must.not.equal(array)
      subject[propertyName].must.eql(array)
    })
  })
})