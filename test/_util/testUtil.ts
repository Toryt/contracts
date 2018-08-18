/*
Copyright 2016 - 2018 by Jan Dockx

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

import * as must from 'must'
import { EOL } from 'os'

// noinspection FunctionNamingConventionJS
export function x(...args: any[][]): any[] {
  if (args.length <= 0) {
    return []
  }
  return Array.prototype.reduce.call(
    args,
    (acc: any[][], arrayI: any[]) => {
      const ret: any[][] = []
      acc.forEach((elementSoFar: any[]): void => {
        arrayI.forEach((elementOfI: any): void => {
          ret.push(elementSoFar.concat([elementOfI]))
        })
      })
      return ret
    },
    [[]]
  )
}

export interface IndexedObject {
  [index: string]: any
}

export function expectOwnFrozenProperty(
  subject: IndexedObject,
  propertyName: string
): void {
  const propertyDescriptor:
    | PropertyDescriptor
    | undefined = Object.getOwnPropertyDescriptor(subject, propertyName)
  must(propertyDescriptor).be.truthy()
  must(propertyDescriptor!.enumerable).must.be.true()
  must(propertyDescriptor!.configurable).must.be.false()
  must(propertyDescriptor!.writable).must.be.false()
  const failFunction = function() {
    // noinspection MagicNumberJS
    subject[propertyName] = 42 + ' some outlandish other value'
  }
  failFunction.must.throw(TypeError)
}

// noinspection FunctionNamingConventionJS
export function prototypeThatHasOwnPropertyDescriptor(
  subject: object | null,
  propertyName: string
): object | null {
  if (!subject) {
    return subject
  }
  if (Object.getOwnPropertyDescriptor(subject, propertyName)) {
    return subject
  }
  return prototypeThatHasOwnPropertyDescriptor(
    Object.getPrototypeOf(subject),
    propertyName
  )
}

// noinspection FunctionNamingConventionJS
export function expectDerivedPropertyOnAPrototype(
  subject: object,
  propertyName: string,
  configurable: boolean
): void {
  const prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName)
  const propertyDescriptor:
    | PropertyDescriptor
    | undefined = Object.getOwnPropertyDescriptor(prototype, propertyName)
  must(propertyDescriptor).exist()
  must(propertyDescriptor!.enumerable).be.true()
  must(propertyDescriptor!.configurable).equal(configurable)
  must(propertyDescriptor).not.have.property('writable')
  must(propertyDescriptor!.get).be.a.function()
  must(propertyDescriptor!.set).be.falsy()
}

// noinspection FunctionNamingConventionJS
export function expectConfigurableDerivedPropertyOnAPrototype(
  subject: object,
  propertyName: string
): void {
  expectDerivedPropertyOnAPrototype(subject, propertyName, true)
}

// noinspection FunctionNamingConventionJS
export function expectFrozenDerivedPropertyOnAPrototype(
  subject: object,
  propertyName: string
): void {
  expectDerivedPropertyOnAPrototype(subject, propertyName, false)
}

export function expectFrozenPropertyOnAPrototype(
  subject: object,
  propertyName: string
) {
  const prototype: object | null = prototypeThatHasOwnPropertyDescriptor(
    subject,
    propertyName
  )
  must(prototype).exist()
  expectOwnFrozenProperty(prototype!, propertyName)
}

// noinspection FunctionNamingConventionJS
export function expectFrozenReadOnlyArrayPropertyWithPrivateBackingField(
  subject: IndexedObject,
  propName: string,
  privatePropName: string
): void {
  subject.must.have.ownProperty(privatePropName) // array not shared
  subject[privatePropName].must.be.an.array()
  expectOwnFrozenProperty(subject, privatePropName)
  subject[propName].must.be.an.array()
  expectFrozenDerivedPropertyOnAPrototype(subject, propName)
  const failFunction = function() {
    // noinspection MagicNumberJS
    subject[propName] = 42 + ' some outlandish other value'
  }
  failFunction.must.throw(TypeError)
}

export function expectToBeArrayOfFunctions(a: Function[]) {
  a.must.be.an.array()
  a.forEach((element: Function) => {
    element.must.be.a.function()
  })
}

const doLog: boolean = false

// noinspection FunctionNamingConventionJS
export function log(...args: any[]): void {
  if (doLog) {
    console.log.apply(undefined, args)
    console.log()
  }
}

export function showStack(exc: Error) {
  log('Exception stack%s---------------%s%s', EOL, EOL, exc.stack)
}

export function regExpEscape(s: string) {
  // http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

export function propertyIsWritable(
  object: object,
  propertyName: string
): boolean {
  const prototype: object | null = prototypeThatHasOwnPropertyDescriptor(
    object,
    propertyName
  )
  const pd: PropertyDescriptor | null | undefined =
    prototype && Object.getOwnPropertyDescriptor(prototype, propertyName)
  return !pd || !!pd.writable
}

export function anyCasesGenerators(discriminator: string): (() => any)[] {
  // noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS
  const generators: (() => any)[] = [
    () => new Error('This is a ' + discriminator + ' case'),
    () => undefined,
    () => null,
    () => 1,
    () => 0,
    () => 'a string that is used as a ' + discriminator,
    () => '',
    () => true,
    () => false,
    () => new Date(),
    () => /foo/,
    () =>
      function() {
        return 'this simulates a ' + discriminator
      },
    // eslint-disable-next-line
    () => new Number(42),
    // eslint-disable-next-line
    () => new Boolean(false),
    // eslint-disable-next-line
    () => new String(discriminator + ' string'),
    () => arguments,
    () => ({}),
    () => ({
      a: 1,
      b: 'b',
      c: {},
      d: { d1: undefined, d2: 'd2', d3: { d31: 31 } }
    }),
    () => []
  ]
  const result: (() => any)[] = generators.slice()
  result.push(() => generators.map((g: () => any): any => g()))
  return result
}

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
  | 'blink'
  | 'browser'
  | undefined

interface EnvironmentWindow extends Window {
  [index: string]: any
}

interface EnvironmentDocument extends Document {
  [index: string]: any
}

declare global {
  const opr: {
    // noinspection SpellCheckingInspection
    addons: any
  }
  // noinspection LocalVariableNamingConventionJS
  const InstallTrigger: any
  const safari: any
}

// http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
// noinspection OverlyComplexFunctionJS, FunctionTooLongJS
export function environment(): Environment {
  // eslint-disable-next-line
  if (new Function('try {return this === global;}catch(e){return false;}')()) {
    console.log('Node (no User Agent)')
    return 'node'
  }
  // noinspection JSUnresolvedVariable
  const ua = navigator.userAgent
  console.log(`User Agent: "${ua}"`)
  const environmentWindow: EnvironmentWindow = window
  // noinspection JSUnresolvedVariable
  if (
    // eslint-disable-next-line
    (!!environmentWindow.opr && !!opr.addons) ||
    !!environmentWindow.opera ||
    navigator.userAgent.indexOf(' OPR/') >= 0
  ) {
    return 'opera'
  }
  // noinspection JSUnresolvedVariable
  if (typeof InstallTrigger !== 'undefined') {
    return 'firefox'
  }
  // this no longer detects safari in v11
  // noinspection JSUnresolvedVariable
  if (
    /constructor/i.test(environmentWindow.HTMLElement) ||
    (function(p) {
      return p.toString() === '[object SafariRemoteNotification]'
    })(
      // eslint-disable-next-line
      !environmentWindow['safari'] || safari.pushNotification
    )
  ) {
    return 'safari'
  }
  // noinspection PointlessBooleanExpressionJS,JSUnresolvedVariable
  if (
    /* @cc_on!@ */ false ||
    !!(document as EnvironmentDocument).documentMode
  ) {
    return 'ie'
  }
  // noinspection JSUnresolvedVariable
  if (environmentWindow.StyleMedia) {
    return 'edge'
  }
  // noinspection JSUnresolvedVariable
  if (!!environmentWindow.chrome && !!environmentWindow.chrome.webstore) {
    return 'chrome'
  }
  // noinspection JSUnresolvedVariable
  if (environmentWindow.CSS) {
    if (ua.indexOf('HeadlessChrome') >= 0) {
      return 'headless-chrome'
    }
    if (ua.indexOf('Linux; Android') >= 0) {
      return 'android'
    }
    if (ua.indexOf('Edge') >= 0) {
      return 'edge'
    }
    if (ua.indexOf('Safari') >= 0) {
      return 'safari'
    }
    return 'blink'
  }
  // eslint-disable-next-line
  if (new Function('try {return this === window;}catch(e){ return false;}')()) {
    return 'browser'
  }
  return undefined
}

export function trimLineAndColumnPattern(stackLine: string): string {
  return (
    stackLine
      // node, chrome
      .replace(/:\d*:\d*\)$/, ')')
      // other browsers
      .replace(/:\d*:\d*$/, '')
  )
}

export function mustBeCallerLocation(actual: string, expected: string): void {
  expected.must.be.a.string()
  trimLineAndColumnPattern(expected).must.equal(
    trimLineAndColumnPattern(actual)
  )
}

export const env: Environment = environment()
console.log(`Detected environment "${env}"`)
