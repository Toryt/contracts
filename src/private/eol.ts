/*
  Copyright 2019–2025 Jan Dockx

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

export { EOL as osEOL } from 'os'

export type EOL = '\n' | '\r\n'

export const nEOL = '\n'
export const rnEOL = '\r\n'

const message = 'STACK MESSAGE'
const stackError = new Error(message)

/**
 * Determine the EOL used by this JavaScript engine in Error stack traces. It turns out this is not always `os.EOL`.
 * The default is '\n' (Unix).
 */
export const stackEOL: EOL =
  'stack' in stackError && stackError.stack.startsWith(message + rnEOL)
    ? /* istanbul ignore next: platform dependent */ rnEOL
    : nEOL
