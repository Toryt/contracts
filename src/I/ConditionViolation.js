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
  var ConditionMetaError = require("./ConditionMetaError");
  var util = require("./../_private/util");

  /**
   * Super type for objects that are thrown to signal a condition violation.
   * This is intented to be abstract.
   */
  function ConditionViolation(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(this, function() {return util.typeOf(condition) === "function";});
    util.pre(this, function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    ConditionError.apply(this, arguments);
  }

  ConditionViolation.prototype = new ConditionError(
    Contract.dummyImplementation(),
    function() {return "This is a dummy condition in the ConditionViolation prototype."},
    undefined,
    []
  );
  ConditionViolation.prototype.constructor = ConditionViolation;
  ConditionViolation.prototype.name = "Contract Condition Violation";
  /**
   * Dynamic conditional constructor and thrower of instances of this type. The intended usage is:
   *
   * <pre>
   *   <var>SpecificConditionViolationConstructor</var>.prototype.verify(<var>...</var>, <var>condition</var>, <var>self</var>, <var>args</var>)
   * </pre>
   *
   * Such a call will throw a ConditionViolation of type <var>SpecificConditionViolationConstructor</var>, with its
   * properties filled out appropriately, if the supplied <var>condition</var> returns <code>false</code> when applied
   * to <var>self</var> and <var>args</var>.
   *
   * When the supplied <var>condition</var> fails to execute, a ConditionMetaError is thrown, with its
   * properties filled out appropriately.
   *
   * Mostly, this method is not used directly, but called via <code>verifyAll</code>.
   */
  ConditionViolation.prototype.verify = function(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(this, function() {return util.typeOf(condition) === "function";});
    util.pre(this, function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    var conditionResult;
    try {
      conditionResult = condition.apply(self, args);
    }
    catch (err) {
      var cme = new ConditionMetaError(contractFunction, condition, self, args, err);
      Object.freeze(cme);
      throw cme;
    }
    if (!conditionResult) {
      var cv = new this.constructor(contractFunction, condition, self, args);
      Object.freeze(cv);
      throw cv;
    }
  };

  ConditionViolation.createMessage = function(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(function() {return util.typeOf(condition) === "function";});
    util.pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    return "Condition " + condition +
           " was violated while " + contractFunction.displayName +
           " was called on " + self +
           " with arguments (" + Array.prototype.map.call(args, function(arg) {return "" + arg;}).join(", ") + ")";
  };

  return ConditionViolation;
})();
