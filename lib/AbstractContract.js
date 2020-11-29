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

const ContractError = require('./ContractError')
const is = require('./_private/is')
const property = require('./_private/property')
const stack = require('./_private/stack')
const report = require('./_private/report')
const assert = require('assert')

/**
 * Function that always returns <code>false</code>.
 */
const falseCondition = function () {
  return false
}

/**
 * Singleton array of {@linkplain AbstractContract#falseCondition}. Can be used the clearly signal
 * that a function should never throw exceptions, or never end nominally, or should never be called,
 * because the conditions will always fail.
 */
const mustNotHappen = Object.freeze([falseCondition])

// noinspection ParameterNamingConventionJS
/**
 * @constructor
 */
function AbstractContract (kwargs, /* Object? */ _location) {
  assert.ok(kwargs)
  assert(!kwargs.pre || Array.isArray(kwargs.pre), 'optional kwargs.pre is an array')
  assert(!kwargs.post || Array.isArray(kwargs.post), 'optional kwargs.post is an array')
  assert(!kwargs.exception || Array.isArray(kwargs.exception), 'optional kwargs.exception is an array')
  assert(
    !_location || _location === AbstractContract.internalLocation || typeof _location === 'string',
    'optional private _location is internal or a string'
  )

  const self = this

  /* This cannot be defined in the prototype. The `self` is the contract, not the `this`. When this function is called
     as a method of a random object, that random object is the `this`, not this contract. */
  function abstract () {
    throw new AbstractContract.AbstractError(self, stack.raw())
  }

  const location = _location || stack.location(1)
  AbstractContract.bless(abstract, self, abstract, location)
  property.setAndFreeze(self, '_pre', Object.freeze(kwargs.pre ? kwargs.pre.slice() : []))
  property.setAndFreeze(self, '_post', Object.freeze(kwargs.post ? kwargs.post.slice() : []))
  property.setAndFreeze(self, '_exception', Object.freeze(kwargs.exception ? kwargs.exception.slice() : mustNotHappen))
  property.setAndFreeze(self, 'location', Object.freeze(location))
  property.setAndFreeze(self, 'abstract', abstract)
}

AbstractContract.internalLocation = Object.freeze({
  toString: function () {
    return 'INTERNAL'
  }
})

function isOrHasAsPrototype (obj, proto) {
  return obj === proto || (obj !== Object.prototype && isOrHasAsPrototype(Object.getPrototypeOf(obj), proto))
}

AbstractContract.prototype = {
  constructor: AbstractContract,
  _pre: null,
  _post: null,
  _exception: null,
  isImplementedBy: function (f) {
    return AbstractContract.isAGeneralContractFunction(f) && isOrHasAsPrototype(f.contract, this)
  }
}
property.frozenReadOnlyArray(AbstractContract.prototype, 'pre', '_pre')
property.frozenReadOnlyArray(AbstractContract.prototype, 'post', '_post')
property.frozenReadOnlyArray(AbstractContract.prototype, 'exception', '_exception')
property.setAndFreeze(AbstractContract.prototype, 'location', AbstractContract.internalLocation)
property.setAndFreeze(AbstractContract.prototype, 'abstract', null)
AbstractContract.prototype.verify = true
AbstractContract.prototype.verifyPostconditions = false

AbstractContract.namePrefix = report.namePrefix

AbstractContract.bindContractFunction = function bind () {
  assert(AbstractContract.isAGeneralContractFunction(this), 'this is a general contract function')

  const bound = Function.prototype.bind.apply(this, arguments)
  const boundImplementation = Function.prototype.bind.apply(this.implementation, arguments)
  property.frozenDerived(boundImplementation, 'name', () => report.conciseCondition('bound', this.implementation))
  AbstractContract.bless(bound, this.contract, boundImplementation, this.location)
  return bound
}

AbstractContract.isAGeneralContractFunction = function (f) {
  // Apart from this, we expect f to have a name. But it is controlled by the JavaScript engine, and we cannot
  // freeze it, and not guaranteed in all engines.
  return (
    typeof f === 'function' &&
    is.frozenOwnProperty(f, 'contract') &&
    f.contract instanceof AbstractContract &&
    is.frozenOwnProperty(f, 'implementation') &&
    typeof f.implementation === 'function' &&
    is.frozenOwnProperty(f, 'location') &&
    f.location &&
    (f === f.implementation || f.name === report.conciseCondition(AbstractContract.namePrefix, f.implementation)) &&
    is.frozenOwnProperty(f, 'bind') &&
    f.bind === AbstractContract.bindContractFunction &&
    (!Object.prototype.hasOwnProperty.call(f.implementation, 'prototype') ||
      (typeof f.prototype === 'object' &&
        f.prototype.constructor === f &&
        (f.prototype === f.implementation.prototype || f.prototype instanceof f.implementation)))
  )
}

AbstractContract.isAContractFunction = function (f) {
  return AbstractContract.isAGeneralContractFunction(f) && f.contract instanceof this && is.stackLocation(f.location)
}

AbstractContract.bless = function bless (contractFunction, contract, implFunction, location) {
  assert.strictEqual(typeof contractFunction, 'function')
  // noinspection JSUnresolvedVariable
  assert.ok(!contractFunction.contract)
  // noinspection JSUnresolvedVariable
  assert.ok(!contractFunction.implementation)
  // noinspection JSUnresolvedVariable
  assert.ok(!contractFunction.location)
  assert.strictEqual(contractFunction.bind, Function.prototype.bind)
  assert(contract instanceof AbstractContract, 'contract is an AbstractContract')
  assert.strictEqual(typeof implFunction, 'function')
  assert(
    location === AbstractContract.internalLocation || is.stackLocation(location),
    'location is internal, or a stack location'
  )

  property.setAndFreeze(contractFunction, 'contract', Object.create(contract))
  property.setAndFreeze(contractFunction, 'implementation', implFunction)
  property.setAndFreeze(contractFunction, 'location', location)
  property.setAndFreeze(contractFunction, 'bind', AbstractContract.bindContractFunction)
  if (contractFunction !== implFunction) {
    /* `abstract` refers to itself as implementation; we do not change its name (it would create a circular name
       definition) */
    // IDEA defend code against more complex circular structure
    /* NOTE: This test should be implFunction.hasOwnProperty('prototype'). However, in Safari on iOS, tests show that
             'most of the time' this prototype is not set in our tests, as it should be. It seems to depend on the
             complexity of the function, and to be set 'late' (because it is there in isAGeneralContractFunction). If a
             log command is added, the prototype is set early enough. To work around this, this test is replaced with
             !!implFunction.prototype. This defaults to the prototype set in Function.prototype, which is an Object.
             This means we now replace the contractFunction prototype more often than needed, but that is not a
             functional problem. */
    if (implFunction.prototype && typeof implFunction.prototype === 'object') {
      contractFunction.prototype = Object.create(implFunction.prototype)
      property.setAndFreeze(contractFunction.prototype, 'constructor', contractFunction)
      // the following line is added to work around an issue in Safari on iOS. See 4ed9879c6b5544b174ae0825d7f7055fd5e147d8
      assert(
        Object.getPrototypeOf(contractFunction.prototype) === implFunction.prototype,
        'contractFunction prototype is set to extend implFunction.prototype'
      )
    }
    /* The name of the contract function will always be 'contractFunction', because we need to define it in
      `Contract.implementation`, because we need to refer to the contract function internally. We would like the result
      of `Contract.implementation` to get a name inferred from its syntactic position, but cannot happen: before
      we reach the 'syntactic position' (a.k.a, we assign the contract function to a variable or property with
      a name), it will already have the name `contractFunction` we need internally. Therefore, we will explicitly set
      the name, based on the name of implementation function.
      The Firefox feature `displayName` will not be used.
      This is a real property, and not a derived property. Earlier, it was, but this was changed in response to
      https://github.com/sinonjs/sinon/issues/2203 */
    // IDEA we might also add a name property to a Contract, and combine it with that
    const implNamePropertyDescriptor = Object.getOwnPropertyDescriptor(implFunction, 'name')
    Object.defineProperty(contractFunction, 'name', {
      configurable: implNamePropertyDescriptor.configurable,
      enumerable: implNamePropertyDescriptor.enumerable,
      writable: implNamePropertyDescriptor.writable,
      value: report.conciseCondition(report.namePrefix, implFunction)
    })
  }
  return contractFunction
}

/**
 * Returns the second-to-last element of an Array-like argument. In post- and exception conditions,
 * this is the function call result, respectively, the thrown exception.
 */
function outcome (args) {
  assert.ok(args)
  assert(Array.isArray(args) || typeof args.length === 'number', 'args is Array or arguments')
  // NOTE: it is not possible to fully test for an arguments object in strict mode
  assert(args.length >= 2, 'args has at least 2 elements')

  return args[args.length - 2]
}

/**
 * Returns the last element of an Array-like argument. In post- and exception conditions,
 * this is the called contract function, bound to this. This can be used in recursive definitions.
 */
function callee (args) {
  assert.ok(args)
  assert(Array.isArray(args) || typeof args.length === 'number', 'args is Array or arguments')
  // NOTE: it is not possible to fully test for an arguments object in strict mode
  assert(args.length >= 2, 'args has at least 2 elements') // stronger than absolutely necessary

  return args[args.length - 1]
}

AbstractContract.falseCondition = falseCondition
AbstractContract.mustNotHappen = mustNotHappen
AbstractContract.outcome = outcome
// noinspection JSAnnotator
AbstractContract.callee = callee

/**
 * The most general function AbstractContract. This has the most strict preconditions (nothing is allowed), which can
 * be weakened by specializations, and the most general nominal and exceptional postconditions (anything goes),
 * which can be strengthened by specializations.
 */
AbstractContract.root = new AbstractContract(
  {
    pre: AbstractContract.mustNotHappen,
    post: [],
    exception: []
  },
  AbstractContract.internalLocation
)

const message = 'an abstract function cannot be executed'

/**
 * Thrown when an abstract method is called. You shouldn't.
 *
 * @constructor
 */
function AbstractError (contract, rawStack) {
  assert(contract instanceof AbstractContract, 'contract is an AbstractContract')
  assert(is.stack(rawStack), 'rawStack is a stack')

  ContractError.call(this, rawStack)
  property.setAndFreeze(this, 'name', AbstractError.name)
  property.setAndFreeze(this, 'message', message)
  property.setAndFreeze(this, 'contract', contract)
}

AbstractError.prototype = new ContractError(stack.raw())
AbstractError.prototype.constructor = AbstractError
property.setAndFreeze(AbstractError.prototype, 'name', AbstractError.name)
property.setAndFreeze(AbstractError.prototype, 'message', message)
property.setAndFreeze(AbstractError.prototype, 'contract', null)

AbstractError.message = message

AbstractContract.AbstractError = AbstractError

module.exports = AbstractContract
