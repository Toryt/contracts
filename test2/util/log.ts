/*
  Copyright 2016–2025 Jan Dockx

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

import { EOL } from 'os'

const doLog = false

export function log(...args: unknown[]): void {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (doLog) {
    console.log(...args)
    console.log()
  }
}

export function showStack(exc: { stack?: string }): void {
  log('Exception stack%s---------------%s%s', EOL, EOL, exc.stack)
}
