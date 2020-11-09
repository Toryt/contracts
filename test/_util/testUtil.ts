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

import * as should from "should";
import type {Stack, StackLocation} from "../../lib/_private/is";
import {EOL as osEOL} from "os";

// noinspection FunctionNamingConventionJS
export function x (this: void): Array<never>;
// noinspection ParameterNamingConventionJS,FunctionNamingConventionJS
export function x <T1> (this: void, _a1: ReadonlyArray<T1>): Array<[T1]>;
// noinspection ParameterNamingConventionJS,FunctionNamingConventionJS
export function x <T1, T2> (this: void, _a1: ReadonlyArray<T1>, _a2: ReadonlyArray<T2>): Array<[T1, T2]>;
// noinspection ParameterNamingConventionJS,FunctionNamingConventionJS
export function x <T1, T2, T3> (this: void, _a1: ReadonlyArray<T1>, _a2: ReadonlyArray<T2>, _a3: ReadonlyArray<T3>): Array<[T1, T2, T3]>;
// noinspection ParameterNamingConventionJS,FunctionNamingConventionJS
export function x <T1, T2, T3, T4> (this: void, _a1: ReadonlyArray<T1>, _a2: ReadonlyArray<T2>, _a3: ReadonlyArray<T3>, _a4: ReadonlyArray<T4>): Array<[T1, T2, T3, T4]>;
// noinspection ParameterNamingConventionJS,FunctionNamingConventionJS
export function x <T1, T2, T3, T4, T5> (this: void, _a1: ReadonlyArray<T1>, _a2: ReadonlyArray<T2>, _a3: ReadonlyArray<T3>, _a4: ReadonlyArray<T4>, _a5: ReadonlyArray<T5>): Array<[T1, T2, T3, T4, T5]>;
// noinspection FunctionNamingConventionJS
export function x (this: void, ...args: ReadonlyArray<ReadonlyArray<any>>): Array<Array<any>> {
  if (arguments.length <= 0) {
    return [];
  }
  return args.reduce(
    (acc: Array<Array<any>>, arrayI: ReadonlyArray<any>): Array<Array<any>> => {
      const ret: Array<Array<any>> = [];
      acc.forEach((elementSoFar: ReadonlyArray<any>) => {
        arrayI.forEach((elementOfI: any): void => {
          ret.push(elementSoFar.concat([elementOfI]));
        });
      });
      return ret;
    },
    [[]]
  );
}

export function expectOwnFrozenProperty <P extends PropertyKey> (this: void, subject: {[key in P]: any}, propertyName: P): void {
  const propertyDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(subject, propertyName);
  should(propertyDescriptor).be.ok();
  should((propertyDescriptor as PropertyDescriptor).enumerable).be.true();
  should((propertyDescriptor as PropertyDescriptor).configurable).be.false();
  should((propertyDescriptor as PropertyDescriptor).writable).be.false();
  const failFunction: () => void = function (): void { // compiler does not accept `never`
    // noinspection MagicNumberJS
    subject[propertyName] = 42 + ' some outlandish other value';
  };
  failFunction.should.throw(TypeError);
}

// noinspection FunctionNamingConventionJS
export function prototypeThatHasOwnPropertyDescriptor <P extends PropertyKey, R extends {[key in P]: any}, S extends R> (this: void, subject: S, propertyName: P): R {
  if (!subject) {
    return subject;
  }
  if (Object.getOwnPropertyDescriptor(subject, propertyName)) {
    return subject;
  }
  return prototypeThatHasOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyName);
}

// noinspection FunctionNamingConventionJS
export function expectDerivedPropertyOnAPrototype <P extends PropertyKey> (this: void, subject: {[key in P]: any}, propertyName: P, configurable: boolean): void {
  const prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName);
  const propertyDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(prototype, propertyName);
  should(propertyDescriptor).be.ok();
  should((propertyDescriptor as PropertyDescriptor).enumerable).be.true();
  should((propertyDescriptor as PropertyDescriptor).configurable).equal(configurable);
  should(propertyDescriptor).not.have.property('writable');
  should((propertyDescriptor as PropertyDescriptor).get).be.a.Function();
  should((propertyDescriptor as PropertyDescriptor).set).not.be.ok();
}

// noinspection FunctionNamingConventionJS
export function expectConfigurableDerivedPropertyOnAPrototype <P extends PropertyKey> (this: void, subject: {[key in P]: any}, propertyName: P): void {
  expectDerivedPropertyOnAPrototype(subject, propertyName, true);
}

// noinspection FunctionNamingConventionJS
export function expectFrozenDerivedPropertyOnAPrototype <P extends PropertyKey> (this: void, subject: {[key in P]: any}, propertyName: P): void {
  expectDerivedPropertyOnAPrototype(subject, propertyName, false);
}

export function expectFrozenPropertyOnAPrototype <P extends PropertyKey, R extends {[key in P]: any}, S extends R> (this: void, subject: S, propertyName: P): void {
  const prototype: R = prototypeThatHasOwnPropertyDescriptor(subject, propertyName);
  expectOwnFrozenProperty(prototype, propertyName);
}

// noinspection FunctionNamingConventionJS
export function expectFrozenReadOnlyArrayPropertyWithPrivateBackingField <P extends PropertyKey, PP extends string, R extends {[key in P | PP]: any}, S extends R> (this: void, subject: S, propName: P, privatePropName: PP): void {
  subject.should.have.ownProperty(privatePropName); // array not shared
  subject[privatePropName].should.be.an.Array();
  expectOwnFrozenProperty(subject, privatePropName);
  subject[propName].should.be.an.Array();
  expectFrozenDerivedPropertyOnAPrototype(subject, propName);
  const failFunction: () => void = function (): void {
    // noinspection MagicNumberJS
    subject[propName] = 42 + ' some outlandish other value' as S[P];
  };
  failFunction.should.throw(TypeError);
}

export function expectToBeArrayOfFunctions (this: void, a: Array<Function>): void {
  a.should.be.an.Array();
  a.forEach((element: Function) : void => {
    element.should.be.a.Function();
  });
}

const doLog: boolean = true;

// noinspection FunctionNamingConventionJS
export function log (this: void, ... args: Array<any>): void {
  if (doLog) {
    console.log.apply(undefined, args);
    console.log();
  }
}

export function showStack <E extends {stack: Stack}> (this: void, exc: E): void {
  log('Exception stack%s---------------%s%s', osEOL, osEOL, exc.stack);
}

export function regExpEscape (this: void, s: string): string {
  // http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function propertyIsWritable <P extends PropertyKey, R extends {[key in P]: any}, S extends R> (this: void, object: S, propertyName: P): boolean {
  const prototype = prototypeThatHasOwnPropertyDescriptor(object, propertyName);
  const pd: PropertyDescriptor | undefined = prototype && Object.getOwnPropertyDescriptor(prototype, propertyName);
  return !pd || pd.writable || false;
}

export function anyCasesGenerators (this: void, discriminator: string): Array<() => any> {
  // noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS
  const generators: Array<() => any> = [
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
      function () {
        return 'this simulates a ' + discriminator;
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
  ];
  const result: Array<() => any> = generators.slice();
  result.push(() => generators.map(g => g()));
  return result;
}

type ExtendedWindow = Window & {opr: any; opera: any, HTMLElement: any, safari: any, chrome: any};
type ExtendedDocument = Document & {documentMode: any};

export type Environment = 'node' | 'opera' | 'firefox' | 'safari' | 'ie' | 'edge' | 'chrome' | 'headless-chrome' | 'android' | 'safari <= 12' | 'blink' | 'browser';

// http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
// noinspection OverlyComplexFunctionJS,FunctionTooLongJS
function environment (this: void, ): Environment | undefined {
  // eslint-disable-next-line
  if (new Function('try {return this === global;}catch(e){return false;}')()) {
    console.log('Node (no User Agent)');
    return 'node';
  }
  // noinspection JSUnresolvedVariable
  const ua: string = navigator.userAgent;
  console.log(`User Agent: "${ua}"`);
  const extendedWindow: ExtendedWindow = (window as unknown) as ExtendedWindow;
  // noinspection JSUnresolvedVariable
  if (
    // eslint-disable-next-line
    // @ts-ignore
    (!!extendedWindow.opr && !!opr.addons) ||
    !!extendedWindow.opera ||
    navigator.userAgent.indexOf(' OPR/') >= 0
  ) {
    return 'opera';
  }
  // noinspection JSUnresolvedVariable
  // @ts-ignore
  if (typeof InstallTrigger !== 'undefined') {
    return 'firefox';
  }
  // this no longer detects safari in v11
  // noinspection JSUnresolvedVariable
  if (
    /constructor/i.test(extendedWindow.HTMLElement) ||
    (function (p) {
      return p.toString() === '[object SafariRemoteNotification]';
    })(
      // eslint-disable-next-line
      // @ts-ignore
      !extendedWindow['safari'] || safari.pushNotification
    )
  ) {
    return 'safari';
  }
  // noinspection PointlessBooleanExpressionJS,JSUnresolvedVariable
  if (/* @cc_on!@ */ false || !!(document as ExtendedDocument).documentMode) {
    return 'ie';
  }
  // noinspection JSUnresolvedVariable
  if (window.StyleMedia) {
    return 'edge';
  }
  // noinspection JSUnresolvedVariable
  if (extendedWindow.chrome) {
    return 'chrome';
  }
  // noinspection JSUnresolvedVariable
  if (window.CSS) {
    if (ua.indexOf('HeadlessChrome') >= 0) {
      return 'headless-chrome';
    }
    if (ua.indexOf('Linux; Android') >= 0) {
      return 'android';
    }
    if (ua.indexOf('Edge') >= 0) {
      return 'edge';
    }
    if (ua.indexOf('Safari/') >= 0 && (ua.indexOf('Version/11') >= 0 || ua.indexOf('Version/12') >= 0)) {
      return 'safari <= 12';
    }
    if (ua.indexOf('Safari/') >= 0 && ua.indexOf('Version/') >= 0) {
      return 'safari';
    }
    return 'blink';
  }
  // eslint-disable-next-line
  if (new Function('try {return this === window;}catch(e){ return false;}')()) {
    return 'browser';
  }
  return undefined;
}

export function trimLineAndColumnPattern (stackLine: StackLocation): StackLocation {
  return (
    stackLine
      // node, chrome
      .replace(/:\d*:\d*\)$/, ')')
      // other browsers
      .replace(/:\d*:\d*$/, '')
  );
}

export function mustBeCallerLocation (this: void, actual: StackLocation, expected: StackLocation): void {
  expected.should.be.a.String();
  trimLineAndColumnPattern(expected).should.equal(trimLineAndColumnPattern(actual));
}

// also deals with arrays that contain Symbol
export function safeToString (this: void, s: any): string {
  try {
    return String(s);
  } catch (ignore) {
    return Object.prototype.toString.call(s);
  }
}

export const env: Environment | undefined = environment();
console.log(`Detected environment "${env}"`);
