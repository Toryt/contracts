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
  }
};


function Contract(pre, post) {
  this.pre = pre ? pre.slice() : [];
  this.post = post ? post.slice() : [];
  // MUDO seal freeze
}

Contract.prototype = {
  constructor: Contract,
  pre: [],
  post: [],
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
      contract.verify(contract.pre, this, arguments);
      var extendedArgs;
      try {
        var result = implFunction.apply(this, arguments);
        extendedArgs = Array.prototype.concat(arguments, [result]);
        contract.verify(contract.post, this, extendedArgs);
        return result;
      }
      catch(exception) {
        // TODO this should be dealt with better
        extendedArgs = Array.prototype.concat(arguments, [exception]);
        contract.verify(contract.post, this, extendedArgs);
        throw exception;
      }
    }

    contractFunction.contract = contract;
    contractFunction.implementation = implFunction;

    return contractFunction;
  }
};

Contract.isAContractFunction = function(f) {
  return tc.typeOf(f) === "function" && f.contract instanceof Contract && tc.typeOf(f.implementation) === "function";
};

module.exports = Contract;
