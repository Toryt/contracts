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

'use strict'

const should = require('should')
const os = require('os')

// noinspection FunctionNamingConventionJS
function x () {
  if (arguments.length <= 0) {
    return []
  }
  return Array.prototype.reduce.call(
    arguments,
    (acc, arrayI) => {
      const ret = []
      acc.forEach(elementSoFar => {
        arrayI.forEach(elementOfI => {
          ret.push(elementSoFar.concat([elementOfI]))
        })
      })
      return ret
    },
    [[]]
  )
}

function expectOwnFrozenProperty (subject, propertyName) {
  const propertyDescriptor = Object.getOwnPropertyDescriptor(subject, propertyName)
  propertyDescriptor.should.be.ok()
  propertyDescriptor.enumerable.should.be.true()
  propertyDescriptor.configurable.should.be.false()
  propertyDescriptor.writable.should.be.false()
  const failFunction = function () {
    // noinspection MagicNumberJS
    subject[propertyName] = 42 + ' some outlandish other value'
  }
  failFunction.should.throw(TypeError)
}

// noinspection FunctionNamingConventionJS
function prototypeThatHasOwnPropertyDescriptor (subject, propertyName) {
  if (!subject) {
    return subject
  }
  if (Object.getOwnPropertyDescriptor(subject, propertyName)) {
    return subject
  }
  return prototypeThatHasOwnPropertyDescriptor(Object.getPrototypeOf(subject), propertyName)
}

// noinspection FunctionNamingConventionJS
function expectDerivedPropertyOnAPrototype (subject, propertyName, configurable) {
  const prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName)
  const propertyDescriptor = Object.getOwnPropertyDescriptor(prototype, propertyName)
  propertyDescriptor.should.be.ok()
  propertyDescriptor.enumerable.should.be.true()
  propertyDescriptor.configurable.should.equal(configurable)
  propertyDescriptor.should.not.have.property('writable')
  propertyDescriptor.get.should.be.a.Function()
  should(propertyDescriptor.set).not.be.ok()
}

// noinspection FunctionNamingConventionJS
function expectConfigurableDerivedPropertyOnAPrototype (subject, propertyName) {
  expectDerivedPropertyOnAPrototype(subject, propertyName, true)
}

// noinspection FunctionNamingConventionJS
function expectFrozenDerivedPropertyOnAPrototype (subject, propertyName) {
  expectDerivedPropertyOnAPrototype(subject, propertyName, false)
}

function expectFrozenPropertyOnAPrototype (subject, propertyName) {
  const prototype = prototypeThatHasOwnPropertyDescriptor(subject, propertyName)
  expectOwnFrozenProperty(prototype, propertyName)
}

// noinspection FunctionNamingConventionJS
function expectFrozenReadOnlyArrayPropertyWithPrivateBackingField (subject, propName, privatePropName) {
  subject.should.have.ownProperty(privatePropName) // array not shared
  subject[privatePropName].should.be.an.Array()
  this.expectOwnFrozenProperty(subject, privatePropName)
  subject[propName].should.be.an.Array()
  this.expectFrozenDerivedPropertyOnAPrototype(subject, propName)
  const failFunction = function () {
    // noinspection MagicNumberJS
    subject[propName] = 42 + ' some outlandish other value'
  }
  failFunction.should.throw(TypeError)
}

function expectToBeArrayOfFunctions (a) {
  a.should.be.an.Array()
  a.forEach(element => {
    element.should.be.a.Function()
  })
}

const doLog = false

// noinspection FunctionNamingConventionJS
function log () {
  if (doLog) {
    console.log.apply(undefined, arguments)
    console.log()
  }
}

function showStack (exc) {
  log('Exception stack%s---------------%s%s', os.EOL, os.EOL, exc.stack)
}

function regExpEscape (s) {
  // http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function propertyIsWritable (object, propertyName) {
  const prototype = prototypeThatHasOwnPropertyDescriptor(object, propertyName)
  const pd = prototype && Object.getOwnPropertyDescriptor(prototype, propertyName)
  return !pd || pd.writable
}

function anyCasesGenerators (discriminator) {
  // noinspection JSPrimitiveTypeWrapperUsage,MagicNumberJS
  const generators = [
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
  const result = generators.slice()
  result.push(() => generators.map(g => g()))
  return result
}

// http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
// noinspection OverlyComplexFunctionJS
function environment () {
  // eslint-disable-next-line
  if (new Function('try {return this === global;}catch(e){return false;}')()) {
    console.log('Node (no User Agent)')
    return 'node'
  }
  // noinspection JSUnresolvedVariable
  const ua = navigator.userAgent
  console.log(`User Agent: "${ua}"`)
  // noinspection JSUnresolvedVariable
  if (
    // eslint-disable-next-line
    (!!window.opr && !!opr.addons) ||
    !!window.opera ||
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
    /constructor/i.test(window.HTMLElement) ||
    (function (p) {
      return p.toString() === '[object SafariRemoteNotification]'
    })(
      // eslint-disable-next-line
      !window['safari'] || safari.pushNotification
    )
  ) {
    return 'safari'
  }
  // noinspection PointlessBooleanExpressionJS,JSUnresolvedVariable
  if (/* @cc_on!@ */ false || !!document.documentMode) {
    return 'ie'
  }
  // noinspection JSUnresolvedVariable
  if (window.StyleMedia) {
    return 'edge'
  }
  // noinspection JSUnresolvedVariable
  if (window.chrome) {
    return 'chrome'
  }
  // noinspection JSUnresolvedVariable
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
  // eslint-disable-next-line
  if (new Function('try {return this === window;}catch(e){ return false;}')()) {
    return 'browser'
  }
  return undefined
}

function trimLineAndColumnPattern (stackLine) {
  return (
    stackLine
      // node, chrome
      .replace(/:\d*:\d*\)$/, ')')
      // other browsers
      .replace(/:\d*:\d*$/, '')
  )
}

function mustBeCallerLocation (actual, expected) {
  expected.should.be.a.String()
  trimLineAndColumnPattern(expected).should.equal(trimLineAndColumnPattern(actual))
}

// also deals with arrays that contain Symbol
function safeToString (s) {
  try {
    return String(s)
  } catch (ignore) {
    return Object.prototype.toString.call(s)
  }
}

const env = environment()
console.log(`Detected environment "${env}"`)

module.exports = {
  x,
  expectOwnFrozenProperty,
  expectConfigurableDerivedPropertyOnAPrototype,
  expectFrozenDerivedPropertyOnAPrototype,
  expectFrozenReadOnlyArrayPropertyWithPrivateBackingField,
  expectFrozenPropertyOnAPrototype,
  expectToBeArrayOfFunctions,
  log,
  showStack,
  regExpEscape,
  propertyIsWritable,
  anyCasesGenerators,
  environment: env,
  mustBeCallerLocation,
  safeToString
}
