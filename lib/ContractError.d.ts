/*
 Copyright 2021 - 2021 by Jan Dockx

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

// noinspection LocalVariableNamingConventionJS
/**
 * ContractError is the general supertype of all errors thrown by Toryt Contracts.
 * ContractError itself is to be considered abstract.
 *
 * The main feature of a ContractError is that it provides a safe, cross-platform stack trace.
 * Instances should be frozen before they are thrown.
 *
 * <h3>Invariants</h3>
 * <ul>
 *   <li>`name` is a mandatory property, and refers to a string</li>
 *   <li>`message` refers to a string</li>
 *   <li>`stack` is a read-only property, that returns a string, that starts with the instances `name`, the
 *     string ": ", and `message`, and is followed by stack code references, that do no contain references
 *     to the inner workings of the Toryt Contracts library.</li>
 * </ul>
 */
export declare class ContractError extends Error {
  static message: "abstract type"

  readonly _rawStack: string // ~ private

  readonly name: string
  readonly message: string
  get stack(): string

  constructor(rawStack: string)
}
