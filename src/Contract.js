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

  // MUDO add meta-preconditions

  var util = require("./util");
  var ConditionMetaError = require("./ConditionMetaError");
  var ConditionViolation = require("./ConditionViolation");

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
        throw new ConditionMetaError(condition, self, args, err);
      }
      if (!conditionResult) {
        throw new ConditionViolation(condition, self, args);
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
    return util.typeOf(f) === "function"
           && f.contract instanceof Contract
           && util.typeOf(f.implementation) === "function";
  };

  return Contract;
})();
