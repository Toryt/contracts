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
 * Represents the most restrictive function type in TypeScript.
 *
 * A `NeverFunction` is a function that:
 *
 * * Takes no arguments (no valid arguments are allowed).
 * * Returns `never` (indicating it never successfully returns a value).
 *
 * This is the “bottom type” for function types that are still functions, meaning it is the most specific function type,
 * and no other function type is assignable to it unless it matches exactly.
 *
 * However, the “true bottom type” in TypeScript is still `never`. Even a `NeverFunction` is not assignable to `never`,
 * as `NeverFunction` remains a function type.
 *
 * Example:
 * ```typescript
 * const aNeverFunction: NeverFunction = function() {
 *   throw new Error("This function never returns")
 * }
 *
 * // Valid assignment:
 * expectAssignable<NeverFunction>(aNeverFunction);
 *
 * // Invalid assignments:
 * expectNotAssignable<NeverFunction>((a: number): never => { throw new Error() })
 * expectNotAssignable<NeverFunction>(() => 42) // Does not return `never`
 * ```
 */
export type NeverFunction = (this: unknown) => never
