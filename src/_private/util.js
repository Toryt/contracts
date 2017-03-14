
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

  var dependencies = [];

  if (typeof define === 'function' && define.amd) {
    dependencies.push("module");
    define(dependencies, factory);
  }
  else if (typeof exports === 'object') {
    module.exports = factory.apply(undefined, dependencies.map(function(d) {return require(d);}));
  }
}(function(amdModule) {
  "use strict";

  /**
   * eol is always <code>\n</code> in modern browsers. On node, it depends on the platform, and is offered by
   * the os-module.
   */
  var eol = "\n";
  if (typeof exports === "object") {
    eol = require("os").EOL;
  }

  var path;
  if (typeof exports === "object") {
    path = require("path");
  }

  var dirSeparator = "/";
  var thisDirectory = ".";
  var parentDirectory = "..";

  function browserModuleLocation(amdModule) {
    var location = window.location.href;
    location = location.split(dirSeparator);
    if (0 <= location[location.length - 1].indexOf(".")) { // last entry is a file
      location.pop();
    }
    location = location.concat(amdModule.uri.split(dirSeparator));
    var dotLocation = location.indexOf(thisDirectory); // remove "this directory" path elements
    while (0 <= dotLocation) {
      location.splice(dotLocation, 1);
      dotLocation = location.indexOf(thisDirectory);
    }
    dotLocation = location.indexOf(parentDirectory); // remove "parent directory" path elements
    while (0 <= dotLocation) {
      location.splice(dotLocation - 1, 2);
      dotLocation = location.indexOf(parentDirectory);
    }
    return location.join(dirSeparator);
  }

  var fileName = (typeof module === "object") ? module.filename : browserModuleLocation(amdModule);

  function typeOf(obj) {
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

  /**
   * <p>Returns the directory name of a path, similar to the Unix dirname command.
   * For example:</p>
   * <pre>
   * path.dirname('/foo/bar/baz/asdf/quux');
   * // Returns: '/foo/bar/baz/asdf'
   * </pre>
   * <p>A <code>TypeError</code> is thrown if path is not a string.</p>
   * <p>This method is a wrapper around node's <code>path.dirname</code>, which is not available on the browser
   * directly.
   */
  var dirname = path
    ? path.dirname
    : function(path) {
        if (typeOf(path) !== "string") {
          throw new TypeError("path is not a string");
        }
        var result = path.split(dirSeparator);
        result.pop();
        return result.join(dirSeparator);
      };

  //noinspection MagicNumberJS
  var util = {

    /**
     * eol is always <code>\n</code> in modern browsers. On node, it depends on the platform.
     */
    eol: eol,

    contractLibPath: dirname(dirname(fileName)), // 2 directories up

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
    typeOf: typeOf,

    /**
     * p is a true primitive, i.e., not null, undefined, an object (which implies, not a Date, Math or JSON, nor any
     * Error, and not an array or arguments, and wrapped primitives), not a function. p is a true string, number or
     * boolean.
     */
    isPrimitive: function(p) {
      return (p !== null) && 0 <= ["number", "string", "boolean"].indexOf(typeof p);
    },

    isInteger: function(value) {
      return Number.isInteger
        ? Number.isInteger(value)
        : typeof value === "number"
          && isFinite(value)
          && Math.floor(value) === value;
    },

    pre: function(/*Object?*/ self, /*Function*/ condition) {
      var shiftedCondition = condition || self;
      var shiftedSelf = condition ? self : undefined;
      if (!shiftedCondition.apply(self)) {
        throw new Error("Precondition violation in Toryt Contracts: " + shiftedCondition);
      }
    },

    setAndFreezeProperty: function(obj, propName, value) {
      this.pre(function() {return !util.isPrimitive(obj);});
      this.pre(function() {return util.typeOf(propName) === "string";});

      Object.defineProperty(
        obj,
        propName,
        {
          configurable: false,
          enumerable: true,
          writable: false,
          value: value
        }
      );
    },

    defineConfigurableDerivedProperty: function(prototype, propertyName, derivation) {
      util.pre(function() {return !!prototype && !util.isPrimitive(prototype);});
      util.pre(function() {return util.typeOf(propertyName) === "string";});
      util.pre(function() {return util.typeOf(derivation) === "function";});

      Object.defineProperty(
        prototype,
        propertyName,
        {
          configurable: true,
          enumerable: true,
          get: derivation,
          set: undefined
        }
      );
    },

    defineFrozenDerivedProperty: function(prototype, propertyName, derivation) {
      util.pre(function() {return !!prototype && !util.isPrimitive(prototype);});
      util.pre(function() {return util.typeOf(propertyName) === "string";});
      util.pre(function() {return util.typeOf(derivation) === "function";});

      Object.defineProperty(
        prototype,
        propertyName,
        {
          configurable: false,
          enumerable: true,
          get: derivation,
          set: undefined
        }
      );
    },

    defineFrozenReadOnlyArrayProperty: function(prototype, propName, privatePropName) {
      this.pre(function() {return !util.isPrimitive(prototype);});
      this.pre(function() {return util.typeOf(propName) === "string";});
      this.pre(function() {return util.typeOf(privatePropName) === "string";});
      this.pre(function() {return propName !== privatePropName;});

      this.defineFrozenDerivedProperty(
        prototype,
        propName,
        function() {return this[privatePropName].slice();}
      );
    },

    isFrozenOwnProperty: function(obj, propName) {
      this.pre(function() {return obj !== null && obj !== undefined;});

      var descriptor = Object.getOwnPropertyDescriptor(obj, propName);
      return descriptor
             && descriptor.enumerable === true
             && descriptor.configurable === false
             && (descriptor.writable === false || (this.typeOf(descriptor.get) === "function" && !descriptor.set));
    },

    nrOfLines: function(str) {
      return ("" + str).split(this.eol).length;
    },

    isALocationOutsideLibrary: function(location) {
      if (this.typeOf(location) !== "string") {
        return false;
      }
      var lines = location.split(this.eol);
      return lines.length === 1
             && (lines[0].search(/^    at/) === 0 // node and chrome use "    at"
                 || ( // FF or Safari use [function_name@], but sometimes nothing
                      typeof window === "object"
                      && 0 <= lines[0].indexOf(window.location.protocol + "//" + window.location.host + "/")
                      && 0 <= lines[0].search(/:\d+:\d+$/))) // but they always end with line and column
             && 0 <= lines[0].indexOf("/")
             && lines[0].indexOf(this.contractLibPath) < 0;
    },

    /**
     * The first line from a stack trace created here that refers to code that is not inside this library,
     * and does not refer to native code. Returns the empty string if no such line is found.
     *
     * When this result is used as a line on its own, it is clickable to navigate to the referred source code
     * in most console.
     */
    firstLocationOutsideLibrary: function() {
      var stackSource = new Error();
      var stack = stackSource.stack.split(this.eol);
      stack = stack.slice(this.nrOfLines(stackSource)); // throw away the message lines
      for (var i = this.nrOfLines(stackSource); i < stack.length; i++) {
        // skip the message lines, and then look for the first line that refers to code not in this library,
        // that is not native code (i.e., the reference does contain a '/')
        if (0 <= stack[i].indexOf("/") && stack[i].indexOf(this.contractLibPath) < 0) {
          return stack[i];
        }
      }
      return ""; // could not find a line outside this library
    },

    /**
     * Input an error, and transform its stack so it only contains lines that refer to
     * code outside this library, and not to native code. The initial name and message is removed,
     * taking into account that the message could be multi-line.
     */
    stackOutsideThisLibrary: function(error) {
      util.pre(function() {return error instanceof Error;});
      util.pre(function() {return !!error.stack;});

      var messageLines = util.nrOfLines(error.message); // start after the message
      var foundALineOutsideTheLibrary = false;
      var result = error.stack
        .split(util.eol)
        .splice(messageLines) // everything after the message lines
        .reduce(
          function(acc, line, index) {
            if (!foundALineOutsideTheLibrary &&
                line.indexOf(util.contractLibPath) < 0 &&
                0 <= line.indexOf("/")) {
              // we found the first line of code that uses util library, if we haven't found such a line earlier,
              // and we are past the message, and the line does not refer to util library or native code
              foundALineOutsideTheLibrary = true;
            }
            if (line.indexOf(util.contractLibPath) < 0 &&
                 (0 <= line.indexOf("/") || foundALineOutsideTheLibrary)) {
              // copy all the message lines, and the lines not referring to util library that are not referring to
              // native code, and the lines that are referring to native code once we encountered the first line
              // of non-native code that refers to code outside util library
              acc.push(line);
            }
            return acc;
          },
          []
        );
      return result.join(util.eol);
    },

    maxLengthOfConciseRepresentation: 80,
    lengthOfEndConciseRepresentation: 15,
    conciseSeparator: " … ",

    /**
     * Returns a concise representation of <code>f</code> to be used in output.
     */
    conciseConditionRepresentation: function(prefix, f) {
      util.pre(function() {return util.typeOf(prefix) === "string";});

      var result = (f && f.displayName) || (prefix + " " + ((f && f.name) || f));
      result = result.replace(/\s\s+/g, " ");
      if (util.maxLengthOfConciseRepresentation < result.length) {
        var startLength = util.maxLengthOfConciseRepresentation
                          - util.lengthOfEndConciseRepresentation
                          - util.conciseSeparator.length;
        var start = result.slice(0, startLength);
        var end = result.slice(-util.lengthOfEndConciseRepresentation);
        result = start + util.conciseSeparator + end;
      }
      return result;
    },

    /**
     * <p>Returns a moderately normalized extensive, multiline representation of a <em>thrown</em>.
     * <p>Anything can be thrown, not only Error instances.</p>
     * <p>The stack of an Error is different in different environments. In node and Chrome, the first line of the
     *   stack is actually the toString of the Error, followed by the true stack, one call per line, that starts
     *   with <code>/^    at/</code>, followed by the path of the file where the call was made.
     *   In Firefox and Safari, the stack only contains the true stack, and the lines
     *   are the name of the called function (or the empty string for anonymous functions), followed by <code>@</code>,
     *   followed by the path of the file where the call was made.</p>
     * <p>If the <em>thrown</em> does not have a stack property, its standard string representation is returned.</p>
     * <p>If the <em>thrown</em> does have a stack property, its stack is returned. If the stack starts with
     *   the string representation of the <em>thrown</em>, that's it. Otherwise, the string representation of the
     *   <em>thrown</em> is added in the front on a separate line.
     */
    extensiveThrownRepresentation: function(thrown) {
      var thrownString = "" + thrown;
      var stack = thrown && thrown.stack;
      if (!stack) {
        return thrownString;
      }
      stack = "" + stack; // make sure it is a string
      /* On node and chrome, the stack starts with thrown.toString (name and message).
         On safari and FF, it doesn't: thrown.stack it is the pure stack. We add the toString ourselves */
      return (stack.indexOf(thrownString) === 0) ? stack : (thrownString + this.eol + stack);
    },

    /**
     * <p>Returns the directory name of a path, similar to the Unix dirname command.
     * For example:</p>
     * <pre>
     * path.dirname('/foo/bar/baz/asdf/quux');
     * // Returns: '/foo/bar/baz/asdf'
     * </pre>
     * <p>A <code>TypeError</code> is thrown if path is not a string.</p>
     * <p>This method is a wrapper around node's <code>path.dirname</code>, which is not available on the browser
     * directly.
     */
    dirname: dirname,

    browserModuleLocation: browserModuleLocation
  };

  return util;
}));
