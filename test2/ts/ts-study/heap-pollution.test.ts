/*
  Copyright 2025 Jan Dockx

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
import { log } from '../../util/log.ts'
import { testName } from '../../util/testName.ts'

describe(testName(import.meta), function () {
  /* NOTE All is explained in [https://github.com/microsoft/TypeScript/wiki/FAQ#why-method-bivariance] */

  it('does not prevent heap-pollution in arrays', function () {
    const strings: Array<string> = ['a string', 'another string']
    // error: strings[1] = 42
    // error: const newArray = strings.with(1, 42)

    const stringsOrNumbers: Array<string | number> = strings // NOTE: this should not be allowed, because …
    stringsOrNumbers[1] = 42 // NOTE: … stringsOrNumbers, which is strings, now contains a number

    strings.should.be.an.Array()
    strings.forEach(s => {
      // s.should.be.a.String() AssertionError: expected 42 to be a string
      should(typeof s === 'string' || typeof s === 'number').be.true()
    })

    const newArray = stringsOrNumbers.with(1, 42) // ok; this does not change the original array
    newArray.should.be.an.Array()
  })

  it('does not prevent heap-pollution in generic reference types', function () {
    class Animal {
      readonly name: string

      constructor(name: string) {
        this.name = name
      }
    }

    class Cat extends Animal {
      miauw(): string {
        return 'miauw'
      }
    }

    class Dog extends Animal {
      bark(): string {
        return 'bark'
      }
    }

    const aDog: Dog = new Dog('fido')
    const aCat: Cat = new Cat('spot')
    // const twisted: Dog = aCat TS2741: Property bark is missing in type Cat but required in type Dog

    const dogs: Array<Dog> = [aDog, new Dog('max')]
    const animals: Array<Animal> = dogs // NOTE: this should not be allowed, because …
    animals[2] = aCat // NOTE: … animals, which is dogs, not contains a cat …

    dogs.should.be.an.Array()
    dogs.forEach(d => {
      // d.should.be.instanceof(Dog) AssertionError: expected Cat { name: 'spot' } to be an instance of Dog
      should(d instanceof Animal).be.true()
    })

    function allBarks(): void {
      dogs.forEach(d => d.bark()) // NOTE: … and cats don't bark <-- runtime error
    }
    allBarks.should.throw()

    class Indirector<T> {
      thing?: T

      get(): T | undefined {
        return this.thing
      }

      set(t: T): void {
        this.thing = t
      }
    }

    const iDog = new Indirector<Dog>()
    const iAnimal: Indirector<Animal> = iDog // NOTE: this should not be allowed, because …
    iAnimal.set(new Cat('sylvester')) // NOTE: … iAnimal, which is iDog, now references a Cat …
    iAnimal.thing = new Cat('stripes') // NOTE: … iAnimal, which is iDog, now references a Cat …
    const dog = iDog.get()

    // should(dog).be.instanceof(Dog) AssertionError: expected Cat { name: 'cathy' } to be an instance of Dog
    should(dog).be.instanceof(Animal)

    if (dog !== undefined) {
      // dog.bark() // NOTE: … and cats don't bark <-- runtime error TypeError: dog.bark is not a function
      should(dog.bark).be.undefined()
    }

    /* NOTE: in / out annotation of generic parameters do not seem to be possible, or help */

    /* NOTE: ******************************************
             ******************************************
             BUT WE _CAN_ MAKE TS BEHAVE AS EXPECTED …
             ******************************************
             *******************************************/
    class Indirector2<T> {
      thing?: T

      get(): T | undefined {
        return this.thing
      }

      // NOTE: making set a property with a syntax (for wich correct covariant behavior is required …
      readonly set: (t: T) => void = function (this: Indirector2<T>, t: T): void {
        this.thing = t
      }
    }

    const iDog2 = new Indirector2<Dog>()
    /* NOTE: Now it fails:
             TS2375: Type Indirector2<Dog> is not assignable to type Indirector2<Animal> with
                     'exactOptionalPropertyTypes: true'. Consider adding undefined to the types of the target's
                     properties.
                       Types of property set are incompatible.
                         Type (t: Dog) => void is not assignable to type (t: Animal) => void
                           Types of parameters t and t are incompatible.
                             Property bark is missing in type Animal but required in type Dog
    const iAnimal2: Indirector2<Animal> = iDog2
    */
    log(iDog2)
  })
})
