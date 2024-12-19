/*
  Copyright 2024 Jan Dockx

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

import { describe, it } from 'mocha'
import { Level1BClass, type Level1BType } from './SomeTypes'

class ConcreteLevel1BClass extends Level1BClass {
  constructor(rootProperty: number, level1BProperty: boolean) {
    super(rootProperty, level1BProperty)
  }
}

describe('SomeTypes', function () {
  it('can write to a readonly property of a class via an interface', function () {
    const instance = new ConcreteLevel1BClass(42, true)
    // TS2540: Cannot assign to level1BProperty because it is a read-only property.
    // instance.level1BProperty = false
    instance.level1BProperty.should.be.true()

    const viaType: Level1BType = instance
    viaType.level1BProperty = false

    viaType.level1BProperty.should.be.false()
    instance.level1BProperty.should.be.false()
  })
})
