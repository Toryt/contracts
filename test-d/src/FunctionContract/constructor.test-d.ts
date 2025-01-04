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

// import { expectType, expectError } from 'tsd'
// import { FunctionContract, type ContractFunction } from '../../../src/index.ts'
// import type { Postcondition } from '../../../src/Postcondition.ts'
// import type { ASignature } from '../../../test2/util/ASignature.ts'
// import type { Level1BType, Level2Type, RootType } from '../../../test2/util/SomeTypes.ts'
//
// const post: Array<Postcondition<ASignature>> = [
//   (args: [number], result: Level2Type): boolean => result.rootProperty === args[0],
//   (args: [number, Level1BType], result: Level2Type): boolean => result === args[1]
// ]
//
// // Default postconditions
// const contractDefault = new FunctionContract<ASignature>({})
// expectType<FunctionContract<ASignature>>(contractDefault)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(contractDefault.post)
//
// // With postconditions
// const contractWithPost = new FunctionContract<ASignature>({ post })
// expectType<FunctionContract<ASignature>>(contractWithPost)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(contractWithPost.post)
//
// // broader arguments
// const broaderArgumentsInPost = new FunctionContract<ASignature>({
//   post: [(args: [unknown, Level1BType], result: Level2Type): boolean => typeof args[0] === 'number']
// })
// expectType<FunctionContract<ASignature>>(broaderArgumentsInPost)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(broaderArgumentsInPost.post)
//
// const lessArgumentsInPost = new FunctionContract<ASignature>({
//   post: [(args: [number], result: Level2Type): boolean => true]
// })
// expectType<FunctionContract<ASignature>>(lessArgumentsInPost)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(lessArgumentsInPost.post)
//
// const broaderReturnTypeInPost = new FunctionContract<ASignature>({
//   post: [(args: [number, Level1BType], result: RootType): boolean => result === args[1]]
// })
// expectType<FunctionContract<ASignature>>(broaderReturnTypeInPost)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(broaderReturnTypeInPost.post)
//
// const broadestReturnTypeInPost = new FunctionContract<ASignature>({
//   post: [(args: [number, Level1BType], result: unknown): boolean => typeof result === 'number']
// })
// expectType<FunctionContract<ASignature>>(broadestReturnTypeInPost)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(broadestReturnTypeInPost.post)
//
// const stringPostResult = new FunctionContract<ASignature>({
//   post: [(args: [number, Level1BType], result: Level2Type): string => typeof result]
// })
// expectType<FunctionContract<ASignature>>(stringPostResult)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(stringPostResult.post)
//
// const numberPostResult = new FunctionContract<ASignature>({
//   post: [(args: [number, Level1BType], result: Level2Type): number | undefined => args[0]]
// })
// expectType<FunctionContract<ASignature>>(numberPostResult)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(numberPostResult.post)
//
// const objectPostResult = new FunctionContract<ASignature>({
//   post: [(args: [number, Level1BType], result: Level2Type): object | null => null]
// })
// expectType<FunctionContract<ASignature>>(objectPostResult)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(objectPostResult.post)
//
// const unknownPostResult = new FunctionContract<ASignature>({
//   post: [(args: [number, Level1BType], result: Level2Type): unknown => null]
// })
// expectType<FunctionContract<ASignature>>(unknownPostResult)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(unknownPostResult.post)
//
// // Sadly valid
// const sadlyValidPostCondition = new FunctionContract<ASignature>({
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   post: [(args: [number, Level1BType], result: Level2Type): any => 42]
// })
// expectType<FunctionContract<ASignature>>(sadlyValidPostCondition)
// expectType<ReadonlyArray<Postcondition<ASignature>>>(sadlyValidPostCondition.post)
//
// // wrong arguments
// expectError(
//   new FunctionContract<ASignature>({
//     post: [(args: [string, Level1BType], result: Level2Type): boolean => result.startsWith(args[0])]
//   })
// )
// expectError(
//   new FunctionContract<ASignature>({
//     post: [(args: [number, never], result: Level2Type): boolean => result.startsWith(args[0])]
//   })
// )
// expectError(
//   new FunctionContract<ASignature>({
//     post: [(args: [number, Level1BType, string], result: Level2Type): boolean => result.startsWith(args[0])]
//   })
// )
//
// // wrong return type
// expectError(
//   new FunctionContract<ASignature>({
//     post: [(args: [number, Level1BType], result: string): boolean => result.startsWith(args[0])]
//   })
// )
// expectError(
//   new FunctionContract<ASignature>({
//     post: [(args: [number, Level1BType], result: never): boolean => result.startsWith(args[0])]
//   })
// )
