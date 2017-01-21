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
   * A ConditionError is a communication to developers, through which Toryt Contracts tries to describe as correctly
   * as possible what went wrong. The error reports a contract violation, or an error in a contract condition.
   * We assume the Toryt Contracts code itself will not fail.
   *
   * In general, we want to report to the developer:
   * <ul>
   *   <li>which condition was violated, or has an error, in source code, which implies knowing
   *     <ul>
   *       <li>of which contract the condition is a part of</li>
   *     </ul>
   *   </li>
   *   <li>in what circumstances the error occurred, which implies knowing
   *     <ul>
   *       <li>where the contract function was called, in source code, which implies knowing
   *         <ul>
   *           <li>which function called the contract function, and<li>
   *         </ul>
   *       </li>
   *       <li>which were were the arguments of the call of the contract function, during execution of this
   *         function call instance, and</li>
   *       <li>which contract function was called, which implies knowing
   *         <ul>
   *           <li>what the contract of the called contract function is, and<li>
   *           <li>which implementation of the contract was called.<li>
   *         </ul>
   *       </li>
   *     </ul>
   *   </li>
   * </ul>
   *
   * The condition is usually a short and anonymous JavaScript function. We will report the full implementation of the
   * condition, which might be multi-line.
   *
   * The contract is an object, and there is no automatic way to assign recognizable names to objects.
   * A contract does however have a `location` property that stores a line from a stacktrace that, in most JavaScript
   * engines, contains a reference to where the contract is created in source code.
   *
   * The actual arguments can easily be listed.
   *
   * The called contract function is actually 2 functions: the supplied naked implementation, and the doctored contract
   * function, which embeds the supplied naked implementation in contract verifications.
   *
   * The latter is the function called from outside. All doctored contract functions are different instances of the
   * same function definition in source code. It is not informative to communicate about this source code to the
   * developer. In ES2015 however, this function will have the relevant name. A contract function does have a
   * `location` property that stores a line from a stacktrace that, in most JavaScript engines, contains a reference to
   * where the contract function is created in source code.
   * The name of the contract function, or, if does not have a name, the name of the naked implementation, if that has
   * one, is used in communication, via the contract function display name.
   *
   * The naked implementation will often be nameless. Showing the code is not relevant, because it will often be rather
   * long. There is no way to create a reference to the naked implementation. The reference to where the contract
   * function is created in source code in the contract function `location` property will show the developer which
   * implementation is used. The implementation is either defined there, or the developer can navigate from there to
   * the implementation definition in a good IDEA.
   * The implementation function display name is used in communication.
   *
   * The calling function cannot be retrieved in modern Javascript. ConditionError instances do however create a call
   * stack through which the developer can determine the calling function.
   *
   * Instances should be frozen before they are thrown.
   *
   * <h3>Invariants</h3>
   * <ul>
   *   <li>`contractFunction` is a frozen mandatory property, and refers to a contract function</li>
   *   <li>`condition` is a frozen mandatory property, and refers to a function</li>
   *   <li>`self` is a frozen property; it can be anything, also `null` or `undefined`</li>
   *   <li>`args` is a frozen property, and refers to an Array or Arguments instance</li>
   *   <li>`name` is a mandatory property, and refers to a string</li>
   *   <li>`message` is a frozen mandatory property, and refers to a string</li>
   *   <li>`stackAddition` is a mandatory property, and refers to a function</li>
   *   <li>`stack` is a read-only property, that returns a string, that starts with the instances `name`, the
   *     string ": ", and `message`, and is followed by stack code references, that do no contain references
   *     to the inner workings of the Toryt Contracts library, and the result of calling `stackAddition()`
   *     on the instance, coerced to a string.</li>
   * </ul>
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
   *
   * This is not a prototype method, because it is used in the constructor.
   */
  ConditionError.createMessage = function(contractFunction, condition, self, args) {
    util.pre(this, function() {return Contract.isAContractFunction(contractFunction);});
    util.pre(function() {return util.typeOf(condition) === "function";});
    util.pre(function() {return util.typeOf(args) === "arguments" || util.typeOf(args) === "array";});

    var conditionRepr = condition.displayName || ("condition " + (condition.name || condition));
    var contractFunctionName = contractFunction.displayName
                               || "contract function " + contractFunction.name
                               || "an unnamed contract function";
    return conditionRepr +
           " failed while " + contractFunctionName +
           " was called on " + self +
           " with arguments (" + Array.prototype.map.call(args, function(arg) {return "" + arg;}).join(", ") + ")" +
           util.eol + "contract:" + contractFunction.contract.location +
           util.eol + "condition: " + condition +
           util.eol + "contract function:" + contractFunction.location +
           util.eol + "this: " + self +
           util.eol + "arguments: (" + args.length + ")" +
           Array.prototype.map.call(args, function(arg, index) {return util.eol + "    " + index + ": " + arg;}) +
           util.eol + "call stack:";
  };

  return ConditionError;
})();
