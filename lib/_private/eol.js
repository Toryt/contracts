/*
  Copyright 2019 - 2020 by Jan Dockx

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

const os = require('os').EOL

const n = '\n'
const rn = '\r\n'

const message = 'STACK MESSAGE'
const mayBeAStack = new Error(message).stack

/**
 * Determine the EOL used by this JavaScript engine in Error stack traces. It turns out this is not always `os.EOL`.
 * The default is '\n' (Unix).
 */
const stack =
  mayBeAStack && mayBeAStack.startsWith(message + rn) ? /* istanbul ignore next: platform dependent */ rn : n

module.exports = {
  n,
  rn,
  stack,
  os
}
