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

'use strict'

const util = require('../../src/_private/util')
const expect = require('chai').expect

// noinspection FunctionNamingConventionJS
function x () {
  if (arguments.length <= 0) {
    return []
  }
  return Array.prototype.reduce.call(
    arguments,
    (acc, arrayI) => {
      const ret = []
      acc.forEach(elementSoFar => { arrayI.forEach(elementOfI => { ret.push(elementSoFar.concat([elementOfI])) }) })
      return ret
    },
    [[]]
  )
}

function expectOwnFrozenProperty (subject, propertyName) {
  expect(subject).to.have.ownPropertyDescriptor(propertyName)
  expect(subject).ownPropertyDescriptor(propertyName).to.have.property('enumerable', true)
  expect(subject).ownPropertyDescriptor(propertyName).to.have.property('configurable', false)
  expect(subject).ownPropertyDescriptor(propertyName).to.have.property('writable', false)
  expect(function () {
    // noinspection MagicNumberJS
    subject[propertyName] = 42 + ' some outlandish other value'
  }).to.throw(TypeError)
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
  expect(prototype).to.have.ownPropertyDescriptor(propertyName)
  expect(prototype).ownPropertyDescriptor(propertyName).to.have.property('enumerable', true)
  expect(prototype).ownPropertyDescriptor(propertyName).to.have.property('configurable', configurable)
  expect(prototype).ownPropertyDescriptor(propertyName).not.to.have.property('writable')
  expect(prototype).ownPropertyDescriptor(propertyName).to.have.property('get').that.is.a('function')
  // eslint-disable-next-line
  expect(prototype).ownPropertyDescriptor(propertyName).to.have.property('set').that.is.not.ok
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
  expect(subject).to.have.ownProperty(privatePropName) // array not shared
  expect(subject).to.have.property(privatePropName).that.is.an('array')
  this.expectOwnFrozenProperty(subject, privatePropName)
  expect(subject).to.have.property(propName).that.is.an('array')
  this.expectFrozenDerivedPropertyOnAPrototype(subject, propName)
  expect(function () {
    // noinspection MagicNumberJS
    subject[propName] = 42 + ' some outlandish other value'
  }).to.throw(TypeError)
}

function expectToBeArrayOfFunctions (a) {
  expect(a).to.be.an('array')
  a.forEach(element => { expect(element).to.be.a('function') })
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
  log('Exception stack%s---------------%s%s', util.eol, util.eol, exc.stack)
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
  return [
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
    () => function () { return 'this simulates a ' + discriminator },
    // eslint-disable-next-line
    () => new Number(42),
    // eslint-disable-next-line
    () => new Boolean(false),
    // eslint-disable-next-line
    () => new String(discriminator + ' string'),
    () => arguments,
    () => ({}),
    () => ({a: 1, b: 'b', c: {}, d: {d1: undefined, d2: 'd2', d3: {d31: 31}}})
  ]
}

// http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
function environment () {
  // eslint-disable-next-line
  if ((new Function('try {return this === global;}catch(e){return false;}'))()) {
    return 'node'
  }
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
  // noinspection JSUnresolvedVariable
  if (/constructor/i.test(window.HTMLElement) ||
      (function (p) {
        return p.toString() === '[object SafariRemoteNotification]'
      })(
        // eslint-disable-next-line
        !window['safari'] || safari.pushNotification
      )) {
    return 'safari'
  }
  // noinspection PointlessBooleanExpressionJS,JSUnresolvedVariable
  if (/* @cc_on!@ */false || !!document.documentMode) {
    return 'ie'
  }
  // noinspection JSUnresolvedVariable
  if (window.StyleMedia) {
    return 'edge'
  }
  // noinspection JSUnresolvedVariable
  if (!!window.chrome && !!window.chrome.webstore) {
    return 'chrome'
  }
  // noinspection JSUnresolvedVariable
  if (window.CSS) {
    return 'blink'
  }
  // eslint-disable-next-line
  if ((new Function('try {return this === window;}catch(e){ return false;}'))()) {
    return 'browser'
  }
  return undefined
}

module.exports = {
  x: x,
  expectOwnFrozenProperty: expectOwnFrozenProperty,
  expectConfigurableDerivedPropertyOnAPrototype: expectConfigurableDerivedPropertyOnAPrototype,
  expectFrozenDerivedPropertyOnAPrototype: expectFrozenDerivedPropertyOnAPrototype,
  expectFrozenReadOnlyArrayPropertyWithPrivateBackingField: expectFrozenReadOnlyArrayPropertyWithPrivateBackingField,
  expectFrozenPropertyOnAPrototype: expectFrozenPropertyOnAPrototype,
  expectToBeArrayOfFunctions: expectToBeArrayOfFunctions,
  log: log,
  showStack: showStack,
  regExpEscape: regExpEscape,
  propertyIsWritable: propertyIsWritable,
  anyCasesGenerators: anyCasesGenerators,
  environment: environment()
}
