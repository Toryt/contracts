/*
  Copyright 2015–2025 Jan Dockx

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

import { type EOL, stackEOL, rnEOL, nEOL } from '../../src/private/eol.ts'

export const intentionalError: Error = new Error('This condition intentionally fails.')

export function intentionallyFailingFunction(): never {
  throw intentionalError
}

export const intentionallyFailingArrow = (): never => {
  throw intentionalError
}

export const intentionallyFailingAsyncArrow = async (): Promise<never> => {
  throw intentionalError
}

export const intentionallyRejectedPromise: Promise<never> = Promise.reject(intentionalError)
/* Note detects this as an UnhandledPromiseRejectionWarning, although we do nothing with it. The following code works
   around the confusing warning. */
intentionallyRejectedPromise.catch(() => {})

export const intentionallyRejectingArrow = (): Promise<never> => intentionallyRejectedPromise

export const notStackEOL: EOL = stackEOL === nEOL ? rnEOL : nEOL
