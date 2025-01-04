/*
  Copyright 2024–2025 Jan Dockx

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

export interface RootType {
  rootProperty: number
}
export function isRootType(candidate: unknown): candidate is RootType {
  return (
    candidate !== null &&
    typeof candidate === 'object' &&
    'rootProperty' in candidate &&
    typeof candidate.rootProperty === 'number'
  )
}

export abstract class RootClass implements RootType {
  rootProperty: number

  protected constructor(rootProperty: number) {
    this.rootProperty = rootProperty
  }
}

export interface Level1AType extends RootType {
  // NOTE: `readonly` means that, via this type, the property can be read, but not set.
  readonly level1AProperty: string
}
export function isLevel1AType(candidate: unknown): candidate is Level1AType {
  return isRootType(candidate) && 'level1AProperty' in candidate && typeof candidate.level1AProperty === 'string'
}

export class Level1AClass extends RootClass implements Level1AType {
  /* NOTE: Not having `readonly` on the class instance property means that, via this type, the property can be read and
           set. Via `Level1AType` it cannot be set. Consumers of `Level1AType` however that the value of the property
           will not change, merely that it cannot be set via that type directly. */
  level1AProperty: string

  constructor(rootProperty: number, level1AProperty: string) {
    super(rootProperty)
    this.level1AProperty = level1AProperty
  }
}

export interface Level1BType extends RootType {
  /* NOTE: Not having `readonly` on an interface means that the property can be read via this type, and that the user
           _is allowed to try to set the property via this type, and can learn at runtime whether this is possible or
           not_. There is no guarantee that this will work, as subtypes are _not required to make setting the property
           value possible_ (see `Level1BClass`). */
  level1BProperty: boolean
}
export function isLevel1BType(candidate: unknown): candidate is Level1AType {
  return isRootType(candidate) && 'level1BProperty' in candidate && typeof candidate.level1BProperty === 'boolean'
}

export abstract class Level1BClass extends RootClass implements Level1BType {
  /* NOTE: `readonly` means that, via this type, the property can be read, but not set. But this is only guarded at
           compile time. `readonly` has no effect on the transpiled code. So, if we access an instance of this type via
           `Level1BType`, we can set the property, and nobody keeps us from doing so. */
  readonly level1BProperty: boolean

  protected constructor(rootProperty: number, level1BProperty: boolean) {
    super(rootProperty)
    this.level1BProperty = level1BProperty
  }
}

export interface Level2Type extends Level1AType, Level1BType {
  level2Property: Level1AType
}

export function isLevel2Type(candidate: unknown): candidate is Level2Type {
  return (
    isLevel1AType(candidate) &&
    isLevel1BType(candidate) &&
    'level2Property' in candidate &&
    isLevel1AType(candidate.level2Property)
  )
}

export class Level2Class extends Level1BClass implements Level2Type {
  level1AProperty: string
  level2Property: Level1AType

  constructor(rootProperty: number, level1BProperty: boolean, level2Property: Level1AType) {
    super(rootProperty, level1BProperty)
    this.level1AProperty = level2Property.level1AProperty
    this.level2Property = level2Property
  }
}

export class Level3Class extends Level2Class {
  readonly level3Property: ReadonlyArray<RootType>

  constructor(rootProperty: number, level1BProperty: boolean, level2Property: Level1AType) {
    super(rootProperty, level1BProperty, level2Property)
    this.level3Property = [this]
  }
}
