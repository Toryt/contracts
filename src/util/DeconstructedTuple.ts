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
 * The possible kinds of tuple elements.
 */
export type TupleElementKind = 'required' | 'optional' | 'rest'

/**
 * Most general tuple element in a tuple deconstruction.
 */
export interface TupleElement<TupleElementType> {
  value: TupleElementType
  kind: TupleElementKind
}

/**
 * A required (non-optional, non-rest) tuple element in a tuple deconstruction.
 *
 * Required tuple elements can appear anywhere in a tuple that represents a function signature arguments list.
 */
export interface RequiredTupleElement<TupleElementType> extends TupleElement<TupleElementType> {
  kind: 'required'
}

/**
 * An optional (non-required, non-rest) tuple element in a tuple deconstruction. The type of optional tuple elements
 * always allows `undefined`.
 *
 * ```
 * [a: A, b?: B] --> B | undefined
 * ```
 *
 * Optional tuple elements can appear anywhere in a tuple that represents a function signature arguments list.
 * Optional tuple elements can be followed by rest tuple elements.
 *
 * Yet,
 *
 * * When an optional tuple element is followed by a required tuple element, it is interpreted as a required argument
 *   that also can be `undefined`, and will be represented as such in the deconstruction. The position in the arguments
 *   list cannot be skipped.
 *
 *   ```
 *   [a: A, b?: B, c: C] === [a: A, b: B | undefined, c: C]
 *   ```
 *
 *   It is easier and less confusing to define this as a required element with a type that includes
 *   `undefined` directly.
 *
 * * When an optional tuple element is preceded by a rest tuple element, they collapse into 1 rest tuple element:
 *
 *   ```
 *   [a: A, ...b: B, c?: C, d?: D]
 *     === [a: A, ...b: B, c?: C | undefined, d?: D | undefined]
 *     === [a: A, ...b: B | C | D | undefined]
 *   ```
 */
export interface OptionalTupleElement<TupleElementType extends unknown | undefined>
  extends TupleElement<TupleElementType> {
  kind: 'optional'
}

/**
 * A rest (non-required, non-optional) tuple element in a tuple deconstruction. The type in the deconstruction is the
 * type of one element, while the rest element syntax in function signatures and tuples features an array of the element
 * types.
 *
 * ```
 * [...rest: R[]] --> R
 * ```
 *
 * Rest tuple elements can appear anywhere in a tuple that represents a function signature arguments list, but there can
 * at most be one.
 */
export interface RestTupleElement<TupleElementType extends unknown> extends TupleElement<TupleElementType> {
  kind: 'rest'
}

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never

/**
 * Precondition: `T` is a tuple with a final rest element, or `T` is an array that is not a tuple (representing the
 *               final rest element of a larger tuple outside the scope of this call, because `[...R[]] === R[]`).
 *               If `T` is a tuple with a final rest element, the elements before it can be required or optional, but
 *               required elements cannot follow optional elements.
 */
type DeconstructedTupleWithFinalRest<T extends unknown[]> = number extends T['length']
  ? T extends [first: infer RequiredFirst, ...tail: infer TailWithRequiredFirst]
    ? [RequiredTupleElement<RequiredFirst>, ...DeconstructedTupleWithFinalRest<TailWithRequiredFirst>]
    : T extends [first?: infer NonRequiredFirst, ...tail: infer TailWithNonRequiredFirst]
      ? T extends [first?: NonRequiredFirst, ...tail: NonRequiredFirst[]]
        ? /* If `T === [NonRequiredFirst?, ...NonRequiredFirst[]]`, this reduces to
             `T === [NonRequiredFirst?, ...NonRequiredFirst[]] === [...NonRequiredFirst[]] === NonRequiredFirst[]`.
             This still matches `[first?: infer NonRequiredFirst, ...tail: infer TailWithNonRequiredFirst]`. `T` is the
              rest element type. The only way `first` can be a separate optional element is if
              `TailWithNonRequiredFirst !== NonRequiredFirst[]`. */
          [RestTupleElement<NonRequiredFirst>]
        : [OptionalTupleElement<NonRequiredFirst>, ...DeconstructedTupleWithFinalRest<TailWithNonRequiredFirst>]
      : [RestTupleElement<ArrayElement<T>>] // `T` is unbounded array
  : ['error: tuple does not contain a rest element and is not an unbounded array']

/**
 * * The normal order in signatures and tuples is `[required[0..*], optional[0..*], rest[0..1]]`.
 * * Optional tuple elements only make sense after all required tuple elements and before a rest tuple elements:
 *   * An optional tuple element before a required degenerates into a required tuple element.
 *   * An optional tuple element after a rest tuple element collapses them into a combined rest tuple element.
 * * A rest tuple element before a required tuple element is possible without issues.
 */
export type DeconstructedTuple<T extends unknown[]> = T extends [
  ...start: infer StartWithRequiredLast,
  last: infer RequiredLast
]
  ? [...DeconstructedTuple<StartWithRequiredLast>, RequiredTupleElement<RequiredLast>]
  : T extends []
    ? []
    : /* The last element is not required. It is either optional or rest.
       Since rest elements can not be followed by optional or other rest elements, if there is a rest element in `T`,
       it is the last one. */ number extends T['length']
      ? DeconstructedTupleWithFinalRest<T> // T has a rest element (otherwise T['length'] would be a (union of) bounded numbers)
      : T extends [...start: infer StartWithOptionalLast, last?: infer OptionalLast]
        ? [...DeconstructedTuple<StartWithOptionalLast>, OptionalTupleElement<OptionalLast>]
        : 'impossible: not empty, not required, not optional or rest'
