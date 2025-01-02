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

/**
 * Precondition: `T` is a tuple with a final rest element, or `T` is an array that is not a tuple (representing the
 *               final rest element of a larger tuple outside the scope of this call, because `[...R[]] === R[]`).
 *               If `T` is a tuple with a final rest element, the elements before it can be required or optional, but
 *               required elements cannot follow optional elements.
 */
export type FinalRestElement<T extends unknown[]> = number extends T['length']
  ? T extends [first: infer First1, ...tail: infer Tail1]
    ? FinalRestElement<Tail1> // required single first element, continue
    : T extends [first?: infer First, ...tail: infer Tail2]
      ? T extends [first?: First, ...tail: First[]]
        ? /* If `T === [First?, ...First[]]`, this reduces to `T === [First?, ...First[]] === [...First[]] === First[]`.
           This still matches `[first?: infer First, ...tail: infer Tail2]`. `T` is the rest element type.
           The only way `first` can be a separate optional element is if `Tail2 !== First[]`. */
          [T, 'rest']
        : FinalRestElement<Tail2>
      : [T, 'rest'] // `T` is unbounded array
  : 'error: tuple does not contain a rest element and is not an unbounded array'

export type LastTupleElement<T extends unknown[]> = T extends []
  ? 'error: there is no last tuple element in an empty tuple'
  : T extends [...start: unknown[], last: infer Last1] // required single
    ? [Last1, 'required']
    : /* The last element is not required. It is either optional or rest.
         Since rest elements can not be followed by optional or other rest elements, if there is a rest element in `T`,
         it is the last one. */ number extends T['length'] // T has a rest element (otherwise T['length'] would be a (union of) bounded numbers)
      ? FinalRestElement<T>
      : T extends [...start: infer _, last?: infer Last2] // NOTE explicitly add when returned ? in a tuple!
        ? [Last2, 'optional'] // optional single
        : 'impossible: not empty, not required, not optional or rest'
