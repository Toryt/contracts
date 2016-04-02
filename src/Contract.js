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

  var util = require("./util");
  var ConditionMetaError = require("./ConditionMetaError");
  var ConditionViolation = require("./ConditionViolation");

  function Contract(pre, post, exception) {
    util.setAndFreezeProperty(this, "pre", pre ? pre.slice() : []);
    util.setAndFreezeProperty(this, "post", post ? post.slice() : []);
    util.setAndFreezeProperty(this, "exception", exception ? exception.slice() : []);
  }

  Contract.prototype = {
    constructor: Contract,
    pre: [],
    post: [],
    isImplementedBy: function(f) {
      return Contract.isAContractFunction(f) && f.contract === this;
    },
    verifyOne: function(condition, self, args) {
      util.pre(this, function() {return condition && util.typeOf(condition) === "function";});
      util.pre(this, function() {return args && (util.typeOf(args) === "arguments" || util.typeOf(args) === "array");});

      var conditionResult;
      try {
        conditionResult = condition.apply(self, args);
      }
      catch (err) {
        var cme = new ConditionMetaError(condition, self, args, err);
        Object.freeze(cme);
        throw cme;
      }
      if (!conditionResult) {
        var cv = new ConditionViolation(condition, self, args);
        Object.freeze(cv);
        throw cv;
      }
    },
    verifyAll: function(conditions, self, args) {
      util.pre(this, function() {
        return conditions
               && util.typeOf(conditions) === "array"
               && conditions.every(function(c) {return c && util.typeOf(c) === "function";});});
      util.pre(this, function() {return args && (util.typeOf(args) === "arguments" || util.typeOf(args) === "array");});

      if (conditions) {
        conditions.forEach(function(condition) {this.verifyOne(condition, self, args);}, this);
      }
    },
    implementation: function(implFunction) {
      util.pre(this, function() {return implFunction && util.typeOf(implFunction) === "function";});

      var contract = this;
      Object.freeze(contract);

      function contractFunction() {
        var extendedArgs = Array.prototype.slice.call(arguments);
        contract.verifyAll(contract.pre, this, arguments);
        var result;
        var exception;
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

      util.setAndFreezeProperty(contractFunction, "contract", contract);
      util.setAndFreezeProperty(contractFunction, "implementation", implFunction);

      return contractFunction;
    }
  };

  Contract.isAContractFunction = function(f) {
    return util.typeOf(f) === "function"
           && f.contract instanceof Contract
           && util.isFrozenOwnProperty(f, "contract")
           && Object.isFrozen(f.contract)
           && util.typeOf(f.implementation) === "function"
           && util.isFrozenOwnProperty(f, "implementation");
  };

  return Contract;
})();
