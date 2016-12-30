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
  var util = require("./../_private/util");

  /**
   * The condition could not be evaluated. There is probably a programming error in the condition itself.
   *
   * error must be optional
   * - to make it possible to use this as the prototype for more special types
   * - because in JavaScript, also undefined and null can be thrown
   * Therefor, a ConditionMetaError is also civilized if the error is falsy.
   */
  function ConditionMetaError(condition, self, args, error) {
    util.pre(this, function() {return util.typeOf(condition) === "function";});
    util.pre(this, function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    ConditionError.apply(this, arguments);
    if (error) {
      Object.freeze(error);
    }
    util.setAndFreezeProperty(this, "error", error);
  }

  ConditionMetaError.prototype = new ConditionError(
    function() {return "This is a dummy condition in the ConditionMetaError prototype."},
    undefined,
    []
  );
  ConditionMetaError.prototype.constructor = ConditionMetaError;
  ConditionMetaError.prototype.name = "Contract Condition Meta-Error";
  ConditionMetaError.prototype.error = null;
  Object.defineProperty(
    ConditionError.prototype,
    "stack",
    {
      configurable: true,
      enumerable: true,
      get: function() {
        var stack = this._stackSource.stack;
        stack += "Caused by:\n";
        stack += this.error && (this.error.stack || ("" + this.error));
        return stack;
      },
      set: undefined
    }
  );

  ConditionMetaError.createMessage = function(condition, self, args, error) {
    util.pre(function() {return util.typeOf(condition) === "function";});
    util.pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    return "An error occurred while evaluating " + condition +
           " when function " + "A FUNCTION" +
           " was called on " + self +
           " with arguments (" + Array.prototype.map.call(args, function(arg) {return "" + arg;}).join(", ") + "): " +
           error;
  };

  return ConditionMetaError;
})();
