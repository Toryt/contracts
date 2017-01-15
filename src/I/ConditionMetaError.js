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

  var ConditionError = require("./ConditionError");
  var Contract = require("./Contract");
  var util = require("./../_private/util");

  /**
   * The condition could not be evaluated. There is probably a programming error in the condition itself.
   *
   * error must be optional
   * - to make it possible to use this as the prototype for more special types
   * - because in JavaScript, also undefined and null can be thrown
   * Therefor, a ConditionMetaError is also civilized if the error is falsy.
   */
  function ConditionMetaError(contractFunction, condition, self, args, error) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(this, function() {return util.typeOf(condition) === "function";});
    util.pre(this, function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    ConditionError.apply(this, arguments);
    if (error) {
      Object.freeze(error);
    }
    util.setAndFreezeProperty(this, "error", error);
  }

  ConditionMetaError.prototype = new ConditionError(
    Contract.dummyImplementation(),
    function() {return "This is a dummy condition in the ConditionMetaError prototype."},
    undefined,
    []
  );
  ConditionMetaError.prototype.constructor = ConditionMetaError;
  ConditionMetaError.prototype.name = "Contract Condition Meta-Error";
  ConditionMetaError.prototype.error = null;
  ConditionMetaError.prototype.stackAddition = function() {
    return util.eol +
           "Caused by:" +
           util.eol +
           (this.error && this.error.stack ? this.error.stack : ("" + this.error));
  };

  ConditionMetaError.createMessage = function(contractFunction, condition, self, args, error) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(function() {return util.typeOf(condition) === "function";});
    util.pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    var contractFunctionName = contractFunction.displayName || contractFunction.name || "<<unnnamed>>";
    return "An error occurred while evaluating " + condition +
           " when contract function " + contractFunctionName +
           " was called on " + self +
           " with arguments (" + Array.prototype.map.call(args, function(arg) {return "" + arg;}).join(", ") + "): " +
           error +
           util.eol + "contract:" + contractFunction.contract.location +
           util.eol + "condition: " + condition +
           util.eol + "implementation:" + contractFunction.location +
           util.eol + "call stack:" ;
  };

  return ConditionMetaError;
})();
