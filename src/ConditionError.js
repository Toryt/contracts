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

  /* NOTE: Custom Error types are notoriously difficult in JavaScript.
     See, e.g.,
     - http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
     - http://pastebin.com/aRpPr5Sd
     - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
     - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/toString
     - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack
     - https://nodejs.org/api/errors.html
     - https://msdn.microsoft.com/en-us/library/hh699850%28v=vs.94%29.aspx?f=255&MSPPError=-2147217396

     The main problems are:
     - Calling Error() without new doesn't initialize this. It creates a new object, and does nothing with this.
       Error.call(this) does nothing with this.
     - The stack trace is filled out differently per platform, or not at all (older IE).
       Some platforms fill out the stack trace on throw (which seems to be correct). Other on creation of an
       Error. But, when following the regular inheritance pattern, this is at type definition time, where
       we want to create an Error-instance as prototype for a custom error type. That is obviously never
       the stack trace we want.
       Some platforms offer a method to fill out the stack trace.
       this.stack = "A String" does nothing on node.

     Errors support the following properties common over all platforms:
     - message
     - name
     - toString === name + ": " + message

     A file name, lineNumber and columnNumber is standard and supported on most platforms, and evolving.
     There is little or no documentation about how they are filled out.

     Most platforms do support a stack property, which is a multi-line string. The first line is the message.

     There are libraries to deal with these complexities, but different for node and browsers.
     Furthermore, the landscape is evolving.

     That we cannot call Error() to initialise a new custom error, is not a big problem. The standard syntax is
     new Error([message[, fileName[, lineNumber]]]). We can set these properties directly in our constructor.
     For fileName and lineNumber, we have the same problem as with the stack: we need a reference to somewhere else
     than where we create the custom error.
   */

  var util = require("./util");

  /**
   * Invariant:
   * - condition is mandatory, and always a Function
   * - self can be anything, and is optional
   * - args is mandatory, and an Arguments or Array instance
   *
   * MUDO better doc
   */
  function ConditionError(condition, self, args) {
    this._pre(function() {return util.typeOf(condition) === "function";});
    this._pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    var message = this.constructor.createMessage.apply(undefined, arguments);
    this._setAndFreezeProperty("message", message);
    this._setAndFreezeProperty("condition", condition);
    this._setAndFreezeProperty("self", self);
    this._setAndFreezeProperty("args", args);
    var stackSource = new Error(message);
    stackSource.name = this.name;
    Object.freeze(stackSource);
    this._setAndFreezeProperty("_stackSource", stackSource);
  }

  ConditionError.prototype = new Error("This is a dummy message in the ConditionError prototype.");
  ConditionError.prototype.constructor = ConditionError;
  ConditionError.prototype.name = "Contract Condition Error";
  ConditionError.prototype.isCivilized = function() {
    return !!(this.condition && this.args);
  };
  ConditionError.prototype._pre = function(condition) {
    util.pre(function() {return condition && util.typeOf(condition) === "function";});

    util.pre(this, condition);
  };
  ConditionError.prototype._setAndFreezeProperty = function(propertyName, value) {
    this._pre(function() {return propertyName && util.typeOf(propertyName) === "string";});

    util.setAndFreezeProperty(this, propertyName, value);
  };
  ConditionError.prototype.condition = null;
  ConditionError.prototype.self = null;
  ConditionError.prototype.args = null;
  ConditionError.prototype._stackSource = null;
  Object.defineProperty(
    ConditionError.prototype,
    "stack",
    {
      configurable: true,
      enumerable: true,
      get: function() {
        return this._stackSource.stack;
      },
      set: undefined
    }
  );

  /**
   * This method is called in the constructor to generate the message for the error being created.
   * It is called with the same arguments as the constructor.
   */
  ConditionError.createMessage = function(condition, self, args) {
    util.pre(function() {return util.typeOf(condition) === "function";});
    util.pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    return "Error concerning condition " + condition +
           " while function " + "A FUNCTION" + // MUDO FUNCTION
           " was called on " + self +
           " with arguments (" + Array.prototype.map.call(args, function(arg) {return "" + arg;}).join(", ") + ")";
  };

  return ConditionError;
})();
