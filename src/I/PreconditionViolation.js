/*
 Copyright 2016 - 2016 by Jan Dockx

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

  function PreconditionViolation(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(this, function() {return util.typeOf(condition) === "function";});
    util.pre(this, function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    ConditionViolation.apply(this, arguments);
  }

  PreconditionViolation.prototype = new ConditionViolation(
    Contract.dummyImplementation(),
    function() {return "This is a dummy condition in the PreconditionViolation prototype."},
    undefined,
    []
  );
  PreconditionViolation.prototype.constructor = PreconditionViolation;
  PreconditionViolation.prototype.name = "Contract Precondition Violation";

  PreconditionViolation.createMessage = function(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(function() {return util.typeOf(condition) === "function";});
    util.pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    var contractFunctionName = contractFunction.displayName || contractFunction.name || "<<unnnamed>>";
    return "Precondition " + condition +
           " of " + contractFunctionName +
           " was violated by " + "THE CULPRIT - CALLING FUNCTION" + // MUDO
           " by calling it on " + self +
           " with arguments (" + Array.prototype.map.call(args, function(arg) {return "" + arg;}).join(", ") + ")" +
           util.eol + "contract:" + contractFunction.contract.location +
           util.eol + "condition: " + condition +
           util.eol + "implementation:" + contractFunction.location +
           util.eol + "call stack:";
  };

  return PreconditionViolation;
})();
