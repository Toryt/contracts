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

  var util = require("./../_private/util");
  var Contract = require("./Contract");
  var path = require("path");

  var contractLibPath = path.dirname(module.filename);

  /**
   * ConditionError is the general supertype of all errors thrown by Toryt Contracts.
   * ConditionError itself is to be considered abstract.
   *
   * A ConditionError will try to describe as correctly as possible what went wrong. It is a communication
   * to developers.
   *
   * When preconditions are violated, the calling function is the culprit, or the contract is wrong. The developer
   * wants to know where the function was called in source code, and what the exact arguments were of the instance of
   * the call, and which precondition was violated in source code(which implies knowing which contract it is a part of).
   * When nominal or exceptional postconditions are violated, the implementation is the culprit, or the contract is
   * wrong. The developer wants to know what the exact arguments were of the instance of the call, which postcondition
   * was violated in source code (which implies knowing which contract it is a part of), and which implementation was
   * used in source code. The developer is probably interested in how the function was called in source code.
   * When there is an error in the condition, the contract is wrong. The developer want to know the above, depending
   * on the kind of condition that has an error.
   *
   * In general, we want to report
   * - which condition was violated, or has an error, in source code, which implies
   * -- of which contract, in source code
   * - in what circumstances, which implies
   * -- which implementation was used, in source code
   * -- which function called the contract function, in source code
   * -- which were the arguments, during execution
   *
   * The condition is usually short and anonymous. We will report the full implementation of the condition,
   * which might be multi-line.
   * The contract is an object, and there is no automatic way to assign recognizable names to objects.
   * // MUDO we can try to create a reference to the contract by creating an Error during construction, and getting
   * // it from the stack.
   *
   * The actual arguments can easily be listed.
   *
   * The implementation used is actually 2 functions: the supplied naked implementation, and the doctored contract
   * function, which embeds the supplied naked implementation in contract verifications. The latter is the function
   * called from outside. These are different instances of the same function definition in source code for all
   * contract functions. It is not informative to communicate about this source code to the developer. In ES2015
   * however, this function will have the relevant name. The naked implementation will often be nameless. Showing
   * the code is often not relevant, because it will often be rather long. There is however no way to create a
   * reference to the naked implementation. A reference in source code to the location where the contract function
   * is created helps the developer to find the contract function definition, where a reference to the naked
   * implementation, or the naked implementation itself, can be found. The name of the contract function, or, if there
   * is none, the name of the naked implementation, is used in communication.
   *
   * The calling function cannot be retrieved in modern Javascript. We can however create a call stack, through which
   * the developer can determine the calling function.
   *
   * Invariant:
   * - contractFunction, and always a Contract Function
   * - condition is mandatory, and always a Function
   * - self can be anything, and is optional
   * - args is mandatory, and an Arguments or Array instance
   *
   * MUDO better doc
   */
  function ConditionError(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(this, function() {return util.typeOf(condition) === "function";});
    util.pre(this, function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    var message = this.constructor.createMessage.apply(undefined, arguments);
    util.setAndFreezeProperty(this, "message", message);
    util.setAndFreezeProperty(this, "contractFunction", contractFunction);
    util.setAndFreezeProperty(this, "condition", condition);
    util.setAndFreezeProperty(this, "self", self);
    util.setAndFreezeProperty(this, "args", args);
    var stackSource = new Error(message);
    stackSource.name = this.name;
    Object.freeze(stackSource);
    util.setAndFreezeProperty(this, "_stackSource", stackSource);
  }

  ConditionError.prototype = new Error("This is a dummy message in the ConditionError prototype.");
  ConditionError.prototype.constructor = ConditionError;
  ConditionError.prototype.name = "Contract Condition Error";
  ConditionError.prototype.contractFunction = null;
  ConditionError.prototype.condition = null;
  ConditionError.prototype.self = null;
  ConditionError.prototype.args = null;
  ConditionError.prototype._stackSource = null;
  ConditionError.prototype.stackAddition = function() {return "";};
  Object.defineProperty(
    ConditionError.prototype,
    "stack",
    {
      configurable: true,
      enumerable: true,
      get: function() {
        var messageLines = util.nrOfLines(this.message); // start after the message
        var foundALineOutsideTheLibrary = false;
        var result = this._stackSource.stack
          .split(util.eol)
          .reduce(
            function(acc, line, index) {
              if (!foundALineOutsideTheLibrary &&
                  messageLines <= index &&
                  line.indexOf(contractLibPath) < 0 &&
                  0 <= line.indexOf("/")) {
                // we found the first line of code that uses this library, if we haven't found such a line earlier,
                // and we are past the message, and the line does not refer to this library or native code
                foundALineOutsideTheLibrary = true;
              }
              if (index < messageLines ||
                  (line.indexOf(contractLibPath) < 0 &&
                   (0 <= line.indexOf("/") || foundALineOutsideTheLibrary))) {
                // copy all the message lines, and the lines not referring to this library that are not referring to
                // native code, and the lines that are referring to native code once we encountered the first line
                // of non-native code that refers to code outside this library
                acc.push(line);
              }
              return acc;
            },
            []
          );
        return result.join(util.eol) + this.stackAddition();
      },
      set: undefined
    }
  );

  /**
   * This method is called in the constructor to generate the message for the error being created.
   * It is called with the same arguments as the constructor.
   */
  ConditionError.createMessage = function(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(function() {return util.typeOf(condition) === "function";});
    util.pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    var contractFunctionName = contractFunction.displayName || contractFunction.name || "<<unnnamed>>";
    return "Error concerning condition " + condition +
           " while contract function " + contractFunctionName +
           " was called on " + self +
           " with arguments (" + Array.prototype.map.call(args, function(arg) {return "" + arg;}).join(", ") + ")" +
           util.eol + "contract:" + contractFunction.contract.location +
           util.eol + "condition: " + condition +
           util.eol + "implementation:" + contractFunction.location +
           util.eol + "call stack:";
  };

  return ConditionError;
})();
