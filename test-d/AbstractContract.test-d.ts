/*
 Copyright 2016 - 2020 by Jan Dockx

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

import { AbstractContract } from '../types'
import { expectType } from 'tsd'

interface SomeObject {
  aProperty: number
}

interface SomeError {
  anErrorProperty: object
}

type AFunction = (this: SomeObject, a: string, b: number) => string

const subject = new AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>({})
expectType<AbstractContract<(this: SomeObject, a: string, b: number) => string, string | SomeError>>(subject)
