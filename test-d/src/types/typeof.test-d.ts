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

import { expectAssignable, expectNotAssignable } from 'tsd'
import type { PrimitiveTypeof, TruePrimitive, TruePrimitiveTypeof, Primitive, Typeof } from '../../../src/index.ts'
import { aSignature } from '../../../test2/util/SomeSignatures.ts'

const aString = 'a string'
const aNumber = 42
const aBigInt = 72349237237429379234n
const aSymbol = Symbol('a symbol typeof test')
const anObject = {}

expectAssignable<TruePrimitiveTypeof>('string')
expectAssignable<TruePrimitiveTypeof>('number')
expectAssignable<TruePrimitiveTypeof>('boolean')
expectAssignable<TruePrimitiveTypeof>('symbol')
expectAssignable<TruePrimitiveTypeof>('bigint')
expectNotAssignable<TruePrimitiveTypeof>('undefined')
expectNotAssignable<TruePrimitiveTypeof>('object')
expectNotAssignable<TruePrimitiveTypeof>('function')
expectNotAssignable<TruePrimitiveTypeof>('')
expectNotAssignable<TruePrimitiveTypeof>('another string')

expectAssignable<TruePrimitive>(aString)
expectAssignable<TruePrimitive>(aNumber)
expectAssignable<TruePrimitive>(true)
expectAssignable<TruePrimitive>(false)
expectAssignable<TruePrimitive>(aSymbol)
expectAssignable<TruePrimitive>(aBigInt)
expectNotAssignable<TruePrimitive>(undefined)
expectNotAssignable<TruePrimitive>(anObject)
expectNotAssignable<TruePrimitive>(aSignature)

expectAssignable<PrimitiveTypeof>('string')
expectAssignable<PrimitiveTypeof>('number')
expectAssignable<PrimitiveTypeof>('boolean')
expectAssignable<PrimitiveTypeof>('symbol')
expectAssignable<PrimitiveTypeof>('bigint')
expectAssignable<PrimitiveTypeof>('undefined')
expectNotAssignable<PrimitiveTypeof>('object')
expectNotAssignable<PrimitiveTypeof>('function')
expectNotAssignable<PrimitiveTypeof>('')
expectNotAssignable<PrimitiveTypeof>('another string')

expectAssignable<Primitive>(aString)
expectAssignable<Primitive>(aNumber)
expectAssignable<Primitive>(true)
expectAssignable<Primitive>(false)
expectAssignable<Primitive>(aSymbol)
expectAssignable<Primitive>(aBigInt)
expectAssignable<Primitive>(undefined)
expectNotAssignable<Primitive>(anObject)
expectNotAssignable<Primitive>(aSignature)

expectAssignable<Typeof>('string')
expectAssignable<Typeof>('number')
expectAssignable<Typeof>('boolean')
expectAssignable<Typeof>('symbol')
expectAssignable<Typeof>('bigint')
expectAssignable<Typeof>('undefined')
expectAssignable<Typeof>('object')
expectAssignable<Typeof>('function')
expectNotAssignable<Typeof>('')
expectNotAssignable<Typeof>('another string')
