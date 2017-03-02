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

module.exports = (function() {
  "use strict";

  var ConditionViolation = require("./ConditionViolation");
  var Contract = require("./Contract");
  var util = require("./../_private/util");

/**
 * A PreconditionViolation is the means by which Toryt Contracts tells developers that it detected that a
 * precondition was violated when a contract function was called. The implementation of the contract function
 * that was called, was not executed.
 *
 * If the precondition itself is correct, this is a programming error on the part of the calling function.
 * One should assume the system is now in an undefined state.
 *
 * The developer wants to know
 * <ul>
 *   <li>where the contract function was called in source code,</li>
 *   <li>what the arguments were of the instance of the call, and</li>
 *   <li>which precondition was violated in source code (which implies knowing which contract it is a part of).</li>
 * </ul>
 *
 * @param {Function} contractFunction - The contract function that reports this violation
 * @param {Function} condition        - The condition that was violated
 * @param {any}      self             - The <code>this</code> that <code>contractFunction</code> was called on
 * @param {Array} args
 *                The arguments with which the contract function that failed, was called
 */
 function PreconditionViolation(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(this, function() {return util.typeOf(condition) === "function";});
    util.pre(this, function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    ConditionViolation.apply(this, arguments);
  }

  PreconditionViolation.prototype = new ConditionViolation(
    Contract.root.abstract,
    function() {return "This is a dummy condition in the PreconditionViolation prototype."},
    undefined,
    []
  );
  PreconditionViolation.prototype.constructor = PreconditionViolation;
  util.setAndFreezeProperty(PreconditionViolation.prototype, "name", PreconditionViolation.name);

  return PreconditionViolation;
})();
