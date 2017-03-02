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

  var util = require("./../_private/util");
  var AbstractContract = require("./AbstractContract");
  var ConditionError = require("./ConditionError");
  var PreconditionViolation = require("./PreconditionViolation");
  var PostconditionViolation = require("./PostconditionViolation");
  var ExceptionConditionViolation = require("./ExceptionConditionViolation");

  /**
   * The separation between AbstractContract and ImplementableContract is necessary to break a dependency
   * cycle with ConditionError.
   */
  function ImplementableContract(kwargs) {
    util.pre(function() {return !!kwargs;});
    util.pre(function() {return !kwargs.pre || util.typeOf(kwargs.pre) === "array";});
    util.pre(function() {return !kwargs.post || util.typeOf(kwargs.post) === "array";});
    util.pre(function() {return !kwargs.exception || util.typeOf(kwargs.exception) === "array";});

    AbstractContract.apply(this, arguments);
  }

  ImplementableContract.prototype = new AbstractContract({pre: [AbstractContract.falseCondition]});
  ImplementableContract.prototype.constructor = ImplementableContract;
  ImplementableContract.prototype.implementation = function(implFunction) {
    util.pre(this, function() {return implFunction && util.typeOf(implFunction) === "function";});

    var contract = this;
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
        ExceptionConditionViolation.prototype.verifyAll(contractFunction, contract.exception, this, extendedArgs);
        throw exception;
      }
      PostconditionViolation.prototype.verifyAll(contractFunction, contract.post, this, extendedArgs);
      return result;
    }

    AbstractContract.bless(contractFunction, contract, implFunction, location);

    return contractFunction;
  };

  return ImplementableContract;
})();
