/*
  Copyright 2018–2024 Jan Dockx

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

'use strict'

/* Load AsyncContractFunction test only when async is supported (not on Node6) */

function supportsAsync() {
  try {
    // eslint-disable-next-line
    eval('async () => {}')
    return true
  } catch (e) {
    if (e instanceof SyntaxError) {
      return false
    } else {
      throw e // throws CSP error
    }
  }
}

if (supportsAsync()) {
  console.log('async is supported: also running 10.2.AsyncContractFunctionTestOptional')
  require('./11.2.AsyncContractFunctionTestOptional')
} else {
  console.log('async is NOT supported: not running 10.2.AsyncContractFunctionTestOptional')
}
