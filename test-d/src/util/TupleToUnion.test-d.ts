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

// import { expectAssignable, expectNotAssignable } from 'tsd'
// // Define a tuple of tuples
// import type { TupleToUnion } from '../../../src/util/StartingTuples.ts'
//
// type ExampleTuple = [[1, 2], [1], []]
//
// // Apply the type transformation
// type Result = TupleToUnion<ExampleTuple>
//
// /* TODO rm when no longer needed
//   printType(undefined as unknown as Result)
// */
//
// // Positive test cases: these should be assignable to the union
// expectAssignable<Result>([1, 2]) // Valid
// expectAssignable<Result>([1]) // Valid
// expectAssignable<Result>([]) // Valid
//
// // Negative test cases: these should not be assignable to the union
// expectNotAssignable<Result>([1, 2, 3]) // Invalid
// expectNotAssignable<Result>('string') // Invalid
// expectNotAssignable<Result>(42) // Invalid
