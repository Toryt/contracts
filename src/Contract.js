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

  var ContractConditionMetaError = require("./ContractConditionMetaError");
  var ContractConditionViolation = require("./ContractConditionViolation");

  var tc = {
    /**
     * A better type then Object.toString() or typeof.
     * - toType(undefined); //"undefined"
     * - toType(new); //"null"
     * - toType({a: 4}); //"object"
     * - toType([1, 2, 3]); //"array"
     * - (function() {console.log(toType(arguments))})(); //arguments
     * - toType(new ReferenceError); //"error"
     * - toType(new Date); //"date"
     * - toType(/a-z/); //"regexp"
     * - toType(Math); //"math"
     * - toType(JSON); //"json"
     * - toType(new Number(4)); //"number"
     * - toType(new String("abc")); //"string"
     * - toType(new Boolean(true)); //"boolean"
     *
     * Based on
     * http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
     */
    typeOf: function(obj) {
      if (obj === null) { // workaround for some weird implementations
        return "null";
      }
      var result = Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
      // on some browsers, the main window returns as "global" (WebKit) or "window" (FF), but this is an object too
      if (result === "global" || result === "window") {
        result = "object";
      }
      return result; // return String
    },

    isInteger: function(value) {
      return Number.isInteger
        ? Number.isInteger(value)
        : typeof value === "number"
          && isFinite(value)
          && Math.floor(value) === value;
    }
  };


  function Contract(pre, post, exception) {
    this.pre = pre ? pre.slice() : [];
    this.post = post ? post.slice() : [];
    this.exception = exception ? exception.slice() : [];
    // MUDO seal freeze
  }

  Contract.prototype = {
    constructor: Contract,
    pre: [],
    post: [],
    isImplementedBy: function(f) {
      return Contract.isAContractFunction(f) && f.contract === this;
    },
    verifyOne: function(condition, self, args) {
      var conditionResult;
      try {
        conditionResult = condition.apply(self, args);
      }
      catch (err) {
        throw new ContractConditionMetaError(condition, self, args, err);
      }
      if (!conditionResult) {
        throw new ContractConditionViolation(condition, self, args);
      }
    },
    verifyAll: function(conditions, self, args) {
      if (conditions) {
        conditions.forEach(function(condition) {this.verifyOne(condition, self, args);}, this);
      }
    },
    implementation: function(implFunction) {
      var contract = this;

      function contractFunction() {
        var extendedArgs = Array.prototype.slice.call(arguments);
        contract.verifyAll(contract.pre, this, arguments);
        var result;
        var exception;
        // TODO this should be dealt with better
        try {
          result = implFunction.apply(this, arguments);
        }
        catch (exc) {
          exception = exc;
        }
        extendedArgs.push(exception || result);
        if (exception) {
          contract.verifyAll(contract.exception, this, extendedArgs);
          throw exception;
        }
        contract.verifyAll(contract.post, this, extendedArgs);
        return result;
      }

      contractFunction.contract = contract;
      contractFunction.implementation = implFunction;
      // MUDO freeze seal

      return contractFunction;
    }
  };

  Contract.isAContractFunction = function(f) {
    return tc.typeOf(f) === "function" && f.contract instanceof Contract && tc.typeOf(f.implementation) === "function";
  };

  // MUDO temporary
  Contract.typeOf = tc.typeOf;
  Contract.isInteger = tc.isInteger;

  return Contract;
})();
