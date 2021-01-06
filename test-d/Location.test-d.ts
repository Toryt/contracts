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

import { expectAssignable, expectNotAssignable, expectNotType, expectType } from 'tsd'
import { StackLocation } from '../lib/Location'

const aStackLocation = '    at REPLServer.emit (events.js:327:22)\n'

expectAssignable<StackLocation>(aStackLocation)
expectNotType<StackLocation>(aStackLocation) // it's a string
expectNotAssignable<StackLocation>(null)
expectNotAssignable<StackLocation>(undefined)
// noinspection MagicNumberJS
expectNotAssignable<StackLocation>(42)
expectNotAssignable<StackLocation>(true)
expectNotAssignable<StackLocation>(false)
expectNotAssignable<StackLocation>([])
expectNotAssignable<StackLocation>({})

const typedStackLocation: StackLocation = aStackLocation
expectType<StackLocation>(typedStackLocation)

// sadly …
expectAssignable<StackLocation>(  '')
