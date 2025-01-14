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

export type Environment =
  | 'node'
  | 'opera'
  | 'firefox'
  | 'safari'
  | 'ie'
  | 'edge'
  | 'chrome'
  | 'headless-chrome'
  | 'android'
  | 'safari <= 12'
  | 'blink'
  | 'browser'
  | undefined

// http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
// noinspection OverlyComplexFunctionJS,FunctionTooLongJS
function getEnvironment(): Environment {
  // MUDO do we really need this?
  // eslint-disable-next-line no-new-func
  if (new Function('try {return this === global;}catch(e){return false;}')()) {
    console.log('Node (no User Agent)')
    return 'node'
  }
  const ua = navigator.userAgent
  console.log(`User Agent: "${ua}"`)
  const windowRecord = window as unknown as Record<string, unknown>
  // noinspection JSUnresolvedVariable
  if (
    (!!windowRecord['opr'] && !!(windowRecord['opr'] as Record<string, object>)['addons']) ||
    !!windowRecord['opera'] ||
    navigator.userAgent.indexOf(' OPR/') >= 0
  ) {
    return 'opera'
  }
  // @ts-expect-error
  if (typeof InstallTrigger !== 'undefined') {
    return 'firefox'
  }
  // this no longer detects safari in v11
  if (
    /constructor/i.test(window.HTMLElement as unknown as string) ||
    (function (p: true | object | undefined): boolean {
      return !!p && p.toString() === '[object SafariRemoteNotification]'
    })(!windowRecord['safari'] || (windowRecord['safari'] as Record<string, object>)['pushNotification'])
  ) {
    return 'safari'
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (/* @cc_on!@ */ false || !!(document as unknown as Record<string, unknown>)['documentMode']) {
    return 'ie'
  }
  if (windowRecord['StyleMedia']) {
    return 'edge'
  }
  if (windowRecord['chrome']) {
    return 'chrome'
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (window.CSS) {
    if (ua.indexOf('HeadlessChrome') >= 0) {
      return 'headless-chrome'
    }
    if (ua.indexOf('Linux; Android') >= 0) {
      return 'android'
    }
    if (ua.indexOf('Edge') >= 0) {
      return 'edge'
    }
    if (ua.indexOf('Safari/') >= 0 && (ua.indexOf('Version/11') >= 0 || ua.indexOf('Version/12') >= 0)) {
      return 'safari <= 12'
    }
    if (ua.indexOf('Safari/') >= 0 && ua.indexOf('Version/') >= 0) {
      return 'safari'
    }
    return 'blink'
  }
  // eslint-disable-next-line no-new-func
  if (new Function('try {return this === window;}catch(e){ return false;}')()) {
    return 'browser'
  }
  return undefined
}

export const environment: Environment = getEnvironment()
console.log(`Detected environment "${environment}"`)
