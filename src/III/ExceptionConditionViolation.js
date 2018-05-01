/*
 Copyright 2016 - 2017 by Jan Dockx

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

(function(factory) {
  "use strict";

  var dependencies = ["./../_private/util", "./ConditionViolation", "./AbstractContract"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(util, ConditionViolation, AbstractContract) {
  "use strict";

  /**
   * <p>An ExceptionConditionViolation is the means by which Toryt Contracts tells developers that it detected that an
   *   exception condition was violated when a contract function was called. The implementation of the contract function
   *   that was called, was executed and threw an exception, but the exception or the resulting state did not
   *   conform.</p>
   *
   * <p>If the exception condition itself is correct, this is a programming error on the part of the implementation.
   *   One should assume the system is now in an undefined state.</p>
   *
   * <p>The developer wants to know</p>
   * <ul>
   *   <li>where the contract function was called in source code,</li>
   *   <li>what the arguments were of the instance of the call, at the time of the call (old),</li>
   *   <li>what the result of the call is, and what the state is of all relevant objects is, after the call, and</li>
   *   <li>which exception condition was violated in source code (which implies knowing which contract it is a
   *     part of).</li>
   * </ul>
   *
   * <p>The state of the relevant objects after the call is a difficult subject, since we should assume the system
   *   is in an undefined state. Retrieving the state might not be possible, because invariants and preconditions
   *   will no longer be guaranteed.</p>
   *
   * @constructor
   * @param {Function} contractFunction - The contract function that reports this violation
   * @param {Function} condition        - The condition that was violated
   * @param {any}      self             - The <code>this</code> that <code>contractFunction</code> was called on
   * @param {Array} args
   *                The arguments with which the contract function that failed, was called, extended with the
   *                thrown exception, and the contract function, bound to the <code>this</code>
   *                it was called on. The bound contract function is always the last entry. The thrown exception
   *                is always the second-to-last entry.
   */
  function ExceptionConditionViolation(contractFunction, condition, self, args) {
    util.pre(this, function() {return AbstractContract.isAGeneralContractFunction(contractFunction);});
    util.pre(this, function() {return util.typeOf(condition) === "function";});
    util.pre(this, function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    var actualArgs = Array.prototype.slice.call(args);
    actualArgs.pop(); // the bound contract function
    var exception = actualArgs.pop();
    ConditionViolation.call(this, contractFunction, condition, self, actualArgs);
    util.setAndFreezeProperty(this, "exception", exception);
  }

  ExceptionConditionViolation.prototype = new ConditionViolation(
    AbstractContract.root.abstract,
    function() {return "This is a dummy condition in the ExceptionConditionViolation prototype.";},
    undefined,
    []
  );
  ExceptionConditionViolation.prototype.constructor = ExceptionConditionViolation;
  util.setAndFreezeProperty(ExceptionConditionViolation.prototype, "name", ExceptionConditionViolation.name);
  util.setAndFreezeProperty(ExceptionConditionViolation.prototype, "exception", undefined);
  util.setAndFreezeProperty(
    ExceptionConditionViolation.prototype,
    "getDetails",
    function() {
      return ConditionViolation.prototype.getDetails.call(this) + util.eol +
             "exception (" + util.typeOf(this.exception) + "):" + util.eol +
             util.extensiveThrownRepresentation(this.exception);
    }
  );

  return ExceptionConditionViolation;
}));