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

  var util = require("./../_private/util");
  var Contract = require("./Contract");
  var ConditionError = require("./ConditionError");
  var ConditionMetaError = require("./ConditionMetaError");
  var ConditionViolation = require("./ConditionViolation");
  var PreconditionViolation = require("./PreconditionViolation");

  /**
   * The separation between Contract and ImplementableContract is necessary to break a dependency
   * cycle with ConditionError.
   */
  function ImplementableContract(pre, post, exception) {
    Contract.apply(this, arguments);
  }

  ImplementableContract.prototype = new Contract();
  ImplementableContract.prototype.constructor = ImplementableContract;
  /**
   * Verify one condition.
   * This is a static function. It doesn't use this.
   *
   * MUDO MOVE to ConditionViolation
   */
  ImplementableContract.prototype.verifyOne = function(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(this, function() {return condition && util.typeOf(condition) === "function";});
    util.pre(this, function() {return args && (util.typeOf(args) === "arguments" || util.typeOf(args) === "array");});

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
      var cv = new ConditionViolation(contractFunction, condition, self, args);
      Object.freeze(cv);
      throw cv;
    }
  };
  /**
   * Verify conditions, until one fails.
   * This is a static function. It doesn't use this.
   *
   * MUDO MOVE to ConditionViolation
   */
  ImplementableContract.prototype.verifyAll = function(contractFunction, conditions, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(this, function() {
      return conditions
             && util.typeOf(conditions) === "array"
             && conditions.every(function(c) {return c && util.typeOf(c) === "function";});});
    util.pre(this, function() {return args && (util.typeOf(args) === "arguments" || util.typeOf(args) === "array");});

    if (conditions) {
      conditions.forEach(function(condition) {this.verifyOne(contractFunction, condition, self, args);}, this);
    }
  };
  ImplementableContract.prototype.implementation = function(implFunction) {
    util.pre(this, function() {return implFunction && util.typeOf(implFunction) === "function";});

    var contract = this;
    Object.freeze(contract);

    function contractFunction() {
      var extendedArgs = Array.prototype.slice.call(arguments);
      contract.verifyAll(contractFunction, contract.pre, this, arguments);
      var result;
      var exception;
      try {
        result = implFunction.apply(this, arguments);
      }
      catch (exc) {
        if (exc instanceof ConditionError) { // necessary to report only the deepest failure clearly
          throw exc;
        }
        exception = exc;
      }
      extendedArgs.push(exception || result);
      extendedArgs.push(contractFunction.bind(this));
      if (exception) {
        contract.verifyAll(contractFunction, contract.exception, this, extendedArgs);
        throw exception;
      }
      contract.verifyAll(contractFunction, contract.post, this, extendedArgs);
      return result;
    }

    function bind() {
      var bound = Function.prototype.bind.apply(this, arguments);
      var boundImplementation = Function.prototype.bind.apply(this.implementation, arguments);
      util.setAndFreezeProperty(bound, "contract", this.contract);
      util.setAndFreezeProperty(bound, "implementation", boundImplementation);
      util.setAndFreezeProperty(bound, "name", boundImplementation.name);
      util.setAndFreezeProperty(bound, "displayName", Contract.contractFunctionDisplayName(boundImplementation));
      bound.bind = this.bind;
      return bound;
    }

    util.setAndFreezeProperty(contractFunction, "contract", contract);
    util.setAndFreezeProperty(contractFunction, "implementation", implFunction);
    util.setAndFreezeProperty(contractFunction, "name", implFunction.name);
    util.setAndFreezeProperty(contractFunction, "displayName", Contract.contractFunctionDisplayName(implFunction));
    contractFunction.bind = bind;

    return contractFunction;
  };

  return ImplementableContract;
})();
