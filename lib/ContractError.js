/*
  Copyright 2016–2024 Jan Dockx

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

const is = require('./_private/is')
const stack = require('./_private/stack')
const property = require('./_private/property')
const assert = require('assert')
const stackEOL = require('./_private/eol').stack

// eslint-disable-next-line no-secrets/no-secrets
/* Custom Error types are notoriously difficult in JavaScript.
   See, e.g.,

   * http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
   * http://pastebin.com/aRpPr5Sd
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/toString
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack
   * https://nodejs.org/api/errors.html
   * https://msdn.microsoft.com/en-us/library/hh699850%28v=vs.94%29.aspx?f=255&MSPPError=-2147217396

   The main problems are:

   * Calling Error() without new doesn't initialize this. It creates a new object, and does nothing with this.
     Error.call(this) does nothing with this.
   * The stack trace is filled out differently per platform, or not at all (older Internet Explorer). Safari produces a
     stack that skips (optimize?) stack frames.
     Some platforms fill out the stack trace on throw (which seems to be correct). Other on creation of an
     Error. But, when following the regular inheritance pattern, this is at type definition time, where
     we want to create an Error-instance as prototype for a custom error type. That is obviously never
     the stack trace we want.
     Some platforms offer a method to fill out the stack trace.
     this.stack = "A String" does nothing on node.

   Errors support the following properties common over all platforms:

   * message
   * name
   * toString === name + ": " + message

   A file name, lineNumber and columnNumber is standard and supported on most platforms, and evolving.
   There is little or no documentation about how they are filled out.

   Most platforms do support a stack property, which is a multi-line string. The first line is the message.

   There are libraries to deal with these complexities, but different for node and browsers.
   Furthermore, the landscape is evolving.

   That we cannot call Error() to initialise a new custom error, is not a big problem. The standard syntax is
   new Error([message[, fileName[, lineNumber]]]). We can set these properties directly in our constructor.
   For fileName and lineNumber, we have the same problem as with the stack: we need a reference to somewhere else
   than where we create the custom error.
 */

const message = 'abstract type'

/**
 * ContractError is the general supertype of all errors thrown by Toryt Contracts.
 * ContractError itself is to be considered abstract.
 *
 * The main feature of a ContractError is that it provides a safe, cross-platform stack trace.
 * Instances should be frozen before they are thrown.
 *
 * <h3>Invariants</h3>
 * <ul>
 *   <li>`name` is a mandatory property, and refers to a string</li>
 *   <li>`message` refers to a string</li>
 *   <li>`stack` is a read-only property, that returns a string, that starts with the instances `name`, the
 *     string ": ", and `message`, and is followed by stack code references, that do no contain references
 *     to the inner workings of the Toryt Contracts library.</li>
 * </ul>
 *
 * @constructor
 */
function ContractError(rawStack) {
  assert(is.stack(rawStack), 'rawStack is a stack')

  property.setAndFreeze(this, '_rawStack', rawStack)
}

ContractError.prototype = new Error()
ContractError.prototype.constructor = ContractError
property.setAndFreeze(ContractError.prototype, 'name', ContractError.name)
property.setAndFreeze(ContractError.prototype, 'message', message)
property.setAndFreeze(ContractError.prototype, '_rawStack', stack.raw())
property.configurableDerived(ContractError.prototype, 'stack', function () {
  // noinspection JSUnresolvedReference
  return `${this.name}: ${this.message}` + stackEOL + this._rawStack
})

ContractError.message = message

module.exports = ContractError
