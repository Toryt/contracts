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

(function(factory) {
  "use strict";

  var dependencies = ["./../_private/util", "./ConditionError", "./AbstractContract"];

  if (typeof define === "function" && define.amd) {
    define(dependencies, factory);
  }
  else if (typeof exports === "object") {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(util, ConditionError, AbstractContract) {
  "use strict";

  /**
   * The condition could not be evaluated. There is probably a programming error in the condition itself.
   *
   * error must be optional
   * - to make it possible to use this as the prototype for more special types
   * - because in JavaScript, also undefined and null can be thrown
   * Therefor, a ConditionMetaError is also civilized if the error is falsy.
   *
   * @constructor
   */
  function ConditionMetaError(contractFunction, condition, self, args, error) {
    util.pre(this, function() {return AbstractContract.isAContractFunction(contractFunction);});
    util.pre(this, function() {return util.typeOf(condition) === "function";});
    util.pre(this, function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    ConditionError.apply(this, arguments);
    if (error) {
      Object.freeze(error);
    }
    util.setAndFreezeProperty(this, "error", error);
  }

  ConditionMetaError.prototype = new ConditionError(
    AbstractContract.root.abstract,
    function() {return "This is a dummy condition in the ConditionMetaError prototype.";},
    undefined,
    []
  );
  ConditionMetaError.prototype.constructor = ConditionMetaError;
  util.setAndFreezeProperty(ConditionMetaError.prototype, "name", ConditionMetaError.name);
  util.setAndFreezeProperty(ConditionMetaError.prototype, "error", null);
  util.defineFrozenDerivedProperty(
    ConditionMetaError.prototype,
    "message",
    function() {
      return "error occurred while evaluating " + util.conciseConditionRepresentation("condition", this.condition) +
             " while contract function " + this.contractFunction.displayName +
             " was called (" + this.error + ")";
    }
  );
  util.setAndFreezeProperty(
    ConditionMetaError.prototype,
    "getDetails",
    function() {
      return ConditionError.prototype.getDetails.call(this) + util.eol +
             "caused by:" + util.eol +
             util.extensiveThrownRepresentation(this.error);
    }
  );

  return ConditionMetaError;
}));
