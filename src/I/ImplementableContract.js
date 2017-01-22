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
  ImplementableContract.prototype.implementation = function(implFunction) {
    util.pre(this, function() {return implFunction && util.typeOf(implFunction) === "function";});

    var contract = this;
    Object.freeze(contract);

    var location = util.firstLocationOutsideLibrary();

    function contractFunction() {
      var extendedArgs = Array.prototype.slice.call(arguments);
      PreconditionViolation.prototype.verifyAll(contractFunction, contract.pre, this, arguments);
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
        ConditionViolation.prototype.verifyAll(contractFunction, contract.exception, this, extendedArgs);
        throw exception;
      }
      ConditionViolation.prototype.verifyAll(contractFunction, contract.post, this, extendedArgs);
      return result;
    }

    function bind() {
      var bound = Function.prototype.bind.apply(this, arguments);
      var boundImplementation = Function.prototype.bind.apply(this.implementation, arguments);
      util.setAndFreezeProperty(bound, "contract", this.contract);
      util.setAndFreezeProperty(bound, "implementation", boundImplementation);
      util.setAndFreezeProperty(bound, "location", location);
      Contract.defineContractFunctionDisplayName(bound);
      bound.bind = this.bind;
      return bound;
    }

    util.setAndFreezeProperty(contractFunction, "contract", contract);
    util.setAndFreezeProperty(contractFunction, "implementation", implFunction);
    util.setAndFreezeProperty(contractFunction, "location", location);
    Contract.defineContractFunctionDisplayName(contractFunction);
    contractFunction.bind = bind;

    return contractFunction;
  };

  return ImplementableContract;
})();
